const firebase = require("firebase");
const consts = require('./consts.js');
const sendError = require('./slack');

const TABLE = 'top_port/';
const sendData = {};
const aneiData = new Map();
const ykfData = new Map();
const dreamData = new Map();
/*
firebaseから一覧を読み込む
読み込み完了後、港ずつステータスを判定して結果を変数に格納
  竹富 :（安永：通常運行、YKF：欠航あり、ドリーム：未定あり）
変数をDBに登録
*/

/**
 * 外部からの呼び出し用メソッド
 */
function run() {
  return Promise.resolve()
    .then(() => console.log('開始 トップ 港別'))
    .then(() => readAllData())
    .then(() => createStatus(consts.TAKETOMI))
    .then(() => createStatus(consts.KOHAMA))
    .then(() => createStatus(consts.KUROSHIMA))
    .then(() => createStatus(consts.UEHARA))
    .then(() => createStatus(consts.OOHARA))
    .then(() => createStatus(consts.HATOMA))
    .then(() => createStatus(consts.HATERUMA))
    .then(() => sendFirebase())
    .catch((error) => sendError(error.stack))
    .then(() => console.log('完了 トップ 港別'))
}

function readAllData() {
  return Promise.all([
    readFirebase(consts.ANEI, aneiData),
    readFirebase(consts.YKF, ykfData),
    readFirebase(consts.DREAM, dreamData)
  ])
}

function getReadTableName(company) {
  switch (company) {
    case consts.ANEI:
      return 'anei_status/statuses';
    case consts.YKF:
      return 'ykf_status/statuses';
    case consts.DREAM:
      return 'dream_status/statuses';
  }
}

/**
 * DBから指定された会社の運行一覧を取得し、加工して渡されたグローバル変数に格納
 */
function readFirebase(company, data) {
  const tableName = getReadTableName(company);
  return firebase.database().ref(tableName).once('value')
    .then(function(snapshot) {
      const statuses = [];
      snapshot.forEach(function(element) {
        const portData = element.val();
        if (portData.code == undefined) return false; //港コードを持っていないカラムはコメントか更新日時なのでスキップ
        data.set(portData.code, portData.status);
      });
    });
}

/**
 * 配列の運行結果をみて運行コメントを作成する
 * @param {aneiの運行結果配列} statuses 
 */
function createStatus(port) {
  // console.log(port);

  // 送信用の変数
  const data = {
    comment: '',
    status: {},
    cationFlag: false,
    cancelFlag: false,
    suspendFlag: false,
    allNormalFlag: false
  }

  const statuses = new Map(); // 会社毎のステータスを一時的に保存する変数

  // aneiがこの港のステータスを持っているか？
  if (aneiData.has(port)) {
    statuses.set(consts.ANEI, aneiData.get(port).code) // 一時変数に保尊
    data.status[consts.ANEI] = aneiData.get(port); // 送信用変数に運行ステータスを格納
  }
  // YKFがこの港のステータスを持っているか？
  if (ykfData.has(port)) {
    statuses.set(consts.YKF, ykfData.get(port).code) // 一時変数に保尊
    data.status[consts.YKF] = ykfData.get(port); // 送信用変数に運行ステータスを格納
  }
  // Dreamがこの港のステータスを持っているか？
  if (dreamData.has(port)) {
    statuses.set(consts.DREAM, dreamData.get(port).code) // 一時変数に保尊
    data.status[consts.DREAM] = dreamData.get(port); // 送信用変数に運行ステータスを格納
  } else if (port == consts.UEHARA) {
    // Dreamのみ上原と鳩間が同じ航路となっている対応
    statuses.set(consts.DREAM, dreamData.get(consts.UEHARA_HATOMA).code)
    data.status[consts.DREAM] = dreamData.get(consts.UEHARA_HATOMA);
  } else if (port == consts.HATOMA) {
    // Dreamのみ上原と鳩間が同じ航路となっている対応
    statuses.set(consts.DREAM, dreamData.get(consts.UEHARA_HATOMA).code)
    data.status[consts.DREAM] = dreamData.get(consts.UEHARA_HATOMA);
  }

  // console.log(statuses);

  // 欠航があるか？
  if ([...statuses.values()].filter((value) => value == consts.CANCEL).length > 0) {
    data.comment += '欠航';
    data.cancelFlag = true;
  }
  // 注意があるか？
  if ([...statuses.values()].filter((value) => value == consts.CATION).length > 0) {
    if (data.comment.length) data.comment += ',';
    data.comment += '注意';
    data.cationFlag = true;
  }
  // 運休があるか？
  if ([...statuses.values()].filter((value) => value == consts.SUSPEND).length > 0) {
    if (data.comment.length) data.comment += ',';
    data.comment += '運休';
    data.suspendFlag = true;
  }

  // コメントが空（欠航、注意、運休なし）＝ すべて運行していると判定
  if (data.comment.length == '') {
    data.comment = '全便運行';
    data.allNormalFlag = true;
  } else {
    // 何かしらコメントがあれば異常ステータスがある
    data.comment += 'あり';
  }

  sendData[port] = data;

}

/**
 * firebaseへ送信
 */
function sendFirebase() {
  // console.log('DB登録開始');
  // console.log(sendData)
  return firebase.database().ref(TABLE).update(sendData, function() {
    // console.log('DB登録完了');
  })
}

module.exports = run;