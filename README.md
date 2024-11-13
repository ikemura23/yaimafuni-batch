# Yaimafuni-Barch

## 環境設定

nodenv を使用

https://github.com/nodenv/nodenv

## 起動方法

```
npm run start
```

もしくは

```
node index.js
```

## node.js のバージョン固定

`.node-version`ファイルに node.js のバージョン指定をしている。

## デプロイ

```
npm run deploy
```

## Chromium を S3 にアップロード

```
./upload-chromium
```

## puppeteer-core を chromium を更新する際の注意点

どうやら両者のバージョンの組み合わせによって chromium や puppeteer の起動が失敗するらしい
もしライブラリをアップデートするときは以下の表に合わせる必要がある
https://pptr.dev/chromium-support
