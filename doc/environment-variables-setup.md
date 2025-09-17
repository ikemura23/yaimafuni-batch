# 環境変数設定ガイド

## 概要

このドキュメントでは、yaimafuni-batchプロジェクトで使用する環境変数の設定方法について説明します。セキュリティを考慮し、機密情報をハードコーディングせずに環境変数を使用して設定を管理します。

## 必須環境変数

### 1. Firebase設定

| 環境変数名                           | 説明                                 | 必須 | デフォルト値               |
| ------------------------------------ | ------------------------------------ | ---- | -------------------------- |
| `YAIMAFUNI_FIREBASE_DATABASE_URL`    | Firebase Realtime DatabaseのURL      | ✅   | なし                       |
| `YAIMAFUNI_FIREBASE_SERVICE_ACCOUNT` | サービスアカウントキーファイルのパス | ❌   | `./serviceAccountKey.json` |

### 2. Slack設定

| 環境変数名                    | 説明                     | 必須 | デフォルト値 |
| ----------------------------- | ------------------------ | ---- | ------------ |
| `YAIMAFUNI_SLACK_WEBHOOK_URL` | Slack通知用のWebhook URL | ✅   | なし         |

## 開発環境での設定方法

### 1. シェルスクリプトを使用した設定

#### Bash/Zshの場合

```bash
# ~/.bashrc または ~/.zshrc に追加
export YAIMAFUNI_FIREBASE_DATABASE_URL="https://yaima-funi.firebaseio.com"
export YAIMAFUNI_FIREBASE_SERVICE_ACCOUNT="./serviceAccountKey.json"
export YAIMAFUNI_SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"
```

#### 設定の適用

```bash
# 設定を再読み込み
source ~/.bashrc  # Bashの場合
source ~/.zshrc   # Zshの場合
```

### 2. IDEでの設定

#### Visual Studio Code

1. `.vscode/launch.json`を作成：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch yaimafuni-batch",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/index.js",
      "env": {
        "YAIMAFUNI_FIREBASE_DATABASE_URL": "https://yaima-funi.firebaseio.com",
        "YAIMAFUNI_FIREBASE_SERVICE_ACCOUNT": "./serviceAccountKey.json",
        "YAIMAFUNI_SLACK_WEBHOOK_URL": "https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"
      }
    }
  ]
}
```

#### IntelliJ IDEA / WebStorm

1. Run Configurationを作成
2. Environment variablesに以下を追加：
   - `YAIMAFUNI_FIREBASE_DATABASE_URL=https://yaima-funi.firebaseio.com`
   - `YAIMAFUNI_FIREBASE_SERVICE_ACCOUNT=./serviceAccountKey.json`
   - `YAIMAFUNI_SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK`

## 本番環境での設定方法（AWS Lambda）

### 1. AWS Lambda環境変数の設定

#### AWS Management Consoleを使用

1. AWS Lambdaコンソールにログイン
2. 対象のLambda関数を選択
3. 「設定」タブ → 「環境変数」をクリック
4. 以下の環境変数を追加：

| キー                                 | 値                                                    |
| ------------------------------------ | ----------------------------------------------------- |
| `YAIMAFUNI_FIREBASE_DATABASE_URL`    | `https://yaima-funi.firebaseio.com`                   |
| `YAIMAFUNI_FIREBASE_SERVICE_ACCOUNT` | `./serviceAccountKey.json`                            |
| `YAIMAFUNI_SLACK_WEBHOOK_URL`        | `https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK` |

#### AWS CLIを使用

```bash
# 環境変数を設定
aws lambda update-function-configuration \
  --function-name yaimafuni-batch \
  --environment Variables='{
    "YAIMAFUNI_FIREBASE_DATABASE_URL":"https://yaima-funi.firebaseio.com",
    "YAIMAFUNI_FIREBASE_SERVICE_ACCOUNT":"./serviceAccountKey.json",
    "YAIMAFUNI_SLACK_WEBHOOK_URL":"https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"
  }'
```

#### AWS SAMテンプレートを使用

```yaml
# template.yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Resources:
  YaimafuniBatchFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: ./
      Handler: index.handler
      Runtime: nodejs18.x
      Environment:
        Variables:
          YAIMAFUNI_FIREBASE_DATABASE_URL: https://yaima-funi.firebaseio.com
          YAIMAFUNI_FIREBASE_SERVICE_ACCOUNT: ./serviceAccountKey.json
          YAIMAFUNI_SLACK_WEBHOOK_URL: https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
```

#### Serverless Frameworkを使用

```yaml
# serverless.yml
service: yaimafuni-batch

provider:
  name: aws
  runtime: nodejs18.x
  environment:
    YAIMAFUNI_FIREBASE_DATABASE_URL: https://yaima-funi.firebaseio.com
    YAIMAFUNI_FIREBASE_SERVICE_ACCOUNT: ./serviceAccountKey.json
    YAIMAFUNI_SLACK_WEBHOOK_URL: https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK

functions:
  batch:
    handler: index.handler
```

### 2. サービスアカウントキーの管理

#### 方法1: Lambdaレイヤーを使用

```bash
# レイヤー用ディレクトリを作成
mkdir -p layer/nodejs
cp serviceAccountKey.json layer/nodejs/

# レイヤーをパッケージ化
cd layer
zip -r service-account-layer.zip nodejs/
cd ..

# レイヤーをアップロード
aws lambda publish-layer-version \
  --layer-name yaimafuni-service-account \
  --zip-file fileb://layer/service-account-layer.zip \
  --compatible-runtimes nodejs18.x
```

