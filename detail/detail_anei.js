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
    const page = await browser.newPage();
    // page.setUserAgent(config.puppeteer.userAgent);
    await page.goto(URL, { waitUntil: "networkidle2" }); // ページへ移動＋表示されるまで待機
    const data = await makeData(page);
    // await sendToFirebase(data);

    browser.close();
  } catch (error) {
    console.error(error.stack, `${COMPANY}一覧でエラー`);
    // sendError(error.stack, `${COMPANY}一覧のスクレイピングでエラー発生!`);
    browser.close();
  } finally {
    console.log(`終了: ${COMPANY} 詳細`);
  }
};

async function makeData(page) {
  // 送信用データ生成
  const data = {
    // 竹富
    taketomi: await getTaketomiStatus(page),
    // // 黒島
    // kuroshima: await getKuroshimaStatus(page),
    // // 小浜
    // kohama: await getKohamaStatus(page),
    // // 上原
    // uehara: await getUeharaStatus(page),
    // // 鳩間
    // hatoma: await getHatomaStatus(page),
    // // 大原
    // oohara: await getOoharaStatus(page),
    // // 波照間
    // oohara: await getHaterumaStatus(page),
  };
  return data;
}

/**
 * 竹富航路
 */
async function getTaketomiStatus(page) {
  return await getStatusData(
    page,
    "#route-list > div:nth-child(1) > table > tbody > tr:nth-child(1)"
  );
}

/**
 * 黒島航路
 */
async function getKuroshimaStatus(page) {
  return await getStatusData(
    page,
    "#route-list > div:nth-child(2) > table:nth-child(2) > tbody > tr"
  );
}

/**
 * 小浜航路
 */
async function getKohamaStatus(page) {
  return await getStatusData(
    page,
    "#route-list > div:nth-child(2) > table:nth-child(4) > tbody > tr"
  );
}

/**
 * 西表上原航路
 */
async function getUeharaStatus(page) {
  return await getStatusData(
    page,
    "#route-list > div:nth-child(4) > table:nth-child(2) > tbody > tr"
  );
}

/**
 * 鳩間航路
 */
async function getHatomaStatus(page) {
  return await getStatusData(
    page,
    "#route-list > div:nth-child(4) > table:nth-child(4) > tbody > tr"
  );
}

/**
 * 西表大原航路
 */
async function getOoharaStatus(page) {
  return await getStatusData(
    page,
    "#route-list > div:nth-child(4) > table:nth-child(2) > tbody > tr"
  );
}

/**
 * 波照間 航路
 */
async function getHaterumaStatus(page) {
  return await getStatusData(
    page,
    "#route-list > div:nth-child(4) > table:nth-child(4) > tbody > tr"
  );
}

/**
 * 港単体のデータ取得
 */
async function getStatusData(page, itemSelector) {
  const trNodes = await page.$$(itemSelector);
  console.log(trNodes);
  if (trNodes.length == 0) {
      console.log("node is empty")
      return
  }
  // ヘッダー左
  const leftPortName = await trNodes[0].$eval(
    "th:nth-child(1)",
    (nd) => nd.innerText
  );
  // ヘッダー右
  const rightPortName = await trNodes[0].$eval(
    "th:nth-child(2)",
    (nd) => nd.innerText
  );
  console.log(leftPortName);
  console.log(rightPortName);
}

/**
 * DBへ登録
 */
async function sendToFirebase(data) {
  const tableName = `${COMPANY}_timeTable/`;
  console.log("送信開始" + tableName);
  return await firebase.update(tableName, data);
}
