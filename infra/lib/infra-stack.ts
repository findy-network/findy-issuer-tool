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

import { Frontend } from "./frontend";
import { Backend } from "./backend";

export class InfraStack extends Stack {
  public readonly appName: CfnOutput;
  public readonly envName: CfnOutput;
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const backend = new Backend(this, `${id}-backend`, {
      account: this.account,
    });

    this.envName = new CfnOutput(this, "EnvName", {
      value: backend.envName,
    });
    this.appName = new CfnOutput(this, "AppName", {
      value: backend.appName,
    });

    const apiPaths = [
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
    ];
    const backendUrl = `${backend.cnamePrefix}.${this.region}.elasticbeanstalk.com`;
    new Frontend(this, `${id}-frontend`, {
      rootDomainName: process.env.DOMAIN_NAME || "example.com",
      appDomainPrefix: process.env.SUB_DOMAIN_NAME || "example",
      apiPaths,
      backendUrl,
    });
  }
}
