# Firebase Realtime Database セキュリティルール

プロジェクト `yaima-funi` の Realtime Database ルールはこのリポジトリで管理します。

## ルールの内容

- **クライアント（Android アプリ）**: 読み取りのみ（`.read: true` / `.write: false`）
- **バッチ（Lambda）**: `firebase-admin` で書き込み。Security Rules は**適用されない**

定義ファイル: [database.rules.json](../database.rules.json)

## デプロイ（ルールのみ）

Lambda の `npm run deploy`（[deploy.sh](../deploy.sh)）には **RTDB ルールは含まれません**。ルールを変更したときは別途デプロイします。

```bash
# 前提: Firebase CLI がインストール済み、firebase login 済み
# プロジェクトは .firebaserc の default（yaima-funi）

npm run validate:database-rules
npm run deploy:database-rules
```

手動:

```bash
firebase deploy --only database
```

## 変更手順

1. `database.rules.json` を編集
2. `npm run validate:database-rules` で検証
3. PR でレビュー・マージ（**main にマージ済みの内容を本番に反映**）
4. `npm run deploy:database-rules`

## 変更後の確認（スモーク）

### クライアント読み取り（Android 4 画面相当）

公開読み取りが有効なため、REST で主要パスが `200` になることを確認できます。

```bash
curl -s -o /dev/null -w "%{http_code}\n" "https://yaima-funi.firebaseio.com/top_port.json?shallow=true"
curl -s -o /dev/null -w "%{http_code}\n" "https://yaima-funi.firebaseio.com/weather.json?shallow=true"
curl -s -o /dev/null -w "%{http_code}\n" "https://yaima-funi.firebaseio.com/typhoon/tenkijp.json?shallow=true"
curl -s -o /dev/null -w "%{http_code}\n" "https://yaima-funi.firebaseio.com/ykf.json?shallow=true"
```

実機では運航状況・港別詳細・天気・台風の各画面を開いて表示を確認します。

### クライアント書き込み拒否

Console ルールが `.write: false` のとき、未認証の PUT は `401` または permission エラーになります（本番で不用なデータを残さないよう、テスト用パスは使わず Console のルールエディタで確認しても可）。

### バッチ（Admin SDK）

Lambda 実行後、CloudWatch にエラーがなく、Console のデータ更新時刻が進むことを確認します。Admin SDK は Rules をバイパスするため、`.write: false` でも更新は継続します。

## Console とリポジトリの一致

Issue #172 で Console を読み取り専用に変更済みの場合、本リポジトリの [database.rules.json](../database.rules.json) と内容が同一です。マージ後にルールを再反映するときだけ `npm run deploy:database-rules` を実行します（Firebase CLI 要・`firebase login`）。

## 関連

- Android アプリは RTDB への書き込みを行いません（読み取りのみ）
- Issue: [Yaimafuni-Android #172](https://github.com/ikemura23/Yaimafuni-Android/issues/172)
