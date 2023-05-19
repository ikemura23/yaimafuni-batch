# Yaimafuni-Backend

## 環境設定

nodenvを使用

https://github.com/nodenv/nodenv

## 起動方法

```
npm run start
```

もしくは

```
node src/index.js
```

## node.jsのバージョン固定
`.node-version`ファイルにnode.jsのバージョン指定をしている。

rm -f source.zip&& \
zip -r source.zip . && \
aws s3 cp source.zip "s3://yaimafuni-batch-source" && \
aws lambda update-function-code --function-name yaimafuni-batch --s3-bucket yaimafuni-batch-source --s3-key source.zip