#!/bin/bash
set -e

rm -rf chromium

git clone --depth 1 --branch v130.0.0 git@github.com:Sparticuz/chromium.git
cd chromium
make chromium.zip

aws s3 cp chromium.zip "s3://chromium-zip"

echo "Uploaded done! chromium.zip to S3"

rm -rf chromium
