// Anei 詳細
const puppeteer = require("puppeteer");
// Heroku環境かどうかの判断
const LAUNCH_OPTION = process.env.DYNO
  ? { args: ["--no-sandbox", "--disable-setuid-sandbox"] }
  : { headless: true };
const URL = "http://www.aneikankou.co.jp/timetables";
const consts = require("../consts.js");
const config = require("../config/config");
const firebase = require("../lib/firebase_repository");
const sendError = require("../slack");
const COMPANY = consts.ANEI;

module.exports = async () => {
  console.log(`開始: ${COMPANY} 詳細`);
  const browser = await puppeteer.launch(LAUNCH_OPTION);
  try {
    // todo: メイン処理

    browser.close();
  } catch (error) {
    console.error(error.stack, `${COMPANY}一覧でエラー`);
    sendError(error.stack, `${COMPANY}一覧のスクレイピングでエラー発生!`);
    browser.close();
  } finally {
    console.log(`終了: ${COMPANY} 詳細`);
  }
};
