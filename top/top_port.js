const firebase = require("firebase");
const consts = require('../consts.js');

let anei = {};
let ykf = {};

let taketomi= {};
let kohama= {};
let kuroshima= {};
let oohara= {};
let uehara= {};
let hatoma= {};
let hateruma= {};

/**
 * メイン処理
 */
module.exports = (async () => {
  return Promise.resolve()
    .then(() => console.log('開始 港別の作成 '))
    .then(() => readDatabase(consts.ANEI))
    .then(data => anei = data)
    .then(() => readDatabase(consts.YKF))
    .then(data => ykf = data)
    .then(() => createSendData())
    .then(data => sendToFirebase(data))
    .then(() => console.log('完了 港別の作成'))
})

/**
 * firebaeから取得した値を返す
 */
function readDatabase(path) {
  return firebase.database()
    .ref(path)
    .once('value')
    .then(function (snapshot) {
      return snapshot.val();
    })
}

/**
 * firebaseへ送信
 */
function sendToFirebase(data) {
  return firebase.database()
    .ref('top_port')
    .set(data)
}

/**
 * 送信用の変数を作成して返す
 */
function createSendData() {
  // 竹富
  const taketomi = {
    anei: anei.taketomi,
    ykf: ykf.taketomi,
  }
  // 小浜
  const kohama = {
    anei: anei.kohama,
    ykf: ykf.kohama,
  }
  // 黒島
  const kuroshima = {
    anei: anei.kuroshima,
    ykf: ykf.kuroshima,
  }
  // 大原
  const oohara = {
    anei: anei.oohara,
    ykf: ykf.oohara,
  }
  // 上原
  const uehara = {
    anei: anei.uehara,
    ykf: ykf.uehara,
  }
  // 鳩間
  const hatoma = {
    anei: anei.hatoma,
    ykf: ykf.hatoma,
  }
  // 波照間
  const hateruma = {
    anei: anei.hateruma
  }
  return Promise.resolve({
    taketomi,
    kohama,
    kuroshima,
    oohara,
    uehara,
    hatoma,
    hateruma
  })
}