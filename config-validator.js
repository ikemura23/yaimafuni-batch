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

module.exports = {
  validateConfig,
};
