#!/bin/bash

set -e

CURRENT_DIR=$(dirname "$BASH_SOURCE")
cd $CURRENT_DIR

mkdir -p .build
git clone https://github.com/findy-network/findy-wallet-pwa.git .build/findy-wallet-pwa || echo "Already cloned"
cd .build/findy-wallet-pwa/tools/env-docker && make clean && make init-store && docker-compose up -d

auth_url="http://localhost:8088"
auth_origin="http://localhost:3000"
grpc_server="localhost:50052"
tls_path="./.build/findy-wallet-pwa/tools/env/config/cert"

timestamp=$(date +%s)
user=user-$timestamp
default_key=$(findy-agent-cli new-key)

echo "Running e2e test for $auth_url (origin: $auth_origin, api: $grpc_server)"

# register web wallet user
echo "Register user $user"
findy-agent-cli authn register \
    -u $user \
    --url $auth_url \
    --origin $auth_origin \
    --key $default_key

# login web wallet user
echo "Login user $user"
jwt=$(findy-agent-cli authn login \
    -u $user \
    --url $auth_url \
    --origin $auth_origin \
    --key $default_key)

echo {\"jwt\": \"$jwt\", \"user\": \"$user\"} > ./e2e.user.json