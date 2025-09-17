exports.handler = async function () {
  let admin;
  try {
    // 設定の検証
    const { validateConfig, showConfigStatus } = require('./config-validator');
    validateConfig();
    // showConfigStatus();

    admin = require('firebase-admin');

    // Initialize Firebase Admin if not already initialized
    if (!admin.apps.length) {
      // サービスアカウントキーの取得
      let serviceAccount;
      if (process.env.YAIMAFUNI_FIREBASE_SERVICE_ACCOUNT) {
        // 環境変数にJSONオブジェクトが設定されている場合
        try {
          serviceAccount = JSON.parse(process.env.YAIMAFUNI_FIREBASE_SERVICE_ACCOUNT);
        } catch (error) {
          console.error('❌ 環境変数 YAIMAFUNI_FIREBASE_SERVICE_ACCOUNT のJSON解析に失敗しました:', error.message);
          throw error;
        }
      } else {
        // デフォルトのファイルパスを使用
        serviceAccount = require('./serviceAccountKey.json');
      }

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.YAIMAFUNI_FIREBASE_DATABASE_URL,
      });
    }

    console.log('main init');

    // ControllerManagerを使用してコントローラーを統合管理
    const ControllerManager = require('./src/controllers/index.js');
    const controllerManager = new ControllerManager();

    // 他の処理（既存の処理を維持）
    const topCompany = require('./src/top/top_company.js');
    const topPort = require('./src/top/top_port.js');
    const tyhoon = require('./src/typhoon/tenkijp.js');

    // const slack = require('./slack');

    console.group('main start');

    // annei、ykf、weatherの処理をControllerManagerで統合実行
    await controllerManager.updateAll();

    // 他の処理（既存の処理を維持）
    await tyhoon();
    await topPort();
    await topCompany();

    console.groupEnd();
    console.log('main finish');
  } catch (err) {
    console.log('Error happended: ', err);
  } finally {
    // Firebase接続を適切に終了
    if (admin && admin.apps.length > 0) {
      await admin.app().delete();
    }
  }
};
