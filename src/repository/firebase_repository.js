const admin = require('firebase-admin');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  // サービスアカウントキーの取得
  let serviceAccount;
  if (process.env.YAIMAFUNI_FIREBASE_SERVICE_ACCOUNT) {
    // 環境変数からJSONをパース
    serviceAccount = JSON.parse(process.env.YAIMAFUNI_FIREBASE_SERVICE_ACCOUNT);
  } else {
    // デフォルトのファイルから読み込み
    serviceAccount = require('../../serviceAccountKey.json');
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.YAIMAFUNI_FIREBASE_DATABASE_URL,
  });
}

const database = admin.database();

/**
 * Firebaseのリポジトリ
 */
module.exports = {
  // 読み込み
  read: async (path) => {
    if (!path) return null;
    return await database
      .ref(path)
      .once('value')
      .then((snapshot) => {
        return snapshot.val();
      });
  },

  // 更新
  update: async function update(path, data) {
    // console.log(`update path: ${path}`);
    // console.log(`update data: ${data}`);

    if (!path) return;
    if (!data) return;

    // try {
    return await database.ref(path).update(data, (e) => {
      if (e) {
        console.error('update error');
      } else {
        console.log('update complete!');
      }
    });
    // } catch (error) {
    //   console.error(error);
    // }
  },
  set: async function set(path, data) {
    if (!path) return;
    if (!data) return;

    // try {
    return await database.ref(path).set(data, (e) => {
      if (e) {
        console.error('update error');
      } else {
        console.log('update complete!');
      }
    });
  },
};
