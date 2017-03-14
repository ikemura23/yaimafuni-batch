const firebase = require("firebase");
const consts = require('./consts.js');

const TABLE_NAME = 'top_company/anei';
/*
firebaseから一覧を読み込む
読み込み完了後、1社ずつステータスを判定して結果を変数に格納
（安永：通常運行、YKF：欠航あり、ドリーム：未定あり）
変数をDBに登録
*/

/**
 * DBからanei_statusを取得してstatus.codeのみを取得
 */
function readFirebase() {
  return firebase.database().ref('/anei_status/').once('value')
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
function createAneiTopStatus(statuses) {
  // console.log(statuses);
  let comment = '';
  if (statuses.indexOf(consts.CANCEL) > 0) {
    //欠航あり
    comment += '欠航あり';
  }
  if (statuses.indexOf(consts.CATION) > 0) {
    if (comment.length) comment += ' ';
    //注意あり
    comment += '注意あり';
  }

  if (comment.length == '') {
    // 欠航も注意も未定もなし＝すべて運行
    comment = '全便運行';
  }
  const sendData = {
      comment: comment
    }
    // console.log(comment);
    // return Promise.resolve(sendData);
  return sendData;
}

/**
 * firebaseへ送信
 * @param {送信する値} sendData 
 */
function sendFirebase(sendData) {
  // console.log('DB登録開始');
  return firebase.database().ref(TABLE_NAME).update(sendData, function() {
    // console.log('DB登録完了');
    // firebase.database().goOffline(); //プロセスが終わらない対策
  })
}

/**
 * 外部からの呼び出し用メソッド
 */
function run() {
  return Promise.resolve()
    .then(() => console.log('開始 トップ 会社別'))
    .then(() => readFirebase())
    .then(data => createAneiTopStatus(data))
    .then(sendData => sendFirebase(sendData))
    .then(() => console.log('完了 トップ 会社別'))
    .catch(function(e) {
      console.log(e);
    })
}
// run()
module.exports = run;