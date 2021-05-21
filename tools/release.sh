#!/bin/bash

set -e

SEMVER=$1

CURRENT_DIR=$(dirname "$BASH_SOURCE")

if [ -z "$1" ]; then
  SEMVER=minor
  echo "No argument given, starting work for default ($SEMVER) version"
fi

VERSION_NBR=$($CURRENT_DIR/version.sh)
echo "Attempt to release version $VERSION_NBR"

BRANCH=$(git rev-parse --abbrev-ref HEAD)

if [[ "$BRANCH" != "dev" ]]; then
  echo "ERROR: Checkout dev branch before tagging.";
  exit 1;
fi

if [ -z "$(git status --porcelain)" ]; then
  git pull origin dev

  VERSION=v$VERSION_NBR
# skip testing for now
#  CI=true npm test

  git tag -a $VERSION -m "Version $VERSION"
  git push origin dev --tags

  cd ./api && npm --no-git-tag-version version $SEMVER
  cd ../frontend && npm --no-git-tag-version version $SEMVER && cd..
  npm --no-git-tag-version version $SEMVER
  NEW_VERSION=$($CURRENT_DIR/version.sh)
  git commit -a -m "Start dev for v$NEW_VERSION."
  git push origin dev
else 
  echo "ERROR: Working directory is not clean, commit or stash changes.";
fi
