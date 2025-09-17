/**
 * 設定検証モジュール
 * 環境変数の必須チェック機能を提供
 */

/**
 * 環境変数の設定を検証する
 * @throws {Error} 必須環境変数が設定されていない場合
 */
function validateConfig() {
  const requiredEnvVars = [
    'YAIMAFUNI_FIREBASE_DATABASE_URL', // Realtime Database用
    'YAIMAFUNI_SLACK_WEBHOOK_URL', // Slack通知用
  ];

  const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  console.log('✅ 環境変数の検証が完了しました');
}

/**
 * 環境変数の設定状況を表示する（セキュリティ考慮版）
 * 機密情報は表示せず、設定の有無のみを確認
 * 本番環境では自動的に無効化される
 */
function showConfigStatus() {
  // 本番環境では設定状況を表示しない（セキュリティのため）
  if (process.env.NODE_ENV === 'production') {
    console.log('🔍 設定状況の表示は本番環境では無効化されています（セキュリティのため）');
    return;
  }

  console.log('🔍 環境変数の設定状況:');
  console.log(
    '  YAIMAFUNI_FIREBASE_DATABASE_URL:',
    process.env.YAIMAFUNI_FIREBASE_DATABASE_URL ? '✅ 設定済み' : '❌ 未設定'
  );
  console.log(
    '  YAIMAFUNI_FIREBASE_SERVICE_ACCOUNT:',
    process.env.YAIMAFUNI_FIREBASE_SERVICE_ACCOUNT
      ? '✅ 設定済み（JSON形式）'
      : 'デフォルト値: ./serviceAccountKey.json'
  );
  console.log('  YAIMAFUNI_SLACK_WEBHOOK_URL:', process.env.YAIMAFUNI_SLACK_WEBHOOK_URL ? '✅ 設定済み' : '❌ 未設定');
}

module.exports = {
  validateConfig,
  showConfigStatus,
};
