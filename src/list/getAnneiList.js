const puppeteer = require("puppeteer");
// Heroku環境かどうかの判断
const LAUNCH_OPTION = process.env.DYNO
  ? { args: ["--no-sandbox", "--disable-setuid-sandbox"] }
  : { headless: true };
const TARGET_URL = "https://aneikankou.co.jp/condition";
const config = require("../../config/config");

const getAnneiList = async () => {
  console.log("getAnneiList start");
  const browser = await puppeteer.launch(LAUNCH_OPTION);
  try {
    const page = await browser.newPage();
    page.setUserAgent(config.puppeteer.userAgent);
    await page.goto(TARGET_URL, { waitUntil: "networkidle2" }); // ページへ移動＋表示されるまで待機
    
    // 更新時刻の取得
    const updateTime = await page.$eval(
      "div.condition_subtitle > div",
      (item) => {
        return item.textContent.trim();
      }
    );

    console.log(`更新時刻: ${updateTime}`);
    return updateTime;
  } catch (error) {
      // TODO
  } finally {
    browser.close();
    console.log("getAnneiList end");
  }
};

module.exports = getAnneiList;
