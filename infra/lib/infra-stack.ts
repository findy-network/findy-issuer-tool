import * as cdk from "@aws-cdk/core";
import { HostedZone } from "@aws-cdk/aws-route53";
import { IssuerToolBackendStack, IssuerToolBackendStackProps } from "./backend";
import { IssuerToolEcrStack } from "./ecr";
import {
  IssuerToolFrontendStack,
  IssuerToolFrontendStackProps,
} from "./frontend";
import { IssuerToolBackendConfStack } from "./backend-conf";
import { IssuerToolPipelineStack } from "./pipeline";
import { StackProps } from "@aws-cdk/core";

export interface IssuerToolInfraStackProps extends StackProps {
  bucketName: string;
  prod: boolean;
  domainName: string;
  apiPaths: string[];

  ecrURL: string;
  domainRoot: string;
  tokenName: string;
  walletDomainName: string;
}

export class IssuerToolInfraStack extends cdk.Stack {
  constructor(
    scope: cdk.Construct,
    id: string,
    props: IssuerToolInfraStackProps
  ) {
    super(scope, `${id}-infra`, props);

    const zone = HostedZone.fromLookup(this, `${id}-hosted-zone`, {
      domainName: props.domainRoot,
    });

    const ecrStack = new IssuerToolEcrStack(this, id, { prod: props.prod });
    const confStack = new IssuerToolBackendConfStack(this, id, zone, {
      ...props,
      ecrURL: props.ecrURL,
    });
    const backendStack = new IssuerToolBackendStack(this, id, {
      ...props,
      ecrURL: props.ecrURL,
      bucket: confStack.bucket,
    });
    const frontendStack = new IssuerToolFrontendStack(this, id, zone, {
      ...props,
      apiDomain: backendStack.envDomain,
    });
    new IssuerToolPipelineStack(this, id, {
      frontendBucket: frontendStack.bucket,
      confBucket: confStack.bucket,
      ...props,
      ecrURL: props.ecrURL,
      envName: backendStack.envName,
      appName: backendStack.appName,
    });
  }
}
