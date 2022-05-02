import { Construct } from "constructs";
import { CfnOutput } from "aws-cdk-lib";
import {
  CfnApplication,
  CfnApplicationVersion,
  CfnEnvironment,
} from "aws-cdk-lib/aws-elasticbeanstalk";
import { CfnTable } from "aws-cdk-lib/aws-dynamodb";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";
import {
  CfnInstanceProfile,
  Effect,
  PolicyDocument,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";

interface BackendProps {
  readonly account: string;
}

export class Backend extends Construct {
  public readonly appName: string;
  public readonly envName: string;
  public readonly cnamePrefix: string;

  constructor(scope: Construct, id: string, props: BackendProps) {
    super(scope, id);

    // Elastic Beanstalk application
    const app = new CfnApplication(this, `${id}-app`, {
      applicationName: `${id}-app`,
      resourceLifecycleConfig: {
        serviceRole: `arn:aws:iam::${props.account}:role/aws-service-role/elasticbeanstalk.amazonaws.com/AWSServiceRoleForElasticBeanstalk`,
        versionLifecycleConfig: {
          maxAgeRule: {
            enabled: true,
            maxAgeInDays: 3,
          },
        },
      },
    });

    // Elastic Beanstalk application version
    const version = new CfnApplicationVersion(this, `${id}-app-version`, {
      applicationName: app.applicationName!,
      sourceBundle: {
        s3Bucket: process.env.CONF_BUCKET_NAME || "conf-bucket",
        s3Key: "Dockerrun.zip",
      },
    });
    version.addDependsOn(app);

    // Dynamo DB table for app data
    const table = new CfnTable(this, `${id}-table`, {
      tableName: "issuerToolData",
      attributeDefinitions: [
        { attributeName: "type", attributeType: "S" },
        { attributeName: "id", attributeType: "S" },
      ],
      keySchema: [
        { attributeName: "type", keyType: "HASH" },
        { attributeName: "id", keyType: "RANGE" },
      ],
      provisionedThroughput: {
        readCapacityUnits: 5,
        writeCapacityUnits: 5,
      },
    });

    // Access rights for the Elastic Beanstalk application
    const secret = Secret.fromSecretNameV2(
      this,
      `issuer-tool-secret-name`,
      "issuer-tool"
    );
    const policyDoc = new PolicyDocument({
      statements: [
        new PolicyStatement({
          sid: "AllowDynamoDb",
          effect: Effect.ALLOW,
          actions: ["dynamodb:*"],
          resources: [table.attrArn],
        }),
        new PolicyStatement({
          sid: "AllowCloudWatch",
          effect: Effect.ALLOW,
          actions: [
            "logs:CreateLogGroup",
            "logs:CreateLogStream",
            "logs:GetLogEvents",
            "logs:PutLogEvents",
            "logs:DescribeLogGroups",
            "logs:DescribeLogStreams",
            "logs:PutRetentionPolicy",
          ],
          resources: ["*"],
        }),
        new PolicyStatement({
          sid: "AllowS3Read",
          effect: Effect.ALLOW,
          actions: ["s3:GetObject"],
          resources: [`${process.env.CONF_BUCKET_ARN}/*`],
        }),
        new PolicyStatement({
          sid: "AllowSecretRead",
          effect: Effect.ALLOW,
          actions: ["secretsmanager:GetSecretValue"],
          resources: [`${secret.secretArn}*`],
        }),
      ],
      // TODO: do we need allow security group?
    });
    const roleName = `${id}-instance-profile-role`;
    const instanceProfileRole = new Role(this, roleName, {
      roleName,
      assumedBy: new ServicePrincipal("ec2.amazonaws.com"),
      inlinePolicies: { "issuer-tool-policy": policyDoc },
    });
    instanceProfileRole.assumeRolePolicy?.addStatements(
      new PolicyStatement({
        effect: Effect.ALLOW,
        principals: [new ServicePrincipal("ec2.amazonaws.com")],
        actions: ["sts:AssumeRole"],
      })
    );

    const instanceProfile = new CfnInstanceProfile(
      this,
      "issuer-tool-instance-profile",
      {
        instanceProfileName: roleName,
        path: "/",
        roles: [instanceProfileRole.roleName],
      }
    );

    // Elastic Beanstalk environment
    const env = new CfnEnvironment(this, `${id}-environment`, {
      applicationName: version.applicationName,
      environmentName: version.applicationName,
      versionLabel: version.ref,
      cnamePrefix: "issuer-tool",
      solutionStackName:
        "64bit Amazon Linux 2018.03 v2.17.7 running Docker 20.10.7-ce",
      optionSettings: [
        {
          namespace: "aws:autoscaling:launchconfiguration",
          optionName: "IamInstanceProfile",
          value: instanceProfile.ref,
        },
        {
          namespace: "aws:elasticbeanstalk:environment",
          optionName: "EnvironmentType",
          value: "SingleInstance",
        },
        {
          namespace: "aws:elasticbeanstalk:environment",
          optionName: "EnvironmentType",
          value: "SingleInstance",
        },
        {
          namespace: "aws:autoscaling:asg",
          optionName: "MinSize",
          value: "1",
        },
        {
          namespace: "aws:autoscaling:asg",
          optionName: "MaxSize",
          value: "1",
        },
      ],
    });

    this.envName = env.environmentName!;
    this.appName = version.applicationName!;
    this.cnamePrefix = env.cnamePrefix!;
  }
}
