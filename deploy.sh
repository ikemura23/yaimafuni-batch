#!/bin/bash
set -e

# Clean and install production dependencies
rm -rf node_modules
npm install --production

# Remove existing ZIP if any
rm -f source.zip

# Create ZIP file including only necessary files and dependencies
zip -r source.zip . -x "*.git*" "*.DS_Store" ".cursor/*" "*.log" "*.tmp" "coverage/*" "test/*" "tests/*" "docs/*" "*.md" "*.txt" "*.sh" "deploy.sh" "upload-chromium.sh" "scripts/*" "node_modules/.bin/*"

echo "ZIP file created: source.zip"

## AWS Lambdaにzipをデプロイ
aws lambda update-function-code --function-name yaimafuni-batch --zip-file fileb://source.zip