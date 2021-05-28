import {
  Role,
  ServicePrincipal,
  ManagedPolicy,
  PolicyStatement,
  IRole,
} from "@aws-cdk/aws-iam";
import * as cdk from "@aws-cdk/core";
import {
  ActionBindOptions,
  ActionCategory,
  ActionConfig,
  ActionProperties,
  Artifact,
  IAction,
  IStage,
  Pipeline,
} from "@aws-cdk/aws-codepipeline";
import {
  BuildSpec,
  PipelineProject,
  LinuxBuildImage,
  BuildEnvironmentVariableType,
} from "@aws-cdk/aws-codebuild";
import {
  CodeBuildAction,
  GitHubSourceAction,
  GitHubTrigger,
} from "@aws-cdk/aws-codepipeline-actions";

import { IBucket } from "@aws-cdk/aws-s3";
import { Construct } from "@aws-cdk/core";
import { IRuleTarget, Rule, RuleProps } from "@aws-cdk/aws-events";

export interface IssuerToolPipelineStackProps extends cdk.StackProps {
  ecrURL: string;
  tokenName: string;
  domainName: string;
  walletDomainName: string;
  githubClientId: string;
  frontendBucket: IBucket;
  confBucket: IBucket;
  envName: string;
  appName: string;
}

export class IssuerToolPipelineStack extends cdk.Stack {
  constructor(
    scope: cdk.Construct,
    id: string,
    props: IssuerToolPipelineStackProps
  ) {
    super(scope, `${id}-pipeline`, props);

    const {
      ecrURL,
      tokenName,
      domainName,
      walletDomainName,
      githubClientId,
      frontendBucket,
      confBucket,
      envName,
      appName,
    } = props;

    const tokenSecret = cdk.SecretValue.secretsManager(tokenName);
    const projectName = `${id}-pipeline`;
    const pipeline = new Pipeline(this, projectName, {
      pipelineName: projectName,
      restartExecutionOnUpdate: true,
    });

    const pushRole = new Role(this, `${id}-build-role`, {
      assumedBy: new ServicePrincipal("codebuild.amazonaws.com"),
    });
    pushRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName(
        "AmazonEC2ContainerRegistryPowerUser"
      )
    );

    const sourceStage = pipeline.addStage({
      stageName: "Source",
    });
    const buildStage = pipeline.addStage({
      stageName: "Build",
    });
    const deployStage = pipeline.addStage({
      stageName: "Deploy",
    });

    const sources = new Artifact();

    sourceStage.addAction(
      new GitHubSourceAction({
        owner: "findy-network",
        repo: "findy-issuer-tool",
        oauthToken: tokenSecret,
        trigger: GitHubTrigger.WEBHOOK,
        branch: "master",
        actionName: `${id}-checkout`,
        output: sources,
      })
    );

    const ecrRootURL = `${this.account}.dkr.ecr.${this.region}.amazonaws.com`;
    buildStage.addAction(
      new CodeBuildAction({
        actionName: `${id}-build-image`,
        project: new PipelineProject(this, `${id}-build-image`, {
          projectName: `${id}-build-image`,
          buildSpec: BuildSpec.fromObject({
            version: "0.2",
            phases: {
              build: {
                commands: [
                  'echo "//npm.pkg.github.com/:_authToken=$GITHUB_TOKEN\n@findy-network:registry=https://npm.pkg.github.com" > ./api/.npmrc',
                  "./infra/scripts/push-to-ecr.sh",
                ],
              },
            },
          }),
          environmentVariables: {
            ISSUER_TOOL_SERVER_CERT_PATH: {
              value: "",
            },
            GITHUB_TOKEN: {
              value: tokenName,
              type: BuildEnvironmentVariableType.SECRETS_MANAGER,
            },
            ISSUER_TOOL_ECR_ROOT_URL: {
              value: ecrRootURL,
            },
            ISSUER_TOOL_ECR_IMAGE_NAME: {
              value: ecrURL.replace(`${ecrRootURL}/`, ""),
            },
          },
          role: pushRole,
          environment: {
            privileged: true,
          },
        }),
        input: sources,
      })
    );

