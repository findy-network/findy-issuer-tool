# Issuer Tool infra for AWS

This project helps to setup issuer-tool to AWS.
The backend is deployed as single-container Elastic Beanstalk application
and frontend via S3 bucket and CloudFront proxy.

Note! "<>" indicates example value, and shouldn't be included in values you define.

1. Install dependencies

   ```bash
   npm install -g typescript
   npm install -g aws-cdk
   npm install
   ```

1. Install [AWS CLI](https://aws.amazon.com/cli/)

1. Create [codestar connection to GitHub](https://docs.aws.amazon.com/dtconsole/latest/userguide/connections-create-github.html)

1. Define environment variables for initializing AWS pipeline

   ```bash
   # AWS related
   export AWS_DEFAULT_REGION=<AWS_REGION>
   export AWS_ACCESS_KEY_ID=<AWS_ACCESS_KEY>
   export AWS_SECRET_ACCESS_KEY=<AWS_SECRET_ACCESS_KEY>
   export CDK_DEFAULT_REGION=<AWS_REGION>
   export CDK_DEFAULT_ACCOUNT=<AWS_ACCOUNT_NUMBER>

   # github connection arn
   export GITHUB_CONNECTION_ARN=<arn:aws:codestar-connections:us-east-1:xxx:connection/xxx>
   # app root domain
   export DOMAIN_NAME=<example.com>
   # app sub domain part
   export SUB_DOMAIN_NAME=<issuer-tool>
   # SSI wallet domain
   export WALLET_DOMAIN_NAME=<wallet.example.com>
   ```

1. Store pipelines parameters to AWS

   ```bash
   ./tools/init.sh
   ```

1. Bootstrap, first synth and store context to AWS params

   ```bash
   cdk bootstrap
   cdk synth
   npm run pipeline:context
   ```

1. Save secrets for service runtime functionality.

   Define following variables:

   ```bash
    export ISSUER_TOOL_OUR_HOST="<https://issuer-tool.example.com>"
    # Dynamo DB connection
    export ISSUER_TOOL_STORAGE_HOST="<https://dynamodb.<region>.amazonaws.com>"
    export ISSUER_TOOL_STORAGE_REGION="<region>"
    # Github authentication integration
    export ISSUER_TOOL_GITHUB_USERNAME="<github-user>"
    export ISSUER_TOOL_GITHUB_CLIENT_ID="<github-client-id>"
    export ISSUER_TOOL_GITHUB_CLIENT_SECRET="<github-client-secret>"
    # Frontend URL
    export ISSUER_TOOL_REDIRECT_URL="<https://issuer-tool.example.com>"
    # Allowed email domains
    export ISSUER_TOOL_AUTH_ALLOWED_DOMAINS='<[\"op.fi\"]>'
    # JWT secret
    export ISSUER_TOOL_JWT_SHARED_SECRET="<random_string>"
    # Agency integration
    export ISSUER_TOOL_AGENCY_AUTH_URL="<https://url.to.auth.server>"
    export ISSUER_TOOL_AGENCY_USER_NAME="<unique-agency-user-name>"
    export ISSUER_TOOL_AGENCY_KEY="<sw-authenticator-key>"
    export ISSUER_TOOL_SERVER_ADDRESS="<agency.address>"
   ```

   Save secrets to secret manager:

   ```bash
   ./scripts/store-secrets.sh
   ```

1. Deploy pipeline

   ```bash
   cdk deploy
   ```

1. Open pipelines at AWS console and see that the pipeline succeeds. Following changes
to the app or infra are deployed automatically by the pipeline.
