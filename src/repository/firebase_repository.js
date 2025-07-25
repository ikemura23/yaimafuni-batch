const admin = require('firebase-admin');
const config = require('../config/config');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require('../../serviceAccountKey.json')),
    databaseURL: config.firebase.databaseURL,
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
