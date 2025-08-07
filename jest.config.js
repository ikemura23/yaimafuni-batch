module.exports = {
  // テスト環境
  testEnvironment: 'node',

  // テストファイルのパターン
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],

  // カバレッジレポートの出力先
  coverageDirectory: 'coverage',

  // カバレッジから除外するファイル
  coveragePathIgnorePatterns: ['/node_modules/', '/coverage/', '/__tests__/'],

  // テスト実行時の詳細なログ出力
  verbose: true,

  // テストタイムアウト（ミリ秒）
  testTimeout: 30000,

  // モックの自動復元
  restoreMocks: true,

  // クリーンアップ
  clearMocks: true,
};
