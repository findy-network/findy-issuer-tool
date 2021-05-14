import * as cdk from "@aws-cdk/core";
import {
  OriginAccessIdentity,
  OriginProtocolPolicy,
} from "@aws-cdk/aws-cloudfront";
import { Bucket, BlockPublicAccess, IBucket } from "@aws-cdk/aws-s3";
import { PolicyStatement } from "@aws-cdk/aws-iam";
import { DnsValidatedCertificate } from "@aws-cdk/aws-certificatemanager";
import {
  CloudFrontWebDistribution,
  SSLMethod,
  SecurityPolicyProtocol,
  CloudFrontAllowedMethods,
} from "@aws-cdk/aws-cloudfront";
import { ARecord, RecordTarget } from "@aws-cdk/aws-route53";
import { CloudFrontTarget } from "@aws-cdk/aws-route53-targets/lib";
import { IHostedZone } from "@aws-cdk/aws-route53";

export interface IssuerToolFrontendStackProps extends cdk.StackProps {
  bucketName: string;
  prod: boolean;
  domainName: string;
  apiDomain: string;
  apiPaths: string[];
}

export class IssuerToolFrontendStack extends cdk.Stack {
  public readonly bucket: IBucket;
  constructor(
    scope: cdk.Construct,
    id: string,
    zone: IHostedZone,
    props: IssuerToolFrontendStackProps
  ) {
    super(scope, `${id}-frontend`, props);

    const { bucketName, prod } = props;

    const bucket = new Bucket(this, `${id}-bucket`, {
      bucketName: bucketName,
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "index.html",
      removalPolicy: prod
        ? cdk.RemovalPolicy.RETAIN
        : cdk.RemovalPolicy.DESTROY,
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

    const { domainName, apiDomain, apiPaths } = props!;

    // To use an ACM certificate with Amazon CloudFront, you must request or import the certificate
    // in the US East (N. Virginia) region. ACM certificates in this region that are associated
    // with a CloudFront distribution are distributed to all the geographic locations configured for that distribution.
    const certificateArn = new DnsValidatedCertificate(
      this,
      `${id}-certificate`,
      {
        domainName,
        hostedZone: zone,
        region: "us-east-1",
      }
    ).certificateArn;

    const distribution = new CloudFrontWebDistribution(
      this,
      `${id}-distribution`,
      {
        aliasConfiguration: {
          acmCertRef: certificateArn,
          names: [domainName],
          sslMethod: SSLMethod.SNI,
          securityPolicy: SecurityPolicyProtocol.TLS_V1_2_2019,
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
                maxTtl: cdk.Duration.seconds(0),
                minTtl: cdk.Duration.seconds(0),
                defaultTtl: cdk.Duration.seconds(0),
              },
            ],
          },
          {
            customOriginSource: {
              domainName: apiDomain,
              originProtocolPolicy: OriginProtocolPolicy.HTTP_ONLY,
              originReadTimeout: cdk.Duration.seconds(60),
              originKeepaliveTimeout: cdk.Duration.seconds(60),
            },
            behaviors: apiPaths.map((item: string) => ({
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
      recordName: domainName,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
      zone,
    });
    this.bucket = bucket;
  }
}
