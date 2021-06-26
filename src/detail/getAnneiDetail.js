const puppeteer = require("puppeteer");
// Heroku環境かどうかの判断
const LAUNCH_OPTION = process.env.DYNO
  ? { args: ["--no-sandbox", "--disable-setuid-sandbox"] }
  : { headless: true };
const TARGET_URL = "https://aneikankou.co.jp/condition";
const config = require("../../config/config");

const getAnneiDetail = async () => {
  console.group("getAnneiDetail start");
  const browser = await puppeteer.launch(LAUNCH_OPTION);
  try {
    const page = await browser.newPage();

    await page.goto(TARGET_URL, { waitUntil: "networkidle2" }); // ページへ移動＋表示されるまで待機

    const value = await readTimetableData(page);
    console.dir(value);
  } catch (error) {
    // TODO
  } finally {
    browser.close();
    console.groupEnd();
  }
};
getAnneiDetail();
module.exports = getAnneiDetail;

/**
 * スクレイピング処理
 * @param page pupperteer.page
 * @returns 取得値
 */
const readTimetableData = async (page) => {
  // 送信用データ生成
  const data = {
    // 竹富
    taketomi: await getTaketomiStatus(page),
    // 黒島
    // kuroshima: await getKuroshimaStatus(page),
    // // // 小浜
    // kohama: await getKohamaStatus(page),
    // // // 上原
    // uehara: await getUeharaStatus(page),
    // // // 鳩間
    // hatoma: await getHatomaStatus(page),
    // // // 大原
    // oohara: await getOoharaStatus(page),
    // // // 波照間
    // hateruma: await getHaterumaStatus(page),
  };
  return data;
};

/**
 * 竹富航路
 */
async function getTaketomiStatus(page) {
  return await getStatusData(
    page,
    "#condition > div > div:nth-child(5) > div.condition_list > div:nth-child(1) > div:nth-child(1) > div:nth-child(3) > div:nth-child(1) > div"
  );
}

/**
 * 港単体のデータ取得
 */
async function getStatusData(page, itemSelector) {
  console.log("getStatusData");

  const parentNodes = await page.$$(itemSelector);
  if (parentNodes.length == 0) {
    console.log("status node is empty");
    return;
  }
  console.log(parentNodes.length);


  // divをループして値を取り出す
  for (const node of parentNodes) {
    // 左の時刻（例 08:00）
    const time = await node.$eval(
      "div.condition_item_port_detail_time",
      (nd) => nd.innerText
    );

    // 右のステータス記号文字（例 ○ △ ✗）
    const status = await node.$eval(
      "div.condition_item_port_detail_status",
      (nd) => nd.innerText
    );
  }

  // 左
  const time = await parentNodes[0].$eval(
    "div.condition_item_port_detail_time",
    (nd) => nd.innerText
  );
  console.log(time);

  console.log(status);
}
