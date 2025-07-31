# Anneiリファクタリングタスク

## 概要
YKFで成功したリファクタリング構造をAnneiにも適用し、プロジェクト全体の構造を統一する。

## Phase 1: Annei専用モジュール作成

### 1.1 ディレクトリ構造作成
- [x] `src/annei/` ディレクトリ作成
- [x] `src/annei/controllers/` ディレクトリ作成
- [x] `src/annei/scrapers/` ディレクトリ作成
- [x] `src/annei/transformers/` ディレクトリ作成

**確認事項:**
- [x] ディレクトリが正しく作成されたことを確認
- [x] 既存ファイルに影響がないことを確認

## Phase 2: 共通モジュール拡張

### 2.1 port-mapper.js拡張
- [x] `src/common/port-mapper.js` にAnnei用設定を追加
  - [x] `getAnneiMapping()` メソッドの実装
  - [x] Anneiの港名と港コードのマッピング定義
  - [x] 既存のYKF機能に影響がないことを確認

**確認事項:**
- [x] Annei用の港マッピングが正常に動作することを確認
- [x] YKF用の港マッピングが正常に動作することを確認
- [x] エラーハンドリングが正常に動作することを確認

### 2.2 status-mapper.js拡張
- [x] `src/common/status-mapper.js` にAnnei用設定を追加
  - [x] `getAnneiMapping()` メソッドの実装
  - [x] Anneiのステータス記号とステータスコードのマッピング定義
  - [x] 既存のYKF機能に影響がないことを確認

**確認事項:**
- [x] Annei用のステータスマッピングが正常に動作することを確認
- [x] YKF用のステータスマッピングが正常に動作することを確認
- [x] エラーハンドリングが正常に動作することを確認

### 2.3 共通モジュールの動作確認
- [x] 既存のYKFファイルが正常に動作することを確認
- [x] 新しく追加したAnnei用機能が正常に動作することを確認

## Phase 3: 段階的ファイル移行

### 第1段階: 一覧関連ファイルの移行

#### 3.1.1 移行前準備
- [x] 現在の一覧関連ファイルの動作を記録
  - [x] `src/list/getAnneiList.js` の動作確認
  - [x] `src/list/saveAnneiList.js` の動作確認
  - [x] `src/list/updateAnneiList.js` の動作確認
- [x] バックアップの作成
  - [x] `src/list/getAnneiList.js.backup` 作成
  - [x] `src/list/saveAnneiList.js.backup` 作成
  - [x] `src/list/updateAnneiList.js.backup` 作成

#### 3.1.2 スクレイピング処理分離
- [x] `src/annei/scrapers/list-scraper.js` を作成
  - [x] `class ListScraper` の定義
  - [x] `scrapeListData()` メソッドの実装
  - [x] `getDataList()` メソッドの実装
  - [x] `BrowserHelper` の利用
  - [x] エラーハンドリングの実装

**確認事項:**
- [x] スクレイピング処理が正常に動作することを確認
- [x] 既存の処理と同じ結果が得られることを確認

#### 3.1.3 データ変換処理分離
- [x] `src/annei/transformers/list-transformer.js` を作成
  - [x] `class ListTransformer` の定義
  - [x] `transformListData()` メソッドの実装
  - [x] `PortMapper` と `StatusMapper` の利用
  - [x] エラーハンドリングの実装

**確認事項:**
- [x] データ変換処理が正常に動作することを確認
- [x] 既存の処理と同じ結果が得られることを確認

#### 3.1.4 エントリーポイント統合
- [x] `src/annei/controllers/list-controller.js` を作成
  - [x] 既存の3つのファイル（get, save, update）の機能を統合
  - [x] `ListScraper` と `ListTransformer` の利用
  - [x] Firebase操作の統合
  - [x] エラーハンドリングとログ出力の実装
  - [x] 既存の `module.exports` インターフェースを維持

**確認事項:**
- [x] 統合されたコントローラーが正常に動作することを確認
- [x] 既存の呼び出し元からの利用が可能であることを確認
- [x] 各機能（get, save, update）が正常に動作することを確認

### 第2段階: 時間・アナウンス関連ファイルの移行

#### 3.2.1 移行前準備
- [x] 現在の時間・アナウンス関連ファイルの動作を記録
  - [x] `src/list/getAnneiUpdateTimeAndComment.js` の動作確認
- [x] バックアップの作成
  - [x] `src/list/getAnneiUpdateTimeAndComment.js.backup` 作成

#### 3.2.2 スクレイピング処理分離
- [x] `src/annei/scrapers/time-announce-scraper.js` を作成
  - [x] `class TimeAnnounceScraper` の定義
  - [x] `scrapeTimeAndAnnounceData()` メソッドの実装
  - [x] `getUpdateTime()` メソッドの実装
  - [x] `getAnnounce()` メソッドの実装
  - [x] `BrowserHelper` の利用
  - [x] エラーハンドリングの実装

**確認事項:**
- [x] スクレイピング処理が正常に動作することを確認
- [x] 既存の処理と同じ結果が得られることを確認

#### 3.2.3 データ変換処理分離
- [x] `src/annei/transformers/time-announce-transformer.js` を作成
  - [x] `class TimeAnnounceTransformer` の定義
  - [x] `transformTimeAndAnnounceData()` メソッドの実装
  - [x] エラーハンドリングの実装

