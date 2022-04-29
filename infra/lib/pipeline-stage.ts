import { InfraStack } from "./infra-stack";
import { Stage, StageProps, CfnOutput } from "aws-cdk-lib";
import { Construct } from "constructs";

export class InfraPipelineStage extends Stage {
  public readonly appName: CfnOutput;
  public readonly envName: CfnOutput;
  constructor(scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props);

    const service = new InfraStack(this, "FindyIssuerToolInfraStack", props);
    this.appName = service.appName;
    this.envName = service.envName;
  }
}
