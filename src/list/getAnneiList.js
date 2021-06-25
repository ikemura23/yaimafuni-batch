const puppeteer = require("puppeteer");
// Heroku環境かどうかの判断
const LAUNCH_OPTION = process.env.DYNO
  ? { args: ["--no-sandbox", "--disable-setuid-sandbox"] }
  : { headless: true };
const TARGET_URL = "https://aneikankou.co.jp/condition";
const config = require("../../config/config");

const getAnneiList = async () => {
  console.group("getAnneiList");
  const browser = await puppeteer.launch(LAUNCH_OPTION);
  try {
    const page = await browser.newPage();
    // page.setUserAgent(config.puppeteer.userAgent);
    await page.goto(TARGET_URL, { waitUntil: "networkidle2" }); // ページへ移動＋表示されるまで待機

    // 波照間
    const haterumaStatus = await page.$eval(
      "#condition > div > div:nth-child(3) > div > div:nth-child(1) > a",
      (item) => {
        return { className: item.className, text: item.textContent };
      }
    );

    // 上原
    const ueharaStatus = await page.$eval(
      "#condition > div > div:nth-child(3) > div > div:nth-child(2) > a",
      (item) => {
        return { className: item.className, text: item.textContent };
      }
    );

    // 鳩間
    const hatomaStatus = await page.$eval(
      "#condition > div > div:nth-child(3) > div > div:nth-child(3) > a",
      (item) => {
        return { className: item.className, text: item.textContent };
      }
    );

    // 大原
    const ooharaStatus = await page.$eval(
      "#condition > div > div:nth-child(3) > div > div:nth-child(4) > a",
      (item) => {
        return { className: item.className, text: item.textContent };
      }
    );

    // 竹富
    const taketomiStatus = await page.$eval(
      "#condition > div > div:nth-child(3) > div > div:nth-child(5) > a",
      (item) => {
        return { className: item.className, text: item.textContent };
      }
    );

    // 小浜
    const kohamaStatus = await page.$eval(
      "#condition > div > div:nth-child(3) > div > div:nth-child(6) > a",
      (item) => {
        return { className: item.className, text: item.textContent };
      }
    );

    // 小浜
    const kuroshimaStatus = await page.$eval(
      "#condition > div > div:nth-child(3) > div > div:nth-child(7) > a",
      (item) => {
        return { className: item.className, text: item.textContent };
      }
    );

    const value = {
      hateruma: haterumaStatus,
      uehara: ueharaStatus,
      hatoma: hatomaStatus,
      oohara: ooharaStatus,
      taketomi: taketomiStatus,
      kohama: kohamaStatus,
      kuroshima: kuroshimaStatus,
    };

    console.dir(value);
    return value;
  } catch (error) {
    // TODO
  } finally {
    browser.close();
    console.groupEnd();
  }
};

module.exports = getAnneiList;

/**
 * 運行ステータスは、XX航路のクラス名で判定する
 * https://aneikankou.co.jp/condition
 *
 * operation_normal = 通常運行
 * operation_triangle = 通常運行
 * operation_times = 全便欠航？（未確認）
 *
 */
