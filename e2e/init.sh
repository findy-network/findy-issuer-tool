#!/bin/bash

set -e

CURRENT_DIR=$(dirname "$BASH_SOURCE")
cd $CURRENT_DIR

mkdir -p .build
git clone https://github.com/findy-network/findy-wallet-pwa.git .build/findy-wallet-pwa || echo "Already cloned"
cd .build/findy-wallet-pwa/tools/env-docker && make clean && make init-store && docker-compose up -d
cd ../../../../../api/ && npm run db && (npm start &)
cd ../frontend && (npm run start:e2e &)
