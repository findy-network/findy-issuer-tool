import {
  Stack,
  StackProps,
  RemovalPolicy,
  Duration,
  CfnOutput,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  CfnApplication,
  CfnApplicationVersion,
  CfnEnvironment,
} from "aws-cdk-lib/aws-elasticbeanstalk";
import { CfnTable } from "aws-cdk-lib/aws-dynamodb";
import { IBucket, Bucket, BlockPublicAccess } from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";
import {
  CfnInstanceProfile,
  Effect,
  PolicyDocument,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import {
  OriginAccessIdentity,
  OriginProtocolPolicy,
  CloudFrontWebDistribution,
  SSLMethod,
  SecurityPolicyProtocol,
  CloudFrontAllowedMethods,
} from "aws-cdk-lib/aws-cloudfront";
import { DnsValidatedCertificate } from "aws-cdk-lib/aws-certificatemanager";
import { ARecord, RecordTarget, HostedZone } from "aws-cdk-lib/aws-route53";
import { CloudFrontTarget } from "aws-cdk-lib/aws-route53-targets";

export class InfraStack extends Stack {
  public readonly appName: CfnOutput;
  public readonly envName: CfnOutput;
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const domainName = process.env.DOMAIN_NAME || "example.com";
    const subDomainName = process.env.SUB_DOMAIN_NAME || "example";

    // BACKEND
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
        s3Bucket: process.env.CONF_BUCKET_NAME || "conf-bucket",
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

    this.envName = new CfnOutput(this, "EnvName", {
      value: env.environmentName!,
    });
    this.appName = new CfnOutput(this, "AppName", {
      value: version.applicationName!,
    });

    // FRONTEND
    const bucketName = `${subDomainName}.${domainName}`;

    const bucket = new Bucket(this, `${id}-bucket`, {
      bucketName: bucketName,
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "index.html",
      removalPolicy: RemovalPolicy.DESTROY,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    });

    const bucketOriginAccessIdentity = new OriginAccessIdentity(
      this,
      `${id}-origin-access-identity`,
      {
        comment: `Access bucket ${bucketName} only from Cloudfront`,
      }
    );
    const policyStatement = new PolicyStatement();
    policyStatement.addActions("s3:GetObject*");
    policyStatement.addResources(`${bucket.bucketArn}/*`);
    policyStatement.addCanonicalUserPrincipal(
      bucketOriginAccessIdentity.cloudFrontOriginAccessIdentityS3CanonicalUserId
    );
    bucket.addToResourcePolicy(policyStatement);
    const listPolicyStatement = new PolicyStatement();
    listPolicyStatement.addActions("s3:ListBucket");
    listPolicyStatement.addResources(bucket.bucketArn);
    listPolicyStatement.addCanonicalUserPrincipal(
      bucketOriginAccessIdentity.cloudFrontOriginAccessIdentityS3CanonicalUserId
    );
    bucket.addToResourcePolicy(listPolicyStatement);

    const s3Origin = {
      s3BucketSource: bucket,
      originAccessIdentity: bucketOriginAccessIdentity,
    };

    const zone = HostedZone.fromLookup(this, `${id}-hosted-zone`, {
      domainName: domainName,
    });

    // To use an ACM certificate with Amazon CloudFront, you must request or import the certificate
    // in the US East (N. Virginia) region. ACM certificates in this region that are associated
    // with a CloudFront distribution are distributed to all the geographic locations configured for that distribution.
    const certificateArn = new DnsValidatedCertificate(
      this,
      `${id}-certificate`,
      {
        domainName: bucketName,
        hostedZone: zone,
        region: "us-east-1",
      }
    ).certificateArn;

    const distribution = new CloudFrontWebDistribution(
      this,
      `${id}-distribution`,
      {
        viewerCertificate: {
          props: {
            acmCertificateArn: certificateArn,
            minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2021,
            sslSupportMethod: SSLMethod.SNI,
          },
          aliases: [bucketName],
        },
        errorConfigurations: [
          {
            errorCode: 404,
            responsePagePath: "/index.html",
            responseCode: 200,
            errorCachingMinTtl: 0,
          },
        ],
        originConfigs: [
          {
            s3OriginSource: s3Origin,
            behaviors: [
              {
                isDefaultBehavior: true,
              },
              {
                pathPattern: "/index.html",
                maxTtl: Duration.seconds(0),
                minTtl: Duration.seconds(0),
                defaultTtl: Duration.seconds(0),
              },
            ],
          },
          {
            customOriginSource: {
              domainName: `${env.cnamePrefix}.${this.region}.elasticbeanstalk.com`,
              originProtocolPolicy: OriginProtocolPolicy.HTTP_ONLY,
              originReadTimeout: Duration.seconds(60),
              originKeepaliveTimeout: Duration.seconds(60),
            },
            behaviors: [
              "/auth/*",
              "/issuer*",
              "/user*",
              "/ledger*",
              "/events/*",
              "/connections*",
              "/create/*",
              "/pairwise/*",
              "/creds/*",
              "/ftn/*",
            ].map((item: string) => ({
              pathPattern: item,
              allowedMethods: CloudFrontAllowedMethods.ALL,
              forwardedValues: {
                cookies: {
                  forward: "all",
                },
                headers: ["*"],
                queryString: true,
              },
            })),
          },
        ],
      }
    );

    new ARecord(this, `${id}-a-record`, {
      recordName: bucketName,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
      zone,
    });
  }
}