**確認事項:**
- [x] データ変換処理が正常に動作することを確認
- [x] 既存の処理と同じ結果が得られることを確認

#### 3.2.4 エントリーポイント統合
- [x] `src/annei/controllers/time-announce-controller.js` を作成
  - [x] 既存ファイルの機能を統合
  - [x] `TimeAnnounceScraper` と `TimeAnnounceTransformer` の利用
  - [x] Firebase操作の統合
  - [x] エラーハンドリングとログ出力の実装
  - [x] 既存の `module.exports` インターフェースを維持

**確認事項:**
- [x] 統合されたコントローラーが正常に動作することを確認
- [x] 既存の呼び出し元からの利用が可能であることを確認

### 第3段階: 詳細関連ファイルの移行

#### 3.3.1 移行前準備
- [x] 現在の詳細関連ファイルの動作を記録
  - [x] `src/detail/getAnneiDetail.js` の動作確認
  - [x] `src/detail/saveAnneiDetail.js` の動作確認
  - [x] `src/detail/updateAnneiDetail.js` の動作確認
- [x] バックアップの作成
  - [x] `src/detail/getAnneiDetail.js.backup` 作成
  - [x] `src/detail/saveAnneiDetail.js.backup` 作成
  - [x] `src/detail/updateAnneiDetail.js.backup` 作成

#### 3.3.2 スクレイピング処理分離
- [x] `src/annei/scrapers/detail-scraper.js` を作成
  - [x] `class DetailScraper` の定義
  - [x] `scrapeDetailData()` メソッドの実装
  - [x] `getData()` メソッドの実装
  - [x] `getStatusData()` メソッドの実装
  - [x] `BrowserHelper` の利用
  - [x] エラーハンドリングの実装

**確認事項:**
- [x] スクレイピング処理が正常に動作することを確認
- [x] 既存の処理と同じ結果が得られることを確認

#### 3.3.3 データ変換処理分離
- [x] `src/annei/transformers/detail-transformer.js` を作成
  - [x] `class DetailTransformer` の定義
  - [x] `transformDetailData()` メソッドの実装
  - [x] `StatusMapper` の利用
  - [x] エラーハンドリングの実装

**確認事項:**
- [x] データ変換処理が正常に動作することを確認
- [x] 既存の処理と同じ結果が得られることを確認

#### 3.3.4 エントリーポイント統合
- [x] `src/annei/controllers/detail-controller.js` を作成
  - [x] 既存の3つのファイル（get, save, update）の機能を統合
  - [x] `DetailScraper` と `DetailTransformer` の利用
  - [x] Firebase操作の統合
  - [x] エラーハンドリングとログ出力の実装
  - [x] 既存の `module.exports` インターフェースを維持

**確認事項:**
- [x] 統合されたコントローラーが正常に動作することを確認
- [x] 既存の呼び出し元からの利用が可能であることを確認
- [x] 各機能（get, save, update）が正常に動作することを確認

## Phase 4: 最終調整

### 4.1 index.jsの更新
- [x] `index.js` の `require` パスを更新
  - [x] Annei関連の `require` パスを新しい構造に変更
  - [x] 既存のYKF関連の `require` パスが正常であることを確認

**確認事項:**
- [x] 更新後の `index.js` が正常に動作することを確認
- [x] 全ての機能が正常に呼び出されることを確認

### 4.2 既存ファイルの削除
- [ ] 移行が完了した既存ファイルの削除
  - [ ] `src/list/getAnneiList.js` 削除
  - [ ] `src/list/saveAnneiList.js` 削除
  - [ ] `src/list/updateAnneiList.js` 削除
  - [ ] `src/list/getAnneiUpdateTimeAndComment.js` 削除
  - [ ] `src/detail/getAnneiDetail.js` 削除
  - [ ] `src/detail/saveAnneiDetail.js` 削除
  - [ ] `src/detail/updateAnneiDetail.js` 削除

**確認事項:**
- [ ] 削除後もアプリケーションが正常に動作することを確認
- [ ] 空になったディレクトリの削除（必要に応じて）

### 4.3 全体動作確認
- [x] 全てのAnnei機能が正常に動作することを確認
- [x] 全てのYKF機能が正常に動作することを確認
- [x] パフォーマンスに大きな劣化がないことを確認
- [x] エラーハンドリングが正常に動作することを確認

### 4.4 バックアップファイルの削除
- [ ] 移行が成功したことを確認後、バックアップファイルを削除
- [ ] 不要になった `.backup` ファイルの削除

## ロールバック計画

### 各段階でのロールバック手順
1. **Phase 2で問題が発生した場合**
   - 共通モジュールの変更を元に戻す
   - 既存のYKF機能が正常に動作することを確認

2. **Phase 3の各段階で問題が発生した場合**
   - 該当段階のバックアップファイルを復元
   - 前段階の状態に戻す
   - 問題の原因を特定して修正

3. **Phase 4で問題が発生した場合**
   - `index.js` の変更を元に戻す
   - 既存ファイルを復元
   - 問題の原因を特定して修正

## 完了条件

- [x] 全てのAnnei機能が新しい構造で正常に動作する
- [x] 全てのYKF機能が正常に動作する
- [x] 共通モジュールが両方の会社で正常に動作する
- [x] プロジェクト全体の構造が統一される
- [x] 保守性とテスタビリティが向上する
- [x] 既存の外部インターフェースに影響がない 