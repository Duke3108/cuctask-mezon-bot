#!/bin/sh

set -e

if [ -z "$3" ]; then
  echo Please input file name
  exit 1
fi

if [ "$1" = "create" ]; then
  cd src/migrations
  npx cross-env ENV=$2 npx typeorm migration:create $3

elif [ "$1" = "gen" ]; then
  npx cross-env ENV=$2 yarn typeorm migration:generate src/migrations/$3

else
  echo "not found command"
  exit 1
fi
