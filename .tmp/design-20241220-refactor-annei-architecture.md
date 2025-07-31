# Anneiフォルダ内リファクタリング設計

## 現状分析

### 現在のファイル構成

```
src/
├── list/
│   ├── getAnneiList.js (一覧取得)
│   ├── saveAnneiList.js (一覧保存)
│   ├── updateAnneiList.js (一覧更新)
│   ├── getAnneiUpdateTimeAndComment.js (更新時間・コメント取得)
│   └── ykf/ (既にリファクタリング済み)
├── detail/
│   ├── getAnneiDetail.js (詳細取得)
│   ├── saveAnneiDetail.js (詳細保存)
│   ├── updateAnneiDetail.js (詳細更新)
│   └── ykf/ (既にリファクタリング済み)
└── common/ (YKFリファクタリングで作成済み)
    ├── browser-helper.js
    ├── port-mapper.js
    └── status-mapper.js
```

### 現状の問題点

1. **重複コード**
   - ブラウザ作成・ページ設定の処理が各ファイルで重複
   - エラーハンドリング処理が各ファイルで重複
   - 港名から港コード変換の処理が複数ファイルで重複
   - ステータスコード変換の処理が複数ファイルで重複

2. **責務の混在**
   - スクレイピング処理とデータ変換処理が混在
   - ビジネスロジックとインフラ処理が混在

3. **保守性の課題**
   - 共通処理の変更時に複数ファイルの修正が必要
   - テストが困難（責務が混在しているため）

4. **構造の不統一**
   - YKFは整理された構造だが、Anneiは古い構造のまま
   - 共通モジュールの恩恵を受けていない

## リファクタリング方針

### 基本原則

- **YKFと同様の構造**: YKFで成功した構造をAnneiにも適用
- **共通モジュールの活用**: 既存の共通モジュールを最大限活用
- **段階的移行**: 1ファイルずつ安全に移行
- **既存インターフェース維持**: 外部からの呼び出しに影響を与えない

### 設計概要

#### 1. Annei専用モジュールの作成

```
src/
├── common/ (既存)
│   ├── browser-helper.js
│   ├── port-mapper.js
│   └── status-mapper.js
└── annei/ (新規作成)
    ├── controllers/          ← エントリーポイント
    │   ├── list-controller.js
    │   ├── time-announce-controller.js
    │   └── detail-controller.js
    ├── scrapers/            ← スクレイピング処理
    │   ├── list-scraper.js
    │   ├── time-announce-scraper.js
    │   └── detail-scraper.js
    └── transformers/        ← データ変換処理
        ├── list-transformer.js
        ├── time-announce-transformer.js
        └── detail-transformer.js
```

#### 2. 既存ファイルの役割変更

- 既存のファイルは**エントリーポイント**として機能
- スクレイピング、変換、保存の流れを制御
- エラーハンドリングとログ出力を担当

#### 3. 共通モジュールの活用

- **browser-helper.js**: ブラウザ操作の共通処理
- **port-mapper.js**: Annei用の港マッピング設定を追加
- **status-mapper.js**: Annei用のステータスマッピング設定を追加

## 段階的実装計画

### Phase 1: Annei専用モジュール作成

1. `src/annei/` ディレクトリ作成
2. `src/annei/controllers/` ディレクトリ作成
3. `src/annei/scrapers/` ディレクトリ作成
4. `src/annei/transformers/` ディレクトリ作成

### Phase 2: 共通モジュール拡張

1. `port-mapper.js` にAnnei用設定を追加
2. `status-mapper.js` にAnnei用設定を追加
3. 動作確認

### Phase 3: 段階的ファイル移行（1ファイルずつ）

#### 第1段階: 一覧関連ファイルの移行

1. **移行前準備**
   - 現在の動作を記録
   - バックアップの作成

2. **スクレイピング処理分離**
   - `src/annei/scrapers/list-scraper.js` を作成
   - 一覧スクレイピング処理を分離
   - 共通モジュールの利用

3. **データ変換処理分離**
   - `src/annei/transformers/list-transformer.js` を作成
   - 一覧データ変換処理を分離
   - 共通モジュールの利用

4. **エントリーポイント統合**
   - `src/annei/controllers/list-controller.js` を作成
   - 既存の3つのファイル（get, save, update）を統合
   - 分離したモジュールの利用

#### 第2段階: 時間・アナウンス関連ファイルの移行

1. **移行前準備**
   - 現在の動作を記録
   - バックアップの作成

2. **スクレイピング処理分離**
   - `src/annei/scrapers/time-announce-scraper.js` を作成
   - 時間・アナウンススクレイピング処理を分離

3. **データ変換処理分離**
   - `src/annei/transformers/time-announce-transformer.js` を作成
   - 時間・アナウンスデータ変換処理を分離

4. **エントリーポイント統合**
   - `src/annei/controllers/time-announce-controller.js` を作成
   - 既存ファイルを統合

#### 第3段階: 詳細関連ファイルの移行

1. **移行前準備**
   - 現在の動作を記録
   - バックアップの作成

2. **スクレイピング処理分離**
   - `src/annei/scrapers/detail-scraper.js` を作成
   - 詳細スクレイピング処理を分離

3. **データ変換処理分離**
   - `src/annei/transformers/detail-transformer.js` を作成
   - 詳細データ変換処理を分離

4. **エントリーポイント統合**
   - `src/annei/controllers/detail-controller.js` を作成
   - 既存の3つのファイル（get, save, update）を統合

### Phase 4: 最終調整

1. 既存ファイルの削除
2. index.jsの更新
3. 全体動作確認
4. ドキュメント更新

## 各段階での動作確認方法

### 移行前の準備

- 現在の動作を記録（ログ、データ出力）
- テストケースの準備

### 移行後の確認

- 同じ入力で同じ出力が得られることを確認
- エラーハンドリングが正常に動作することを確認
- パフォーマンスに大きな劣化がないことを確認

### ロールバック計画

- 各段階で既存ファイルのバックアップを保持
- 問題発生時は即座に前段階に戻せる体制

## 期待される効果

1. **保守性向上**
   - 共通処理の変更が1箇所で済む
   - 責務が明確に分離される

2. **テスタビリティ向上**
   - 各処理が独立しているため単体テストが容易
   - モック化が簡単

3. **再利用性向上**
   - 共通処理が他の会社のスクレイピングでも利用可能
   - 新しい機能追加時の開発効率向上

4. **可読性向上**
   - 各ファイルの責務が明確
   - コードの見通しが良くなる

5. **構造の統一**
   - YKFとAnneiで同じ構造
   - プロジェクト全体の一貫性向上

## 注意事項

- 既存の外部インターフェース（module.exports）は変更しない
- 既存の呼び出し元への影響は最小限に抑制
- 各段階で十分な動作確認を行い、問題があれば即座にロールバック
- 共通モジュールの拡張は既存機能に影響を与えないよう注意
