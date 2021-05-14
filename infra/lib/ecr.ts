import * as cdk from "@aws-cdk/core";
import { Repository } from "@aws-cdk/aws-ecr";
import { CfnOutput } from "@aws-cdk/core";

export interface IssuerToolEcrStackProps extends cdk.StackProps {
  prod: boolean;
}

export class IssuerToolEcrStack extends cdk.Stack {
  public readonly ecrURL: CfnOutput;
  public readonly imageName: string;
  constructor(
    scope: cdk.Construct,
    id: string,
    props: IssuerToolEcrStackProps
  ) {
    super(scope, `${id}-ecr`, props);
    const { prod } = props;
    const repository = new Repository(this, `${id}-repository`, {
      imageScanOnPush: true,
      removalPolicy: prod
        ? cdk.RemovalPolicy.RETAIN
        : cdk.RemovalPolicy.DESTROY,
    });
    repository.addLifecycleRule({
      description: "Retain max 3 images",
      maxImageCount: 3,
    });
    this.ecrURL = new CfnOutput(this, `${id}-ecr-url`, {
      value: repository.repositoryUriForDigest(),
    });
    this.imageName = repository.repositoryName;
  }
}
