#!/bin/bash

set -e

SRC_FOLDER=$1

node -e "console.log(require(\"$SRC_FOLDER/package.json\").version);"
