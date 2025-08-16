# アーキテクチャドキュメント

## プロジェクト概要

八重山船旅情報収集システムは、八重山観光フェリー(YKF)と安栄観光(ANNEI)の船舶運航情報をスクレイピングして管理するバッチ処理システムです。

## モジュール構成

本システムは以下の2つのメインモジュールで構成されています：

- **annei** - 安栄観光の運航情報を処理
- **ykf** - 八重山観光フェリーの運航情報を処理

## 統一アーキテクチャ

両モジュールは以下の3層アーキテクチャを採用しています：

```
src/
├── annei/
│   ├── controllers/     # ビジネスロジック層
│   ├── scrapers/        # データ取得層
│   └── transformers/    # データ変換層
└── ykf/
    ├── controllers/     # ビジネスロジック層
    ├── scrapers/        # データ取得層
    └── transformers/    # データ変換層
```

### 各層の責務

#### 1. Controllers（コントローラー層）
- **責務**: ビジネスロジックとワークフロー制御
- **主要メソッド**:
  - `get{Company}Detail()` - 詳細データの取得処理
  - `save{Company}Detail()` - 詳細データの保存処理
  - `update{Company}Detail()` - 詳細データの更新処理
  - `get{Company}List()` - リストデータの取得処理（該当する場合）
  - `save{Company}List()` - リストデータの保存処理（該当する場合）
  - `update{Company}List()` - リストデータの更新処理（該当する場合）

#### 2. Scrapers（スクレイパー層）
- **責務**: 外部サイトからのデータ取得
- **主要メソッド**:
  - `scrapeDetailData()` - 詳細ページのスクレイピング
  - `getData()` - データ取得の統合処理
  - `getStatusData()` - ステータス情報の取得
  - `getRowStatusCode()` - 行レベルのステータスコード取得
  - `getRowStatusText()` - 行レベルのステータステキスト取得

#### 3. Transformers（変換器層）
- **責務**: 取得データの正規化と構造化
- **主要メソッド**:
  - `transformDetailData()` - 詳細データの変換処理
  - `getRowStatusCode()` - ステータスコードの正規化
  - `getRowStatusText()` - ステータステキストの正規化
  - `normalizeRowStatus()` - ステータス情報の正規化（ANNEIのみ）

## データ処理の種類

各モジュールは以下の3種類のデータ処理を提供します：

### 1. Detail（詳細データ）
- **用途**: 個別の運航詳細情報
- **ファイル**: `detail-controller.js`, `detail-scraper.js`, `detail-transformer.js`

### 2. List（リストデータ）
- **用途**: 運航情報の一覧
- **ファイル**: `list-controller.js`, `list-scraper.js`, `list-transformer.js`

### 3. Time Announce（運行時刻・お知らせ）
- **用途**: 運行時刻とお知らせ情報
- **ファイル**: `time-announce-controller.js`, `time-announce-scraper.js`, `time-announce-transformer.js`

## アーキテクチャの特徴

### 1. 責務の分離
- データ取得、変換、ビジネスロジックを明確に分離
- 各層が独立してテスト可能

### 2. 統一性
- 両モジュール間で一貫したAPI設計
- 同一のメソッド命名規則とファイル構成

### 3. 拡張性
- 新しいフェリー会社の追加が容易
- 各層での機能拡張が他層に影響しない

### 4. 保守性
- モジュール間の依存関係が明確
- コードの可読性と理解しやすさを重視

## データフロー

```
外部サイト → Scraper → Transformer → Controller → Database
```

1. **Scraper**が外部サイトからRawデータを取得
2. **Transformer**がデータを正規化・構造化
3. **Controller**がビジネスロジックを適用してデータベースに保存

## 使用技術

- **Node.js**: JavaScript実行環境
- **Browser Automation**: スクレイピング用ブラウザ制御
- **Firestore**: データ永続化
- **状態管理**: StatusMapperによるステータス正規化

このアーキテクチャにより、安定性、保守性、拡張性を兼ね備えた船舶運航情報管理システムを実現しています。