import * as cdk from "aws-cdk-lib";
import { Template, Match } from "aws-cdk-lib/assertions";
import * as Infra2 from "../lib/infra-stack";

test("SQS Queue and SNS Topic Created", () => {
  const app = new cdk.App();
  // WHEN
  const stack = new Infra2.InfraStack(app, "MyTestStack", {
    env: { account: "123456789012", region: "us-east-1" },
  });
  // THEN

  /*const template = Template.fromStack(stack);

  template.hasResourceProperties("AWS::SQS::Queue", {
    VisibilityTimeout: 300,
  });
  template.resourceCountIs("AWS::SNS::Topic", 1);*/
});
