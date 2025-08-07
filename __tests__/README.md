# テストガイド

このディレクトリには、プロジェクトの単体テストが含まれています。

## テスト実行方法

### 基本的なテスト実行

```bash
npm test
```

### ウォッチモード（ファイル変更時に自動実行）

```bash
npm run test:watch
```

### カバレッジレポート付きテスト実行

```bash
npm run test:coverage
```

## テストファイル構成

### `controllers.test.js`

ControllerManagerクラスの包括的な単体テスト

#### テスト内容

- **constructor**: コントローラーの初期化テスト
- **updateAll**: 全コントローラー実行の統合テスト
- **updateAnneiList**: Annei一覧更新の単体テスト
- **updateAnneiDetail**: Annei詳細更新の単体テスト
- **updateYkfList**: YKF一覧更新の単体テスト
- **updateYkfDetail**: YKF詳細更新の単体テスト
- **updateYkfTime**: YKF時間・アナウンス更新の単体テスト
- **統合テスト**: 複数メソッドの連続実行テスト

#### テストケース

各メソッドに対して以下のテストケースを実装：

- 正常実行時の動作確認
- エラー発生時のエラーハンドリング確認
- ログ出力の確認
- モック関数の呼び出し回数確認

## モックの使用

テストでは、実際のコントローラー関数をモック化して、外部依存を排除しています：

```javascript
jest.mock('../src/annei/controllers/list-controller.js', () => ({
  updateAnneiList: jest.fn(),
}));
```

これにより、実際のスクレイピング処理を実行せずに、ControllerManagerのロジックのみをテストできます。

## テストの特徴

### 1. 完全なカバレッジ

- 全てのメソッドと分岐をテスト
- 100%のコードカバレッジを達成

### 2. エラーハンドリングのテスト

- 各メソッドでエラーが発生した場合の動作を確認
- エラーが適切に再スローされることを検証

### 3. ログ出力の検証

- console.log、console.error、console.group、console.groupEndの呼び出しを検証
- 適切なログメッセージが出力されることを確認

### 4. 非同期処理のテスト

- async/awaitを使用した非同期メソッドのテスト
- Promiseの解決と拒否の両方をテスト

## テストの追加方法

新しいテストを追加する場合は、以下のパターンに従ってください：

```javascript
describe('新しいメソッド', () => {
  test('正常実行時のテスト', async () => {
    // モックの設定
    controllerManager.someMethod.mockResolvedValue();

    // メソッドの実行
    await controllerManager.someMethod();

    // 検証
    expect(controllerManager.someMethod).toHaveBeenCalledTimes(1);
  });

  test('エラー発生時のテスト', async () => {
    const testError = new Error('Test error');
    controllerManager.someMethod.mockRejectedValue(testError);

    await expect(controllerManager.someMethod()).rejects.toThrow('Test error');
  });
});
```

## 注意事項

- テスト実行前に`npm install`でJestがインストールされていることを確認
- モック関数は各テスト後に自動的にクリアされる
- テストタイムアウトは30秒に設定されている
