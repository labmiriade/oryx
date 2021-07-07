#!/bin/sh

set -eux

npm install
npm run $1
mv build/* /asset-output/
