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
    const haterumaStatus = {
      portName: "波照間島航路",
      portCode: "hateruma",
      status: await page.$eval(
        "#condition > div > div:nth-child(3) > div > div:nth-child(1) > a",
        (item) => {
          return { className: item.className, text: item.textContent };
        }
      ),
      comment: await page.$eval(
        "#condition > div > div:nth-child(5) > div.condition_list > div:nth-child(1) > div:nth-child(1) > div.conditon_item_caption",
        (item) => {
          return item.textContent.trim();
        }
      ),
    };
    console.dir(haterumaStatus);

    // 上原
    const ueharaStatus = {
      portName: "上原航路",
      portCode: "uehara",
      status: await page.$eval(
        "#condition > div > div:nth-child(3) > div > div:nth-child(2) > a",
        (item) => {
          return { className: item.className, text: item.textContent };
        }
      ),
      comment: await page.$eval(
        "#condition > div > div:nth-child(5) > div.condition_list > div:nth-child(2) > div:nth-child(1) > div.conditon_item_caption",
        (item) => {
          return item.textContent.trim();
        }
      ),
    };
    console.dir(ueharaStatus);
    // 鳩間
    const hatomaStatus = {
      portName: "鳩間航路",
      portCode: "hatoma",
      status: await page.$eval(
        "#condition > div > div:nth-child(3) > div > div:nth-child(3) > a",
        (item) => {
          return { className: item.className, text: item.textContent };
        }
      ),
      comment: await page.$eval(
        "#condition > div > div:nth-child(5) > div.condition_list > div:nth-child(3) > div:nth-child(1) > div.conditon_item_caption",
        (item) => {
          return item.textContent.trim();
        }
      ),
    };
    console.dir(hatomaStatus);
    // 大原
    const ooharaStatus = {
      portName: "大原航路",
      portCode: "oohara",
      status: await page.$eval(
        "#condition > div > div:nth-child(3) > div > div:nth-child(4) > a",
        (item) => {
          return { className: item.className, text: item.textContent };
        }
      ),
      comment: await page.$eval(
        "#condition > div > div:nth-child(5) > div.condition_list > div:nth-child(2) > div:nth-child(2) > div.conditon_item_caption",
        (item) => {
          return item.textContent.trim();
        }
      ),
    };
    console.dir(ooharaStatus);

    // 竹富
    const taketomiStatus = {
      portName: "竹富航路",
      portCode: "taketomi",
      status: await page.$eval(
        "#condition > div > div:nth-child(3) > div > div:nth-child(5) > a",
        (item) => {
          return { className: item.className, text: item.textContent };
        }
      ),
      comment: await page.$eval(
        "#condition > div > div:nth-child(5) > div.condition_list > div:nth-child(3) > div:nth-child(1) > div.conditon_item_caption",
        (item) => {
          return item.textContent.trim();
        }
      ),
    };
    console.dir(taketomiStatus);

    // 小浜
    const kohamaStatus = {
      portName: "小浜航路",
      portCode: "kohama",
      status: await page.$eval(
        "#condition > div > div:nth-child(3) > div > div:nth-child(6) > a",
        (item) => {
          return { className: item.className, text: item.textContent };
        }
      ),
      comment: await page.$eval(
        "#condition > div > div:nth-child(5) > div.condition_list > div:nth-child(3) > div:nth-child(2) > div.conditon_item_caption",
        (item) => {
          return item.textContent.trim();
        }
      ),
    };
    console.dir(kohamaStatus);

    // 黒島
    const kuroshimaStatus = {
      portName: "黒島航路",
      portCode: "kuroshima",
      status: await page.$eval(
        "#condition > div > div:nth-child(3) > div > div:nth-child(7) > a",
        (item) => {
          return { className: item.className, text: item.textContent };
        }
      ),
      comment: await page.$eval(
        "#condition > div > div:nth-child(5) > div.condition_list > div:nth-child(4) > div > div.conditon_item_caption",
        (item) => {
          return item.textContent.trim();
        }
      ),
    };
    console.dir(kuroshimaStatus);

    const value = {
      hateruma: haterumaStatus,
      uehara: ueharaStatus,
      hatoma: hatomaStatus,
      oohara: ooharaStatus,
      taketomi: taketomiStatus,
      kohama: kohamaStatus,
      kuroshima: kuroshimaStatus,
    };

    console.log("取得値");
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
