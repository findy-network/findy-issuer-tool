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
  envName: string;
  appName: string;
}

interface ElasticBeanstalkDeployActionProps {
  id: string;
  ebsApplicationName: string;
  ebsEnvironmentName: string;
  //input: Artifact;
  role?: IRole;
}

class ElasticBeanstalkDeployAction implements IAction {
  readonly actionProperties: ActionProperties;
  private readonly props: ElasticBeanstalkDeployActionProps;

  constructor(props: ElasticBeanstalkDeployActionProps) {
    this.actionProperties = {
      ...props,
      category: ActionCategory.DEPLOY,
      actionName: `${props.id}-elasticbeanstalk-deploy-action`,
      owner: "AWS",
      provider: "ElasticBeanstalk",

      artifactBounds: {
        //minInputs: 1,
        //maxInputs: 1,
        minInputs: 0,
        maxInputs: 0,
        minOutputs: 0,
        maxOutputs: 0,
      },
      //inputs: [props.input],
    };
    this.props = props;
  }
  bind(
    scope: Construct,
    stage: IStage,
    options: ActionBindOptions
  ): ActionConfig {
    options.bucket.grantRead(options.role);
    return {
      configuration: {
        ApplicationName: this.props.ebsApplicationName,
        EnvironmentName: this.props.ebsEnvironmentName,
      },
    };
  }

  onStateChange(name: string, target?: IRuleTarget, options?: RuleProps): Rule {
    throw new Error("not supported");
  }
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
            ISSUER_TOOL_APP_NAME: {
              value: id,
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

    const deployRole = new Role(this, `issuer-tool-deploy-role`, {
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
    ebPolicy.addActions("elasticbeanstalk:*");
    ebPolicy.addResources("*");
    deployRole.addToPolicy(ebPolicy);

    new ElasticBeanstalkDeployAction({
      id: "issuer-tool",
      ebsEnvironmentName: envName,
      ebsApplicationName: appName,
      //input: build_output_artifact,
      role: deployRole,
    }),
      deployStage.addAction(
        new CodeBuildAction({
          actionName: `${id}-copy-front`,
          project: new PipelineProject(this, `issuer-tool-copy-front`, {
            projectName: `${id}-copy-front`,
            role: deployRole,
            buildSpec: BuildSpec.fromObject({
              version: "0.2",
              phases: {
                build: {
                  commands: [
                    `V1=$(curl https://${domainName}/version.txt)`,
                    `V2=$(cat ./build/version.txt)`,
                    `if [ "$V1" != "$V2" ]; then aws s3 sync --delete ./build s3://${frontendBucket.bucketName}; fi`,
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
