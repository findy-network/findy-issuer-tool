#!/bin/bash

set -e

AWS_CMD="aws"

$AWS_CMD --version

if [ -z "$ISSUER_TOOL_APP_NAME" ]; then
  echo "ERROR: Define env variable ISSUER_TOOL_APP_NAME"
  exit 1
fi

if [ -z "$GITHUB_TOKEN" ]; then
  echo "ERROR: Define env variable GITHUB_TOKEN"
  exit 1
fi

if [ -z "$ISSUER_TOOL_ECR_IMAGE_NAME" ]; then
  echo "ERROR: Define env variable ISSUER_TOOL_ECR_IMAGE_NAME"
  exit 1
fi

if [ -z "$ISSUER_TOOL_ECR_ROOT_URL" ]; then
  echo "ERROR: Define env variable ISSUER_TOOL_ECR_ROOT_URL"
  exit 1
fi

FULL_NAME="$ISSUER_TOOL_ECR_ROOT_URL/$ISSUER_TOOL_ECR_IMAGE_NAME"
CURRENT_DIR=$(dirname "$BASH_SOURCE")

VERSION=$($CURRENT_DIR/version.sh $CURRENT_DIR/../../api)

echo "Checking if $VERSION is already built..."

set +e
HAS_IMAGE_VERSION=$($AWS_CMD ecr list-images --repository-name $ISSUER_TOOL_ECR_IMAGE_NAME --filter '{"tagStatus": "TAGGED"}' | grep -F $VERSION)
set -e

if [ -z "$HAS_IMAGE_VERSION" ]; then
  echo "Image $VERSION not found in registry, start building.";
else
  echo "WARNING: Image $VERSION already built, skipping build!";
  exit 0
fi

echo "Releasing issuer-tool version $VERSION"

cd $CURRENT_DIR/../../api

docker rmi findy-issuer-tool || echo 'no local images to clean'
docker rmi $FULL_NAME  || echo 'no aws images to clean'
docker build \
    --build-arg GITHUB_TOKEN="$GITHUB_TOKEN" \
    --build-arg ISSUER_TOOL_SERVER_CERT_PATH="s3://$ISSUER_TOOL_APP_NAME-conf-bucket" \
    -t findy-issuer-tool .

$AWS_CMD ecr get-login-password \
    --region $AWS_DEFAULT_REGION \
| docker login \
    --username AWS \
    --password-stdin $ISSUER_TOOL_ECR_ROOT_URL

docker tag findy-issuer-tool:latest $FULL_NAME:latest
docker tag findy-issuer-tool:latest $FULL_NAME:$VERSION
echo "$FULL_NAME:latest" "$FULL_NAME:$VERSION" | xargs -n 1 docker push

docker logout $ISSUER_TOOL_ECR_ROOT_URL
