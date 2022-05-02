import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  CodeBuildStep,
  CodePipeline,
  CodePipelineSource,
} from "aws-cdk-lib/pipelines";
import { aws_codebuild as codebuild, aws_logs as logs } from "aws-cdk-lib";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Bucket, BlockPublicAccess, IBucket } from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { writeFileSync, mkdirSync } from "fs";
import { execSync } from "child_process";

import { InfraPipelineStage } from "./pipeline-stage";

interface InfraPipelineProperties extends cdk.StackProps {
  skipConfigCopy?: boolean;
}

const environmentVariables: Record<string, codebuild.BuildEnvironmentVariable> =
  {
    DOMAIN_NAME: {
      type: codebuild.BuildEnvironmentVariableType.PARAMETER_STORE,
      value: "/findy-issuer-tool/domain-name",
    },
    SUB_DOMAIN_NAME: {
      type: codebuild.BuildEnvironmentVariableType.PARAMETER_STORE,
      value: "/findy-issuer-tool/sub-domain-name",
    },
    WALLET_DOMAIN_NAME: {
      type: codebuild.BuildEnvironmentVariableType.PARAMETER_STORE,
      value: "/findy-issuer-tool/wallet-domain-name",
    },
  };

export class InfraPipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: InfraPipelineProperties) {
    super(scope, id, props);

    // Create configuration bucket for storing EB configuration files
    const confBucket = this.createConfigBucket(id, props.skipConfigCopy);

    // Create pipeline
    const pipeline = this.createPipeline(confBucket);

    // Add app to pipeline
    const deploy = new InfraPipelineStage(this, "Deploy", {
      env: props.env,
    });
    const deployStage = pipeline.addStage(deploy);

    // Add EB application update step
    deployStage.addPost(this.createEbUpdateStep(id, deploy));

    // Add frontend build step
    const frontBuildStep = this.createFrontendBuildStep();
    deployStage.addPost(frontBuildStep);

    // Add frontend deploy step
    deployStage.addPost(this.createFrontendDeployStep(frontBuildStep));

