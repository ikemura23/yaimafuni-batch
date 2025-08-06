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

## テスト

このプロジェクトではJestを使用した単体テストを実装しています。

### テスト実行

```bash
# 基本的なテスト実行
npm test

# ウォッチモード（ファイル変更時に自動実行）
npm run test:watch

# カバレッジレポート付きテスト実行
npm run test:coverage
```

### 利用可能なスクリプト

```bash
npm start          # ローカル実行
npm run deploy     # デプロイ
npm run format     # コードフォーマット
npm run format:check # フォーマットチェック
npm test           # テスト実行
npm run test:watch # テストウォッチモード
npm run test:coverage # テストカバレッジ
```

### テスト構成

- `__tests__/controllers.test.js` - ControllerManagerクラスの単体テスト
- `__tests__/README.md` - テストの詳細な使用方法

### テストカバレッジ

現在、ControllerManagerクラスに対して100%のコードカバレッジを達成しています。

## Chromium を S3 にアップロード

```
./upload-chromium
```

## puppeteer-core を chromium を更新する際の注意点

どうやら両者のバージョンの組み合わせによって chromium や puppeteer の起動が失敗するらしい
もしライブラリをアップデートするときは以下の表に合わせる必要がある
https://pptr.dev/chromium-support
