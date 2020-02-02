const puppeteer = require("puppeteer");
// Heroku環境かどうかの判断
const LAUNCH_OPTION = process.env.DYNO
  ? { args: ["--no-sandbox", "--disable-setuid-sandbox"] }
  : { headless: true };
const URL = "https://www.yaeyama.co.jp/operation.html";
const consts = require("../consts.js");
const config = require("../config/config");
const firebase = require("../lib/firebase_repository");

const COMPANY = consts.YKF;

module.exports = async () => {
  console.log("開始:" + COMPANY + " 時間+アナウンス");
  try {
    const browser = await puppeteer.launch(LAUNCH_OPTION);
    const page = await browser.newPage();
    page.setUserAgent(config.puppeteer.userAgent);
    await page.goto(URL, { waitUntil: "networkidle2" }); // ページへ移動＋表示されるまで待機

    // 更新日時
    const updateTime = await getUpdateTime(page);
    // アナウンス
    const announce = await getAnnounce(page);

    // 送信用の変数
    const data = {
      comment: announce,
      updateTime: updateTime
    };

    // 送信開始
    await firebase.update(consts.YKF, data);

    browser.close();
  } catch (error) {
    console.error(error.stack, "異常: YKF 時間+アナウンスでエラー");
    sendError(
      error.stack,
      "異常: YKF 時間+アナウンスのスクレイピングでエラー発生!"
    );
    browser.close();
  } finally {
    console.log("終了:" + COMPANY + " 時間+アナウンス");
  }
};

/**
 * 更新日時
 */
async function getUpdateTime(page) {
  const data = await getData(page, "#operationstatus > div > div.statusdate");
  console.log(data);
  return data;
}

/**
 * アナウンス
 */
async function getAnnounce(page) {
  const data = await getData(page, "#operationstatus > div > div.statusdate2");
  console.log(data);
  return data;
}

/**
 * pageからセレククターで指定された値を取得して返す
 */
async function getData(page, itemSelector) {
  return await page.$eval(itemSelector, item => {
    return item.textContent;
  });
}

// 送信開始
async function sendToFirebase(data) {
  console.log(data);
  await firebase.update(consts.YKF, data);
  // return await firebase(consts.YKF,data)
  //   .database()
  //   .ref(consts.YKF)
  //   .update(data, e => {
  //     if (e) {
  //       console.error("send error");
  //     } else {
  //       console.log("send complete!");
  //     }
  //   });
}
