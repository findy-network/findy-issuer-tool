import * as cdk from "aws-cdk-lib";
import { Stack } from "aws-cdk-lib";
import { Template, Match } from "aws-cdk-lib/assertions";
import * as Infra from "../lib/infra-stack";

test("Infra Stack Created", () => {
  const app = new cdk.App();
  const stack = new Infra.InfraStack(app, "MyTestStack", {
    env: { account: "123456789012", region: "us-east-1" },
  });
  const template = Template.fromStack(stack);

  template.hasOutput("EnvName", {
    Value: "MyTestStack-backend-app",
  });
  template.hasOutput("AppName", {
    Value: "MyTestStack-backend-app",
  });

  // check that api path is configured
  template.hasResourceProperties("AWS::CloudFront::Distribution", {
    DistributionConfig: {
      CacheBehaviors: Match.arrayWith([
        {
          AllowedMethods: [
            "DELETE",
            "GET",
            "HEAD",
            "OPTIONS",
            "PATCH",
            "POST",
            "PUT",
          ],
          CachedMethods: ["GET", "HEAD"],
          Compress: true,
          ForwardedValues: {
            Cookies: {
              Forward: "all",
            },
            Headers: ["*"],
            QueryString: true,
          },
          PathPattern: "/auth/*",
          TargetOriginId: "origin2",
          ViewerProtocolPolicy: "redirect-to-https",
        },
      ]),
      Origins: Match.arrayWith([
        {
          ConnectionAttempts: 3,
          ConnectionTimeout: 10,
          CustomOriginConfig: {
            HTTPPort: 80,
            HTTPSPort: 443,
            OriginKeepaliveTimeout: 60,
            OriginProtocolPolicy: "http-only",
            OriginReadTimeout: 60,
            OriginSSLProtocols: ["TLSv1.2"],
          },
          DomainName: "issuer-tool.us-east-1.elasticbeanstalk.com",
          Id: "origin2",
        },
      ]),
    },
  });
});
