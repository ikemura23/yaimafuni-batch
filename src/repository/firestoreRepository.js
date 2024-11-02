var admin = require("firebase-admin");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
var serviceAccount = require("../../serviceAccountKey.json");

const config = require("../config/config");

initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: config.firebase.databaseURL,
});

const db = getFirestore();

const docRef = db.collection("dev");

module.exports = {
  // 読み込み
  read: async (path) => {
    if (!path) return null;
    return await docRef
      .doc(path)
      .get()
      .then((snapshot) => {
        return snapshot.data();
      });
  },

  // 更新
  update: async function update(path, data) {
    if (!path) return;
    if (!data) return;

    return await docRef.doc(path).update(data);
  },
  set: async function set(path, data) {
    if (!path) return;
    if (!data) return;

    return await docRef.doc(path).set(data);
  },
};
