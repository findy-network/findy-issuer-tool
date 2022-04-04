#!/bin/bash

if [ -z "$ISSUER_TOOL_OUR_HOST" ]; then
  echo "ERROR: Define env variable ISSUER_TOOL_OUR_HOST"
  exit 1
fi

if [ -z "$ISSUER_TOOL_STORAGE_HOST" ]; then
  echo "ERROR: Define env variable ISSUER_TOOL_STORAGE_HOST"
  exit 1
fi

if [ -z "$ISSUER_TOOL_STORAGE_REGION" ]; then
  echo "ERROR: Define env variable ISSUER_TOOL_STORAGE_REGION"
  exit 1
fi

if [ -z "$ISSUER_TOOL_GITHUB_USERNAME" ]; then
  echo "ERROR: Define env variable ISSUER_TOOL_GITHUB_USERNAME"
  exit 1
fi

if [ -z "$ISSUER_TOOL_GITHUB_CLIENT_ID" ]; then
  echo "ERROR: Define env variable ISSUER_TOOL_GITHUB_CLIENT_ID"
  exit 1
fi

if [ -z "$ISSUER_TOOL_GITHUB_CLIENT_SECRET" ]; then
  echo "ERROR: Define env variable ISSUER_TOOL_GITHUB_CLIENT_SECRET"
  exit 1
fi

if [ -z "$ISSUER_TOOL_REDIRECT_URL" ]; then
  echo "ERROR: Define env variable ISSUER_TOOL_REDIRECT_URL"
  exit 1
fi

if [ -z "$ISSUER_TOOL_AUTH_ALLOWED_DOMAINS" ]; then
  echo "ERROR: Define env variable ISSUER_TOOL_AUTH_ALLOWED_DOMAINS"
  exit 1
fi

if [ -z "$ISSUER_TOOL_JWT_SHARED_SECRET" ]; then
  echo "ERROR: Define env variable ISSUER_TOOL_JWT_SHARED_SECRET"
  exit 1
fi

if [ -z "$ISSUER_TOOL_AGENCY_AUTH_URL" ]; then
  echo "ERROR: Define env variable ISSUER_TOOL_AGENCY_AUTH_URL"
  exit 1
fi

if [ -z "$ISSUER_TOOL_AGENCY_USER_NAME" ]; then
  echo "ERROR: Define env variable ISSUER_TOOL_AGENCY_USER_NAME"
  exit 1
fi

if [ -z "$ISSUER_TOOL_AGENCY_KEY" ]; then
  echo "ERROR: Define env variable ISSUER_TOOL_AGENCY_KEY"
  exit 1
fi

if [ -z "$ISSUER_TOOL_SERVER_ADDRESS" ]; then
  echo "ERROR: Define env variable ISSUER_TOOL_SERVER_ADDRESS"
  exit 1
fi

params=(
  "\"our-host\":\"$ISSUER_TOOL_OUR_HOST\""
  "\"default-wallet-url\":\"$ISSUER_TOOL_DEFAULT_WALLET_URL\""
  "\"storage-host\":\"$ISSUER_TOOL_STORAGE_HOST\""
  "\"storage-region\":\"$ISSUER_TOOL_STORAGE_REGION\""
  "\"github-username\":\"$ISSUER_TOOL_GITHUB_USERNAME\""
  "\"github-client-id\":\"$ISSUER_TOOL_GITHUB_CLIENT_ID\""
  "\"github-client-secret\":\"$ISSUER_TOOL_GITHUB_CLIENT_SECRET\""
  "\"findy-client-id\":\"$ISSUER_TOOL_FINDY_LOGIN_CLIENT_ID\""
  "\"findy-client-secret\":\"$ISSUER_TOOL_FINDY_LOGIN_CLIENT_SECRET\""
  "\"findy-host\":\"$ISSUER_TOOL_FINDY_LOGIN_HOST\""
  "\"redirect-url\":\"$ISSUER_TOOL_REDIRECT_URL\""
  "\"auth-allowed-domains\":\"$ISSUER_TOOL_AUTH_ALLOWED_DOMAINS\""
  "\"jwt-shared-secret\":\"$ISSUER_TOOL_JWT_SHARED_SECRET\""
  "\"agency-auth-url\":\"$ISSUER_TOOL_AGENCY_AUTH_URL\""
  "\"agency-user-name\":\"$ISSUER_TOOL_AGENCY_USER_NAME\""
  "\"agency-key\":\"$ISSUER_TOOL_AGENCY_KEY\""
  "\"server-address\":\"$ISSUER_TOOL_SERVER_ADDRESS\""
)
joined=$(printf ",%s" "${params[@]}")
SECRET_STRING={${joined:1}}

echo $SECRET_STRING
aws secretsmanager create-secret --name issuer-tool --secret-string $SECRET_STRING
