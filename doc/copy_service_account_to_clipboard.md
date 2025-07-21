# copy_service_account_to_clipboard.sh

## 概要

`copy_service_account_to_clipboard.sh`は、Firebaseのサービスアカウントキー（`serviceAccountKey.json`）を安全にクリップボードにコピーするためのスクリプトです。

このスクリプトは、機密情報を環境変数に直接設定するのではなく、手動でコピー&ペーストできるようにすることで、セキュリティリスクを軽減します。

## 機能

- `serviceAccountKey.json`ファイルの存在確認
- JSON形式の圧縮（改行・スペースの削除）
- クリップボードへの自動コピー
- エラーハンドリング
- 使用方法の表示

## 前提条件

### 必要なファイル
- `serviceAccountKey.json` - プロジェクトルートに配置

### 必要なツール
- `jq` (推奨) - JSON処理ツール
- `tr` (フォールバック) - テキスト処理ツール
- `pbcopy` - macOSのクリップボードコピーコマンド

## インストール

### jqのインストール（推奨）

**macOS (Homebrew):**
```bash
brew install jq
```

## 使用方法

### 1. スクリプトの実行

```bash
./copy_service_account_to_clipboard.sh
```

### 2. 環境変数の設定

スクリプト実行後、表示される使用方法に従って環境変数を設定します：

```bash
export YAIMAFUNI_FIREBASE_SERVICE_ACCOUNT='[クリップボードの内容をペースト]'
```

### 3. 環境変数の確認

```bash
echo $YAIMAFUNI_FIREBASE_SERVICE_ACCOUNT
```

### 4. アプリケーションの実行

```bash
npm run start
```

## エラーハンドリング

### ファイルが見つからない場合

```
❌ serviceAccountKey.json が見つかりません
```

**対処法:**
- ファイルがプロジェクトルートにあるか確認
- ファイル名が正確か確認
- 現在のディレクトリが正しいか確認

### クリップボードへのコピーに失敗した場合

```
❌ クリップボードへのコピーに失敗しました
```

**対処法:**
- `pbcopy`コマンドが利用可能か確認
- クリップボードの権限を確認

## セキュリティ

### 推奨事項

1. **環境変数の管理**
   - 環境変数はセッション中のみ設定
   - ログファイルに出力されないよう注意
   - シェル履歴に残らないよう注意

2. **ファイルの管理**
   - `serviceAccountKey.json`はGit管理に含めない
   - `.gitignore`に追加
   - 不要になったら削除

3. **権限の管理**
   - 必要最小限の権限のみ付与
   - 定期的なキーローテーション

### 注意事項

- このスクリプトは機密情報を扱います
- クリップボードの内容は他のアプリケーションからアクセス可能です
- 環境変数は現在のシェルセッションでのみ有効です

## トラブルシューティング

### jqがインストールされていない場合

スクリプトは自動的に`tr`コマンドを使用しますが、`jq`の使用を推奨します。

## 関連ファイル

- `serviceAccountKey.json` - Firebaseサービスアカウントキー
- `src/repository/firestoreRepository.js` - Firestoreリポジトリ
- `.gitignore` - Git除外設定