#### 方法2: 環境変数として直接設定

```bash
# サービスアカウントキーをBase64エンコード
base64 -i serviceAccountKey.json | tr -d '\n' > serviceAccountKey.base64

# 環境変数として設定
aws lambda update-function-configuration \
  --function-name yaimafuni-batch \
  --environment Variables='{
    "YAIMAFUNI_FIREBASE_DATABASE_URL":"https://yaima-funi.firebaseio.com",
    "YAIMAFUNI_FIREBASE_SERVICE_ACCOUNT_JSON":"'$(cat serviceAccountKey.base64)'",
    "YAIMAFUNI_SLACK_WEBHOOK_URL":"https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"
  }'
```

### 3. デプロイ

#### AWS CLIを使用

```bash
# 関数をパッケージ化
zip -r function.zip . -x "*.git*" "node_modules/.cache/*" "coverage/*"

# 関数を更新
aws lambda update-function-code \
  --function-name yaimafuni-batch \
  --zip-file fileb://function.zip
```

#### Serverless Frameworkを使用

```bash
# デプロイ
serverless deploy
```

#### AWS SAMを使用

```bash
# ビルドとデプロイ
sam build
sam deploy --guided
```

## 環境変数の命名規則

### 基本ルール

1. **プレフィックス**: プロジェクト名（`YAIMAFUNI_`）で始める
2. **セパレータ**: アンダースコア（`_`）を使用
3. **大文字**: すべて大文字で記述
4. **構造化**: `プロジェクト名_サービス名_設定項目` の形式

### 命名例

| サービス | 設定項目        | 環境変数名                           |
| -------- | --------------- | ------------------------------------ |
| Firebase | Database URL    | `YAIMAFUNI_FIREBASE_DATABASE_URL`    |
| Firebase | Service Account | `YAIMAFUNI_FIREBASE_SERVICE_ACCOUNT` |
| Slack    | Webhook URL     | `YAIMAFUNI_SLACK_WEBHOOK_URL`        |

## 設定例

### 完全な設定例

```bash
# 開発環境用の設定例
export YAIMAFUNI_FIREBASE_DATABASE_URL="https://yaima-funi.firebaseio.com"
export YAIMAFUNI_FIREBASE_SERVICE_ACCOUNT="./serviceAccountKey.json"
export YAIMAFUNI_SLACK_WEBHOOK_URL="https://hooks.slack.com/services/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"
```

### 最小限の設定例（必須項目のみ）

```bash
# 最小限の設定（デフォルト値を使用）
export YAIMAFUNI_FIREBASE_DATABASE_URL="https://yaima-funi.firebaseio.com"
export YAIMAFUNI_SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"
```

## 設定の確認方法

### 1. 環境変数の検証

```bash
# アプリケーション起動時に自動検証
node index.js
```

### 2. 設定状況の確認

```bash
# 開発環境でのみ利用可能
node -e "require('./config-validator').showConfigStatus()"
```

### 3. 手動での確認

```bash
# 環境変数の存在確認
echo $YAIMAFUNI_FIREBASE_DATABASE_URL
echo $YAIMAFUNI_SLACK_WEBHOOK_URL
```

## セキュリティ注意事項

### 1. 機密情報の保護

- **絶対に避ける**: 環境変数にフォールバック値として実際の機密情報を設定
- **正しい方法**: 環境変数のみを使用し、未設定の場合はエラーを発生させる

### 2. ファイルの管理

- `serviceAccountKey.json`は`.gitignore`に追加済み
- 本番環境では環境変数を使用し、ファイルベースの設定は避ける

### 3. ログ出力

- 本番環境では環境変数の設定状況をログに出力しない
- 機密情報がログに含まれないよう注意

## トラブルシューティング

### よくある問題

#### 1. 環境変数が読み込まれない

**原因**: 環境変数の設定が正しく行われていない

**解決方法**:

```bash
# 設定の確認
echo $YAIMAFUNI_FIREBASE_DATABASE_URL

# 設定の再読み込み
source ~/.bashrc  # または ~/.zshrc
```

#### 2. 必須環境変数エラー

**原因**: 必須環境変数が設定されていない

**解決方法**:

```bash
# 必須環境変数を設定
export YAIMAFUNI_FIREBASE_DATABASE_URL="https://yaima-funi.firebaseio.com"
export YAIMAFUNI_SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"
```

#### 3. サービスアカウントキーが見つからない

**原因**: `serviceAccountKey.json`ファイルが存在しない、またはパスが間違っている

**解決方法**:

```bash
# ファイルの存在確認
ls -la serviceAccountKey.json

# 正しいパスを設定
export YAIMAFUNI_FIREBASE_SERVICE_ACCOUNT="./serviceAccountKey.json"
```

## 参考リンク

- [AWS Lambda 環境変数](https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars.html)
- [AWS Lambda レイヤー](https://docs.aws.amazon.com/lambda/latest/dg/configuration-layers.html)
- [AWS SAM テンプレート](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-command-reference.html)
- [Serverless Framework](https://www.serverless.com/framework/docs/)
- [Node.js 環境変数](https://nodejs.org/api/process.html#process_process_env)