    const frontendArtifact = new Artifact();
    buildStage.addAction(
      new CodeBuildAction({
        actionName: `${id}-build-front`,
        project: new PipelineProject(this, `${id}-build-front`, {
          projectName: `${projectName}-front`,
          environment: {
            buildImage: LinuxBuildImage.fromDockerRegistry(
              "node:14.16.0-alpine3.13"
            ),
          },
          buildSpec: BuildSpec.fromObject({
            version: "0.2",
            phases: {
              build: {
                commands: [
                  "apk add bash",
                  "cd frontend",
                  "npm ci",
                  "npm run build",
                  "cd ..",
                  "npm ci",
                  "npm run licenses:report",
                ],
              },
            },
            artifacts: {
              files: ["./frontend/build/**/*"],
            },
          }),
          environmentVariables: {
            API_URL: {
              value: `https://${domainName}`,
            },
            GITHUB_CLIENT_ID: {
              value: githubClientId,
            },
            DEFAULT_WEB_WALLET_LABEL: {
              value: "Findy Web Wallet",
            },
            DEFAULT_WEB_WALLET_URL: {
              value: `https://${walletDomainName}/connect/`,
            },
          },
        }),
        input: sources,
        outputs: [frontendArtifact],
      })
    );

    const deployRole = new Role(this, `${id}-deploy-role`, {
      assumedBy: new ServicePrincipal("codebuild.amazonaws.com"),
    });
    const policyStatement = new PolicyStatement();
    policyStatement.addActions(
      ...["s3:Put*", "s3:Delete*", "s3:Get*", "s3:List*"]
    );
    policyStatement.addResources(
      ...[`${frontendBucket.bucketArn}/*`, `${frontendBucket.bucketArn}`]
    );
    deployRole.addToPolicy(policyStatement);

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

    const confPolicy = new PolicyStatement();
    confPolicy.addActions(...["s3:Get*"]);
    confPolicy.addResources(...[`${confBucket.bucketArn}/*`]);
    deployRole.addToPolicy(confPolicy);

    deployStage.addAction(
      new CodeBuildAction({
        actionName: `${id}-update-eb`,
        project: new PipelineProject(this, `${id}-update-app`, {
          projectName: `${id}-update-eb`,
          role: deployRole,
          buildSpec: BuildSpec.fromObject({
            version: "0.2",
            phases: {
              build: {
                commands: [
                  `VERSION=$(./infra/scripts/version.sh ./api)`,
                  `aws elasticbeanstalk create-application-version --application-name ${appName} --version-label $VERSION --source-bundle S3Bucket=${confBucket.bucketName},S3Key=Dockerrun.zip`,
                  `aws elasticbeanstalk update-environment --environment-name ${envName} --version-label $VERSION`,
                ],
              },
            },
          }),
          environmentVariables: {
            ISSUER_TOOL_APP_NAME: {
              value: id,
            },
          },
        }),
        input: sources,
      })
    );
    deployStage.addAction(
      new CodeBuildAction({
        actionName: `${id}-copy-front`,
        project: new PipelineProject(this, `${id}-copy-front`, {
          projectName: `${id}-copy-front`,
          role: deployRole,
          buildSpec: BuildSpec.fromObject({
            version: "0.2",
            phases: {
              build: {
                commands: [
                  `V1=$(curl https://${domainName}/version.txt)`,
                  `V2=$(cat ./frontend/build/version.txt)`,
                  `if [ "$V1" != "$V2" ]; then aws s3 sync --delete ./frontend/build s3://${frontendBucket.bucketName}; fi`,
                ],
              },
            },
          }),
        }),
        input: frontendArtifact,
      })
    );
  }
}
