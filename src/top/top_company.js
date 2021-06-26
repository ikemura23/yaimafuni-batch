// 会社別の運行ステータスの値をまとめて、firebaseに送信している

const consts = require("../../consts.js");
const sendError = require("../../slack");
const firebase = require("../../lib/firebase_repository");

const TABLE = "top_company/";
const sendData = {};

/*
firebaseから一覧を読み込む
読み込み完了後、1社ずつステータスを判定して結果を変数に格納
（安永：通常運行、YKF：欠航あり）
変数をDBに登録
*/
async function createTopCompanyStatus(company) {
  // まずfirebaseから一覧データを取得
  const readData = await readFirebase(company);
  // status codeだけを取得
  const statuses = convertPostStatusList(readData);
  // 判定開始
  await createStatus(statuses, company);
}

/**
 * DBから 会社名/list/ports を取得して status.code のみを取得
 */
async function readFirebase(company) {
  // 一度、一覧ステータス値を全部取得
  return await firebase.read(company);
}

/**
 * status.code のみを取得して配列にして返す
 */
function convertPostStatusList(portData) {
  // ループでstatus codeだけを取得して statuses に格納
  const statuses = [];
  for (const key in portData) {
    if (portData.hasOwnProperty(key)) {
      const data = portData[key];
      if (data.portCode != undefined) {
        // このifでcommentとupdateTimeを外している
        statuses.push(data.status.code); // status codeを配列に保存
      }
    }
  }
  return statuses;
}

/**
 * 配列の運行結果をみて運行コメントを作成する
 * @param {aneiの運行結果配列} statuses
 */
function createStatus(statuses, company) {
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
}

/**
 * firebaseへ送信
 */
async function sendFirebase() {
  // console.log("DB登録開始");
  // console.log(sendData);
  return await firebase.update(TABLE, sendData);
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
