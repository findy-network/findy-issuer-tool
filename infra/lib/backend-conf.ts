import * as cdk from "@aws-cdk/core";
import { Bucket, BlockPublicAccess, IBucket } from "@aws-cdk/aws-s3";
import { BucketDeployment, Source } from "@aws-cdk/aws-s3-deployment";
import { IHostedZone } from "@aws-cdk/aws-route53";

import { writeFileSync, rmSync } from "fs";
import { execSync } from "child_process";

export interface IssuerToolBackendConfStackProps extends cdk.StackProps {
  prod: boolean;
  ecrURL: string;
}

export class IssuerToolBackendConfStack extends cdk.Stack {
  public readonly bucket: IBucket;
  constructor(
    scope: cdk.Construct,
    id: string,
    zone: IHostedZone,
    props: IssuerToolBackendConfStackProps
  ) {
    super(scope, `${id}-conf`, props);
    const { prod, ecrURL } = props;
    const filesPath = "./.secrets";
    const confBucket = new Bucket(this, `${id}-conf-bucket`, {
      bucketName: `${id}-conf-bucket`,
      removalPolicy: prod
        ? cdk.RemovalPolicy.RETAIN
        : cdk.RemovalPolicy.DESTROY,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    });

    const dockerRunJson = {
      AWSEBDockerrunVersion: "1",
      Image: {
        Name: ecrURL,
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
    writeFileSync(dockerRunPath, JSON.stringify(dockerRunJson));
    const out1 = execSync(
      `zip -r -j ${filesPath}/Dockerrun.zip ${dockerRunPath}`
    );
    console.log(out1.toString());
    const out2 = execSync(`zip -r ${filesPath}/Dockerrun.zip .ebextensions`);
    console.log(out2.toString());

    rmSync(dockerRunPath);

    new BucketDeployment(this, `${id}-bucket-deployment`, {
      sources: [Source.asset(filesPath)],
      destinationBucket: confBucket,
    });

    this.bucket = confBucket;
  }
}
