rm -f source.zip&& \
zip -r source.zip . && \
aws s3 cp source.zip "s3://yaimafuni-batch-source" && \
aws lambda update-function-code --function-name yaimafuni-batch --s3-bucket yaimafuni-batch-source --s3-key source.zip