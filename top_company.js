const firebase = require("firebase");
const consts = require('./consts.js');

const TABLE = 'top_company/';
const sendData = {};
/*
firebaseから一覧を読み込む
読み込み完了後、1社ずつステータスを判定して結果を変数に格納
（安永：通常運行、YKF：欠航あり、ドリーム：未定あり）
変数をDBに登録
*/

function createTopCompanyStatus(company) {
  return readFirebase(getReadTableName(company))
    .then((statuses) => createStatus(statuses, company));
}

function getReadTableName(company) {
  switch (company) {
    case consts.ANEI:
      return 'anei_status';
    case consts.YKF:
      return 'ykf_status';
    case consts.DREAM:
      return 'dream_status';
  }
}

/**
 * DBからanei_statusを取得してstatus.codeのみを取得
 */
function readFirebase(tableName) {
  return firebase.database().ref(tableName).once('value')
    .then(function(snapshot) {
      const statuses = [];
      snapshot.forEach(function(element) {
        const portData = element.val();
        if (portData.code == undefined) return false; //全体コメントはスキップ
        statuses.push(portData.status.code); // 一旦配列に結果を保存
      });
      return Promise.resolve(statuses);
    });
}

/**
 * 配列の運行結果をみて運行コメントを作成する
 * @param {aneiの運行結果配列} statuses 
 */
function createStatus(statuses, company) {
  // console.log(statuses);

  const data = {
    comment: '',
    cationFlag: false,
    cancelFlag: false,
    suspendFlag: false,
    allNormalFlag: false
  }
  if (statuses.filter((value) => value == consts.CANCEL)) {
    data.comment += '欠航';
    data.cancelFlag = true;
  }
  if (statuses.indexOf(consts.CATION) > 0) {
    if (data.comment.length) data.comment += ',';
    data.comment += '注意';
    data.cationFlag = true;
  }
  if (statuses.indexOf(consts.SUSPEND) > 0) {
    if (data.comment.length) data.comment += ',';
    data.comment += '運休';
    data.suspendFlag = true;
  }

  if (data.comment.length == '') {
    // 欠航も注意も未定もなし＝すべて運行
    data.comment = '全便運行';
    data.allNormalFlag = true;
  } else {
    data.comment += 'あり';
  }

  sendData[company] = data;

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

/**
 * 外部からの呼び出し用メソッド
 */
function run() {
  return Promise.resolve()
    .then(() => console.log('開始 トップ 会社別'))
    .then(() => createTopCompanyStatus(consts.ANEI))
    .then(() => createTopCompanyStatus(consts.YKF))
    .then(() => createTopCompanyStatus(consts.DREAM))
    .then(() => sendFirebase())
    .then(() => console.log('完了 トップ 会社別'))
    .catch(function(e) {
      console.log(e);
    })
}
module.exports = run;