    // manually adjust logs retention
    pipeline.node.findAll().forEach((construct, index) => {
      if (construct instanceof codebuild.Project) {
        new logs.LogRetention(this, `LogRetention${index}`, {
          logGroupName: `/aws/codebuild/${construct.projectName}`,
          retention: logs.RetentionDays.ONE_MONTH,
        });
      }
    });
  }

  createConfigBucket(id: string, skipCopy: boolean = false) {
    const filesPath = "./.config";
    const confBucket = new Bucket(this, `${id}-conf-bucket`, {
      bucketName: `${id}-conf-bucket`.toLowerCase(),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    });

    const dockerRunJson = {
      AWSEBDockerrunVersion: "1",
      Image: {
        Name: "ghcr.io/findy-network/findy-issuer-tool",
        Update: "true",
      },
      Ports: [
        {
          ContainerPort: 3001,
          HostPort: 3001,
        },
      ],
    };
    const dockerRunPath = `${filesPath}/Dockerrun.aws.json`;
    mkdirSync(filesPath, { recursive: true });
    writeFileSync(dockerRunPath, JSON.stringify(dockerRunJson));
    execSync(`zip -r -j ${filesPath}/Dockerrun.zip ${dockerRunPath}`);
    execSync(`zip -r ${filesPath}/Dockerrun.zip .ebextensions`);

    if (!skipCopy) {
      new BucketDeployment(this, `${id}-bucket-deployment`, {
        sources: [Source.asset(filesPath)],
        destinationBucket: confBucket,
      });
    }
    return confBucket;
  }

  createPipeline(confBucket: IBucket) {
    const githubConnectionArn = StringParameter.valueForStringParameter(
      this,
      "/findy-issuer-tool/github-connection-arn"
    );

    const pipeline = new CodePipeline(this, "Pipeline", {
      pipelineName: "FindyIssuerToolPipeline",
      synth: new CodeBuildStep("SynthStep", {
        input: CodePipelineSource.connection(
          "findy-network/findy-issuer-tool",
          "master",
          {
            connectionArn: githubConnectionArn, // Created using the AWS console
          }
        ),
        installCommands: ["npm install -g aws-cdk"],
        buildEnvironment: {
          environmentVariables: {
            CDK_CONTEXT_JSON: {
              type: codebuild.BuildEnvironmentVariableType.PARAMETER_STORE,
              value: "/findy-issuer-tool/cdk-context",
            },
          },
        },
        commands: [
          "cd infra",
          `echo "$CDK_CONTEXT_JSON" > cdk.context.json`,
          "cat cdk.context.json",
          "npm ci",
          "npm run build",
          "npx cdk synth",
          "npm run pipeline:context",
        ],
        rolePolicyStatements: [
          new PolicyStatement({
            actions: ["ssm:PutParameter"],
            resources: [
              `arn:aws:ssm:${this.region}:${this.account}:parameter/findy-issuer-tool*`,
            ],
          }),
        ],
        primaryOutputDirectory: "infra/cdk.out",
      }),
      codeBuildDefaults: {
        buildEnvironment: {
          environmentVariables: {
            ...environmentVariables,
            CONF_BUCKET_NAME: {
              type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
              value: confBucket.bucketName,
            },
            CONF_BUCKET_ARN: {
              type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
              value: confBucket.bucketArn,
            },
          },
        },
      },
    });

    return pipeline;
  }

  createEbUpdateStep(id: string, deploy: InfraPipelineStage) {
    const deployRole = new Role(this, `${id}-deploy-role`, {
      assumedBy: new ServicePrincipal("codebuild.amazonaws.com"),
    });

    const ebPolicy = new PolicyStatement();
    ebPolicy.addActions(
      "elasticbeanstalk:*",
      "ec2:*",
      "ecr:*",
      "autoscaling:*",
      "cloudformation:*",
      "logs:*",
      "iam:PutRolePolicy",
      "s3:PutObject",
      "s3:PutObjectAcl",
      "s3:ListBucket",
      "s3:DeleteObject",
      "s3:Get*",
      "s3:CreateBucket"
    );
    ebPolicy.addResources("*");
    deployRole.addToPolicy(ebPolicy);

    return new CodeBuildStep("DeployBackendStep", {
      projectName: "DeployBackend",
      commands: [
        `VERSION="$(./infra/tools/version.sh ./api)-$(date +%s)"`,
        `aws elasticbeanstalk create-application-version --application-name $APP_NAME --version-label $VERSION --source-bundle S3Bucket=$CONF_BUCKET_NAME,S3Key=Dockerrun.zip`,
        `aws elasticbeanstalk update-environment --environment-name $ENV_NAME --version-label $VERSION`,
      ],
      envFromCfnOutputs: {
        APP_NAME: deploy.appName,
        ENV_NAME: deploy.envName,
      },
      role: deployRole,
    });
  }

  createFrontendBuildStep() {
    return new CodeBuildStep("BuildFrontendStep", {
      projectName: "BuildFrontend",
      commands: [
        "apk add bash",
        "cd frontend",
        "npm ci",
        "npm run build",
        "cd ..",
        "npm ci",
        "npm run licenses:report",
      ],
      buildEnvironment: {
        buildImage: codebuild.LinuxBuildImage.fromDockerRegistry(
          "node:16.14.2-alpine3.15"
        ),
        environmentVariables: {
          API_URL: {
            value: `https://${process.env.SUB_DOMAIN_NAME}.${process.env.DOMAIN_NAME}`,
          },
          DEFAULT_WEB_WALLET_LABEL: {
            value: "Findy Web Wallet",
          },
          DEFAULT_WEB_WALLET_URL: {
            value: `https://${process.env.WALLET_DOMAIN_NAME}/connect/`,
          },
        },
      },
      primaryOutputDirectory: "frontend/build",
    });
  }

  createFrontendDeployStep(frontBuildStep: CodeBuildStep) {
    return new CodeBuildStep("DeployFrontendStep", {
      input: frontBuildStep.primaryOutput,
      projectName: "DeployFrontend",
      commands: [
        `V1=$(curl https://$SUB_DOMAIN_NAME.$DOMAIN_NAME/version.txt)`,
        `V2=$(cat ./version.txt)`,
        `if [ "$V1" != "$V2" ]; then aws s3 sync --delete . s3://$SUB_DOMAIN_NAME.$DOMAIN_NAME; fi`,
      ],
      rolePolicyStatements: [
        new PolicyStatement({
          actions: ["s3:Put*", "s3:Delete*", "s3:Get*", "s3:List*"],
          resources: ["*"],
        }),
      ],
    });
  }
}
