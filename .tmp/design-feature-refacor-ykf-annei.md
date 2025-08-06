# index.jsのコントローラー呼び出し統一設計書

## 概要

index.jsにおけるanneiとykfのコントローラー呼び出し方法を統一し、テスト導入時の保守性と拡張性を向上させる。

## 現在の状況分析

### 問題点

1. **呼び出し方法の不統一**

   ```javascript
   // Annei - 個別の関数をインポート
   const updateAnneiList = require('./src/annei/controllers/list-controller.js').updateAnneiList;

   // YKF - モジュール全体をインポート
   const YkfList = require('./src/ykf/controllers/list-controller.js');
   ```

2. **テスト時の問題**
   - モジュール全体をインポートしている場合、テスト時にモック化が困難
   - 依存関係が不明確

3. **コードの冗長性**
   - 似たような処理が繰り返されている
   - 新しいコントローラー追加時の手間

## 統一要件

### 要件1: テスト容易性の確保

- テスト時に個別関数をモック化可能な構造
- 依存関係の明確化

### 要件2: 保守性の向上

- 統一された呼び出しパターン
- 拡張性の高い設計

### 要件3: 可読性の向上

- 処理の流れが明確
- 命名規則の統一

## 推奨解決案: コントローラー管理クラス

### アーキテクチャ概要

```
src/
├── controllers/
│   └── index.js          # 新規作成: コントローラー管理クラス
├── annei/
│   └── controllers/
├── ykf/
│   └── controllers/
└── index.js              # 修正: 管理クラスを使用
```

### コントローラー管理クラスの設計

```javascript
// src/controllers/index.js
class ControllerManager {
  constructor() {
    this.annei = {
      list: require('./annei/controllers/list-controller.js').updateAnneiList,
      detail: require('./annei/controllers/detail-controller.js').updateAnneiDetail,
      time: require('./annei/controllers/time-announce-controller.js').updateAnneiUpdateTimeAndComment,
    };

    this.ykf = {
      list: require('./ykf/controllers/list-controller.js').updateYkfList,
      detail: require('./ykf/controllers/detail-controller.js').updateYkfDetail,
      time: require('./ykf/controllers/time-announce-controller.js').updateYkfUpdateTimeAndComment,
    };
  }

  async updateAll() {
    // Annei処理
    await this.annei.list();
    await this.annei.detail();

    // YKF処理
    await this.ykf.list();
    await this.ykf.time();
    await this.ykf.detail();

    // 他の処理（既存の処理を統合）
    // await this.weather.update();
    // await this.typhoon.update();
    // など
  }

  // 個別実行メソッド（テスト用）
  async updateAnneiList() {
    return await this.annei.list();
  }

  async updateYkfList() {
    return await this.ykf.list();
  }
}

module.exports = ControllerManager;
```

### index.jsでの使用例

```javascript
// index.js
const ControllerManager = require('./src/controllers/index.js');

exports.handler = async function () {
  let admin;
  try {
    // Firebase初期化処理（既存）

    const controllerManager = new ControllerManager();

    console.group('main start');
    await controllerManager.updateAll();
    console.groupEnd();

    console.log('main finish');
  } catch (err) {
    console.log('Error happened: ', err);
  } finally {
    // Firebase接続終了処理（既存）
  }
};
```

## 期待される効果

### 1. テスト容易性の向上

```javascript
// テスト例
const ControllerManager = require('./src/controllers/index.js');
jest.mock('./src/controllers/index.js');

// クラス全体をモック化可能
const mockControllerManager = {
  updateAll: jest.fn(),
  updateAnneiList: jest.fn(),
  updateYkfList: jest.fn(),
};
```

### 2. 保守性の向上

- 新しいコントローラー追加時の変更箇所が明確
- 依存関係の管理が容易

### 3. 可読性の向上

- 処理の流れが明確
- 責任の分離が適切

### 4. 拡張性の向上

- 新しいサービス追加時の拡張が容易
- 設定駆動型への移行も可能

## 実装優先順位

### 高優先度

1. **ControllerManagerクラスの作成**
2. **index.jsの修正**
3. **動作確認とテスト**

### 中優先度

4. **他の処理（weather, typhoon等）の統合**
5. **設定駆動型への拡張**

## リスクと対策

### リスク

- 既存の処理に影響を与える可能性
- 新しいクラスの学習コスト

### 対策

- 段階的な実装
- 既存の処理を維持しながら統合
- 十分なテストの実施

## 移行戦略

### Phase 1: 基盤構築

1. ControllerManagerクラスの作成
2. 基本的な統合処理の実装

### Phase 2: 段階的統合

1. AnneiとYKFの統合
2. 動作確認

### Phase 3: 拡張

1. 他の処理の統合
2. 設定駆動型への移行検討
