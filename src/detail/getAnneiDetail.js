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

    // 波照間
    // 上原
    // 鳩間
    // 大原
    // 竹富
    // 小浜
    // 黒島
    const value = {};
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
