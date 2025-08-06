# ykfとanneiフォルダのアーキテクチャ統一設計書

## 概要

ykfフォルダとanneiフォルダのアーキテクチャを統一し、保守性、可読性、拡張性を向上させる。

## 現在の状況分析

### フォルダ構造
両フォルダとも同じ構造を持つ：
```
src/
├── ykf/
│   ├── controllers/
│   │   ├── list-controller.js
│   │   ├── detail-controller.js
│   │   └── time-announce-controller.js
│   ├── scrapers/
│   │   ├── list-scraper.js
│   │   ├── detail-scraper.js
│   │   └── time-announce-scraper.js
│   └── transformers/
│       ├── list-transformer.js
│       ├── detail-transformer.js
│       └── time-announce-transformer.js
└── annei/
    ├── controllers/
    ├── scrapers/
    └── transformers/
```

### 現在の違い

#### 1. コントローラーの構造
- **ykf**: 関数ベースのシンプルな構造
  ```javascript
  module.exports = async () => {
    // 直接実行可能な関数
  };
  ```
- **annei**: クラスベースの構造
  ```javascript
  class ListController {
    static async getAnneiList() { ... }
    static async saveAnneiList() { ... }
    static async updateAnneiList() { ... }
  }
  ```

#### 2. エラーハンドリング
- **ykf**: 基本的なtry-catch文
- **annei**: console.group/groupEndを使用した詳細なログ出力

#### 3. データ保存
- **ykf**: firebaseのみ
- **annei**: firebase + firestore

#### 4. スクレイピング処理
- **ykf**: BrowserHelper.executeScrapingを使用
- **annei**: 手動でブラウザの作成・クローズを管理

#### 5. Transformer処理
- **ykf**: シンプルな変換処理
- **annei**: 詳細なエラーハンドリングとログ出力

## 統一要件

### 要件1: コントローラーの統一
- anneiのクラスベース構造をykfにも適用
- 静的メソッド（get, save, update）の統一
- 既存のインターフェース維持のためのエクスポート

### 要件2: エラーハンドリングの統一
- console.group/groupEndを使用したログ出力の統一
- 詳細なエラーハンドリングの統一
- Slack通知の統一

### 要件3: データ保存の統一
- firebaseとfirestoreの両方への保存を統一
- 保存処理の抽象化

### 要件4: スクレイピング処理の統一
- BrowserHelper.executeScrapingの使用を統一
- エラーハンドリングの統一

### 要件5: Transformerの統一
- エラーハンドリングとログ出力の統一
- データ変換処理の標準化

### 要件6: ファイル構造の統一
- 各ファイルの役割と責任の明確化
- 命名規則の統一
- コメントとドキュメントの統一

## 実装優先順位

### 高優先度
1. **コントローラーの統一** - アーキテクチャの基盤
   - ykfのlist-controller.jsをannei形式に変更
   - ykfのdetail-controller.jsをannei形式に変更
   - ykfのtime-announce-controller.jsをannei形式に変更

### 中優先度
2. **エラーハンドリングとログ出力の統一**
   - console.group/groupEndの統一
   - エラーハンドリングパターンの統一

3. **データ保存処理の統一**
   - firebase + firestoreの両方への保存を統一
   - 保存処理の抽象化

### 低優先度
4. **スクレイピングとTransformerの統一**
   - BrowserHelper.executeScrapingの統一
   - Transformerのエラーハンドリング統一

## 統一後のアーキテクチャ

### コントローラーの統一パターン
```javascript
class ListController {
  static async getYkfList() { ... }
  static async saveYkfList(value) { ... }
  static async updateYkfList() { ... }
}

// 既存のインターフェースを維持
module.exports = {
  getYkfList: ListController.getYkfList,
  saveYkfList: ListController.saveYkfList,
  updateYkfList: ListController.updateYkfList,
};
```

### エラーハンドリングの統一パターン
```javascript
static async getYkfList() {
  console.group('ListController.getYkfList start');
  
  try {
    // 処理
    return result;
  } catch (error) {
    console.error('ListController.getYkfList error:', error);
    sendError(error);
    throw error;
  } finally {
    console.groupEnd();
  }
}
```

### データ保存の統一パターン
```javascript
static async saveYkfList(value) {
  console.group('ListController.saveYkfList start');
  
  try {
    await repository.set(consts.YKF, value);
    await firestoreRepository.set(consts.YKF, value);
  } catch (error) {
    console.error('ListController.saveYkfList error:', error);
    sendError(error);
    throw error;
  } finally {
    console.groupEnd();
  }
}
```

## 期待される効果

1. **保守性の向上**: 統一されたアーキテクチャにより、コードの理解と修正が容易になる
2. **可読性の向上**: 一貫したパターンにより、コードの読みやすさが向上する
3. **拡張性の向上**: 新しい機能追加時の開発効率が向上する
4. **バグの削減**: 統一されたエラーハンドリングにより、バグの発生を抑制する
5. **開発効率の向上**: 開発者が新しい機能を追加する際の学習コストが削減される

## リスクと対策

### リスク
- 既存の機能に影響を与える可能性
- 変更範囲が広いため、テストが重要

### 対策
- 既存のインターフェースを維持
- 段階的な実装とテスト
- 各段階での動作確認 