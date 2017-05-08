const firebase = require("firebase");
const consts = require('./consts.js');
const sendError = require('./slack');

const TABLE = 'top_company/';
const sendData = {};
/*
firebaseから一覧を読み込む
読み込み完了後、1社ずつステータスを判定して結果を変数に格納
（安永：通常運行、YKF：欠航あり、ドリーム：未定あり）
変数をDBに登録
*/

function createTopCompanyStatus(company) {
  return readFirebase(company)
    .then((statuses) => createStatus(statuses, company));
}

/**
 * DBから 会社名/list/ports を取得して status.code のみを取得
 */
function readFirebase(company) {
  return firebase.database()
    .ref(`${company}/list/ports`)
    .once('value')
    .then(function (snapshot) {
      const statuses = [];
      snapshot.forEach(function (element) {
        const portData = element.val();
        if (portData.portCode == undefined) return false; //全体コメントはスキップ
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

  // 欠航 があるか？
  if (statuses.indexOf(consts.CANCEL) > 0) {
    data.comment += '欠航';
    data.cancelFlag = true;
  }

  // 注意 があるか？
  if (statuses.indexOf(consts.CATION) > 0) {
    if (data.comment.length) data.comment += ',';
    data.comment += '注意';
    data.cationFlag = true;
  }

  // 運休 があるか？
  if (statuses.indexOf(consts.SUSPEND) > 0) {
    if (data.comment.length) data.comment += ',';
    data.comment += '運休';
    data.suspendFlag = true;
  }

  // すべて運行か？
  if (data.comment.length == '') {
    // 欠航も注意も未定もなし＝すべて運行
    data.comment = '通常運行';
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
  return firebase.database().ref(TABLE).update(sendData)
}

/**
 * 外部からの呼び出し用メソッド
 */
module.exports = () => {
  return Promise.resolve()
    .then(() => console.log('開始 トップ 会社別'))
    .then(() => createTopCompanyStatus(consts.ANEI))
    .then(() => createTopCompanyStatus(consts.YKF))
    .then(() => createTopCompanyStatus(consts.DREAM))
    .then(() => sendFirebase())
    .catch((error) => sendError(error.stack))
    .then(() => console.log('完了 トップ 会社別'))
}