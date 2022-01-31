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
tls_path="./tools/env/config/cert"

timestamp=$(date +%s)
user=user-$timestamp
