const firebase = require("firebase");
const consts = require("../consts.js");
const sendError = require("../slack");

const TABLE = "top_company/";
const sendData = {};

/*
firebaseから一覧を読み込む
読み込み完了後、1社ずつステータスを判定して結果を変数に格納
（安永：通常運行、YKF：欠航あり）
変数をDBに登録
*/
async function createTopCompanyStatus(company) {
  console.log(`createTopCompanyStatus: ${company}`);
  const statuses = await readFirebase(company);
  console.log(statuses);
  await createStatus(statuses, company);
}

/**
 * DBから 会社名/list/ports を取得して status.code のみを取得
 */
async function readFirebase(company) {
  return firebase
    .database()
    .ref(`${company}`)
    .once("value")
    .then(function(snapshot) {
      const statuses = [];
      snapshot.forEach(function(element) {
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
  console.log(`createStatus: ${company} start`);
  const data = {
    nomal: statuses.filter(function(value) {
      return value == consts.NORMAL;
    }).length,
    cancel: statuses.filter(function(value) {
      return value == consts.CANCEL;
    }).length,
    cation: statuses.filter(function(value) {
      return value == consts.CATION;
    }).length,
    suspend: statuses.filter(function(value) {
      return value == consts.SUSPEND;
    }).length
  };
  sendData[company] = data;
  console.log(`createStatus: ${company} end`);
}

/**
 * firebaseへ送信
 */
async function sendFirebase() {
  console.log("DB登録開始");
  console.log(sendData);
  return firebase
    .database()
    .ref(TABLE)
    .update(sendData);
}

/**
 * 外部からの呼び出し用メソッド
 */
module.exports = async () => {
  console.log("開始 トップ 会社別");
  try {
    await createTopCompanyStatus(consts.ANEI);
    await createTopCompanyStatus(consts.YKF);
    await sendFirebase();
  } catch (error) {
    await sendError(error.stack);
  }

  console.log("完了 トップ 会社別");
};
