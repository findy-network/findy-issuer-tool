#!/bin/bash

# Stores parameters needed for pipeline to run successfully

if [ -z "$GITHUB_CONNECTION_ARN" ]; then
  echo "ERROR: Define env variable GITHUB_CONNECTION_ARN"
  exit 1
fi

if [ -z "$DOMAIN_NAME" ]; then
  echo "ERROR: Define env variable DOMAIN_NAME"
  exit 1
fi

if [ -z "$SUB_DOMAIN_NAME" ]; then
  echo "ERROR: Define env variable SUB_DOMAIN_NAME"
  exit 1
fi

if [ -z "$WALLET_DOMAIN_NAME" ]; then
  echo "ERROR: Define env variable WALLET_DOMAIN_NAME"
  exit 1
fi

aws ssm put-parameter --name \"/findy-issuer-tool/github-connection-arn\" --value \"$GITHUB_CONNECTION_ARN\" --type String
aws ssm put-parameter --name \"/findy-issuer-tool/domain-name\" --value \"$DOMAIN_NAME\" --type String
aws ssm put-parameter --name \"/findy-issuer-tool/sub-domain-name\" --value \"$SUB_DOMAIN_NAME\" --type String
aws ssm put-parameter --name \"/findy-issuer-tool/wallet-domain-name\" --value \"$WALLET_DOMAIN_NAME\" --type String
