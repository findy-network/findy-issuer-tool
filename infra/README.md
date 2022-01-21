# Issuer-tool infra

This project helps to setup issuer-tool to AWS.

Note! "<>" indicates example value, and shouldn't be included in values you define.

1. Install dependencies

   ```bash
   npm install -g typescript
   npm install -g aws-cdk
   npm install
   ```

1. Define environment variables

   ```bash
   # AWS related
   export AWS_DEFAULT_REGION=<AWS_REGION>
   export AWS_ACCESS_KEY_ID=<AWS_ACCESS_KEY>
   export AWS_SECRET_ACCESS_KEY=<AWS_SECRET_ACCESS_KEY>
   export CDK_DEFAULT_REGION=<AWS_REGION>
   export CDK_DEFAULT_ACCOUNT=<AWS_ACCOUNT_NUMBER>

   # unique app id
   export ISSUER_TOOL_APP_NAME=<my-fantastic-issuer-tool>
   # app root domain
   export ISSUER_TOOL_DOMAIN_ROOT=<example.com>
   # app sub domain part
   export ISSUER_TOOL_SUBDOMAIN=<issuer-tool>
   ```

1. List available stacks:

   ```bash
   cdk list

   ...

   my-fantastic-issuer-tool-infra
   my-fantastic-issuer-tool-infra/my-fantastic-issuer-tool-conf
   my-fantastic-issuer-tool-infra/my-fantastic-issuer-tool-ecr
   my-fantastic-issuer-tool-infra/my-fantastic-issuer-tool-frontend
   my-fantastic-issuer-tool-infra/my-fantastic-issuer-tool-backend
   my-fantastic-issuer-tool-infra/my-fantastic-issuer-tool-pipeline
   ```

   In following cdk commands replace the stack name according to this list.

1. Create ECR repository

   ```bash
   cdk deploy <app-id>-infra/<app-id>-ecr
   ```

   Copy the ECR URL that the script outputs.

1. Define ECR URL

   ```bash
   # full ECR url from previous step
   export ISSUER_TOOL_ECR_URL="<123456789.dkr.ecr.region.amazonaws.com/imagename>"
   # ECR root url
   export ISSUER_TOOL_ECR_ROOT_URL="<123456789.dkr.ecr.region.amazonaws.com>"
   # ECR image name
   export ISSUER_TOOL_ECR_IMAGE_NAME="<imagename>"
   # S3 cert path or empty, depending on agency certificate type
   export ISSUER_TOOL_SERVER_CERT_PATH="<s3://somebucket>"
   ```

1. Build and push the api service image

   ```bash
   ./scripts/push-to-ecr.sh
   ```

1. Save secrets for service runtime functionality.

   Define following variables:

   ```bash
    # Dynamo DB connection
    export ISSUER_TOOL_OUR_HOST="<https://issuer-tool.example.com>"
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

1. Create backend configuration stack

   ```bash
   cdk deploy <app-id>-infra/<app-id>-conf
   ```

1. Create backend stack

   ```bash
   cdk deploy <app-id>-infra/<app-id>-backend
   ```

1. Create frontend stack

   ```bash
   cdk deploy <app-id>-infra/<app-id>-frontend
   ```

1. Create pipeline stack

   ```bash
   cdk deploy <app-id>-infra/<app-id>-pipeline
   ```
