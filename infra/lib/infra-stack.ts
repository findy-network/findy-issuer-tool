import { Stack, StackProps, CfnOutput } from "aws-cdk-lib";
import { Construct } from "constructs";

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
