const firebase = require("firebase");
const consts = require('./consts.js');

/*
firebaseから一覧を読み込む
読み込み完了後、1社ずつステータスを判定して結果を変数に格納
（安永：通常運行、YKF：欠航あり、ドリーム：未定あり）
変数をDBに登録
*/

firebase.database()
  .ref('/anei_status/')
  .once('value')
  .then(function(snapshot) {
    const statuses = [];
    snapshot.forEach(function(element) {
      const portData = element.val();
      if (portData.code == undefined) return false; //全体コメントはスキップ
      statuses.push(portData.status.code); // 一旦配列に結果を保存
    });

    console.log(statuses);
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
    console.log(comment);
    firebase.database().goOffline()
  });