#!/bin/bash
set -e

# Clean and install production dependencies
rm -rf node_modules
npm install --production

# Remove existing ZIP if any
rm -f source.zip

# Create ZIP file excluding unnecessary files
zip -r source.zip . -x "*.git*" "node_modules/.bin/*"

echo "ZIP file created: source.zip"

## AWS Lambdaにzipをデプロイ
aws lambda update-function-code --function-name yaimafuni-batch --zip-file fileb://source.zip