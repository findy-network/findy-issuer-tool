#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { IssuerToolInfraStack } from "../lib/infra-stack";
import { existsSync } from "fs";

if (!process.env.ISSUER_TOOL_APP_NAME) {
  console.log("Check ISSUER_TOOL_APP_NAME configuration");
  process.exit(1);
}

if (!process.env.ISSUER_TOOL_DOMAIN_ROOT) {
  console.log("Check ISSUER_TOOL_DOMAIN_ROOT configuration");
  process.exit(1);
}

if (!process.env.ISSUER_TOOL_SUBDOMAIN) {
  console.log("Check ISSUER_TOOL_SUBDOMAIN configuration");
  process.exit(1);
}

if (!process.env.ISSUER_TOOL_ECR_URL) {
  console.log("WARNING: ISSUER_TOOL_ECR_URL not configured");
}

if (!process.env.ISSUER_TOOL_TOKEN_SECRET_NAME) {
  console.log("WARNING: ISSUER_TOOL_TOKEN_SECRET_NAME not configured");
}

if (!process.env.ISSUER_TOOL_WALLET_DOMAIN_NAME) {
  console.log("WARNING: ISSUER_TOOL_WALLET_DOMAIN_NAME not configured");
}

if (!process.env.ISSUER_TOOL_WALLET_DOMAIN_NAME) {
  console.log("WARNING: ISSUER_TOOL_WALLET_DOMAIN_NAME not configured");
}

["./.secrets/server.crt"].map((item) => {
  if (!existsSync(item)) {
    console.log(`${item} missing`);
    process.exit(1);
  }
});

const app = new cdk.App();
const domainRoot = `${process.env.ISSUER_TOOL_DOMAIN_ROOT}`;
const domainName = `${process.env.ISSUER_TOOL_SUBDOMAIN}.${domainRoot}`;
const ecrURL = `${process.env.ISSUER_TOOL_ECR_URL}`;
const tokenName = `${process.env.ISSUER_TOOL_TOKEN_SECRET_NAME}`;
const walletDomainName = `${process.env.ISSUER_TOOL_WALLET_DOMAIN_NAME}`;

new IssuerToolInfraStack(app, process.env.ISSUER_TOOL_APP_NAME, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  bucketName: domainName,
  prod: false,
  domainName,
  domainRoot: process.env.ISSUER_TOOL_DOMAIN_ROOT,
  apiPaths: [
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
  ],
  ecrURL,
  tokenName,
  walletDomainName,
});
