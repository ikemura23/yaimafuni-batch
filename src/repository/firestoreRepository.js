const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');

const config = require('../config/config');

let db = null;

/**
 * サービスアカウント設定を取得
 */
function getServiceAccount() {
  // 環境変数から取得
  if (process.env.YAIMAFUNI_FIREBASE_SERVICE_ACCOUNT) {
    try {
      return JSON.parse(process.env.YAIMAFUNI_FIREBASE_SERVICE_ACCOUNT);
    } catch (error) {
      console.error('Failed to parse YAIMAFUNI_FIREBASE_SERVICE_ACCOUNT:', error);
      throw new Error('Invalid YAIMAFUNI_FIREBASE_SERVICE_ACCOUNT environment variable');
    }
  }

  throw new Error('YAIMAFUNI_FIREBASE_SERVICE_ACCOUNT environment variable is not set');
}

/**
 * Firestoreの初期化
 */
function initializeFirestore() {
  if (!admin.apps.length) {
    const serviceAccount = getServiceAccount();
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: config.firebase.databaseURL,
    });
  }
  if (!db) {
    db = getFirestore();
  }
  return db;
}

/**
 * コレクション参照を取得
 */
function getCollection() {
  const firestore = initializeFirestore();
  const collectionName = config.firebase.firestore?.collection || 'dev';
  return firestore.collection(collectionName);
}

/**
 * Firestoreリポジトリ
 */
module.exports = {
  /**
   * ドキュメント読み込み
   * @param {string} path - ドキュメントパス
   * @returns {Promise<Object|null>} ドキュメントデータ
   */
  read: async (path) => {
    if (!path) return null;

    try {
      const collection = getCollection();
      const snapshot = await collection.doc(path).get();
      return snapshot.exists ? snapshot.data() : null;
    } catch (error) {
      console.error(`Firestore read error for path ${path}:`, error);
      throw error;
    }
  },

  /**
   * ドキュメント更新
   * @param {string} path - ドキュメントパス
   * @param {Object} data - 更新データ
   * @returns {Promise<void>}
   */
  update: async function update(path, data) {
    if (!path) throw new Error('Path is required');
    if (!data) throw new Error('Data is required');

    try {
      const collection = getCollection();
      await collection.doc(path).update(data);
    } catch (error) {
      console.error(`Firestore update error for path ${path}:`, error);
      throw error;
    }
  },

  /**
   * ドキュメント作成/上書き
   * @param {string} path - ドキュメントパス
   * @param {Object} data - 保存データ
   * @returns {Promise<void>}
   */
  set: async function set(path, data) {
    if (!path) throw new Error('Path is required');
    if (!data) throw new Error('Data is required');

    try {
      const collection = getCollection();
      await collection.doc(path).set(data);
    } catch (error) {
      console.error(`Firestore set error for path ${path}:`, error);
      throw error;
    }
  },

  /**
   * コレクション内の全ドキュメント取得
   * @returns {Promise<Array>} ドキュメント配列
   */
  getAll: async function getAll() {
    try {
      const collection = getCollection();
      const snapshot = await collection.get();
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Firestore getAll error:', error);
      throw error;
    }
  },

  /**
   * ドキュメント削除
   * @param {string} path - ドキュメントパス
   * @returns {Promise<void>}
   */
  delete: async function deleteDoc(path) {
    if (!path) throw new Error('Path is required');

    try {
      const collection = getCollection();
      await collection.doc(path).delete();
    } catch (error) {
      console.error(`Firestore delete error for path ${path}:`, error);
      throw error;
    }
  },
};
