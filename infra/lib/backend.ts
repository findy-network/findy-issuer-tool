import * as cdk from "@aws-cdk/core";
import { IBucket } from "@aws-cdk/aws-s3";
import { IHostedZone } from "@aws-cdk/aws-route53";

import {
  CfnApplication,
  CfnApplicationVersion,
  CfnEnvironment,
} from "@aws-cdk/aws-elasticbeanstalk";
import {
  CfnInstanceProfile,
  Effect,
  ManagedPolicy,
  PolicyDocument,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from "@aws-cdk/aws-iam";
import { CfnTable, Table } from "@aws-cdk/aws-dynamodb";
import { Secret } from "@aws-cdk/aws-secretsmanager";

export interface IssuerToolBackendStackProps extends cdk.StackProps {
  prod: boolean;
  ecrURL: string;
  bucket: IBucket;
}

export class IssuerToolBackendStack extends cdk.Stack {
  public readonly envDomain: string;
  public readonly envName: string;
  public readonly appName: string;
  constructor(
    scope: cdk.Construct,
    id: string,
    props: IssuerToolBackendStackProps
  ) {
    super(scope, `${id}-backend`, props);
    const { bucket } = props;

    const app = new CfnApplication(this, `${id}-app`, {
      applicationName: `${id}-app`,
      resourceLifecycleConfig: {
        serviceRole: `arn:aws:iam::${this.account}:role/aws-service-role/elasticbeanstalk.amazonaws.com/AWSServiceRoleForElasticBeanstalk`,
        versionLifecycleConfig: {
          maxAgeRule: {
            enabled: true,
            maxAgeInDays: 3,
          },
        },
      },
    });
    const version = new CfnApplicationVersion(this, `${id}-app-version`, {
      applicationName: app.applicationName!,
      sourceBundle: {
        s3Bucket: bucket.bucketName,
        s3Key: "Dockerrun.zip",
      },
    });
    version.addDependsOn(app);

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

    const policy = ManagedPolicy.fromAwsManagedPolicyName(
      "AmazonEC2ContainerRegistryReadOnly"
    );
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
          resources: [`${bucket.bucketArn}/*`],
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
      managedPolicies: [policy],
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

    const env = new CfnEnvironment(this, `${id}-environment`, {
      applicationName: version.applicationName,
      environmentName: version.applicationName,
      versionLabel: version.ref,
      cnamePrefix: "issuer-tool",
      solutionStackName:
        "64bit Amazon Linux 2018.03 v2.17.3 running Docker 20.10.7",
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
    this.envDomain = `${env.cnamePrefix}.${this.region}.elasticbeanstalk.com`;
    this.envName = env.environmentName!;
    this.appName = version.applicationName;
  }
}
