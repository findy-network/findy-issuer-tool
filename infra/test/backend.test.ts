import * as cdk from "aws-cdk-lib";

import { Template } from "aws-cdk-lib/assertions";
import { Backend } from "../lib/backend";

test("Backend Created", () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, "MyTestStack", {
    env: { account: "123456789012", region: "us-east-1" },
  });

  new Backend(stack, "MyTestBackend", {
    account: stack.account,
  });

  const template = Template.fromStack(stack);

  template.resourceCountIs("AWS::ElasticBeanstalk::Application", 1);
  template.resourceCountIs("AWS::ElasticBeanstalk::ApplicationVersion", 1);
  template.resourceCountIs("AWS::ElasticBeanstalk::Environment", 1);
  template.resourceCountIs("AWS::DynamoDB::Table", 1);

  template.hasResourceProperties("AWS::ElasticBeanstalk::Application", {
    ApplicationName: "MyTestBackend-app",
    ResourceLifecycleConfig: {
      ServiceRole:
        "arn:aws:iam::123456789012:role/aws-service-role/elasticbeanstalk.amazonaws.com/AWSServiceRoleForElasticBeanstalk",
    },
  });

  expect(template).toMatchSnapshot();
});
