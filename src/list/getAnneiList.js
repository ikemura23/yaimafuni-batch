const puppeteer = require("puppeteer");
// Heroku環境かどうかの判断
const LAUNCH_OPTION = process.env.DYNO
  ? { args: ["--no-sandbox", "--disable-setuid-sandbox"] }
  : { headless: true };
const TARGET_URL = "https://aneikankou.co.jp/condition";
const config = require("../config/config");
const consts = require("../consts.js");

const getAnneiList = async () => {
  console.group("getAnneiList start");
  const browser = await puppeteer.launch(LAUNCH_OPTION);
  try {
    const page = await browser.newPage();
    // page.setUserAgent(config.puppeteer.userAgent);
    await page.goto(TARGET_URL, { waitUntil: "networkidle2" }); // ページへ移動＋表示されるまで待機

    // 波照間
    const haterumaStatus = {
      portName: "波照間島航路",
      portCode: "hateruma",
      status: ({ code, text } = await readStatusData(
        page,
        "#condition > div > div:nth-child(3) > div > div:nth-child(1) > a"
      )),
      comment: await readCommentData(
        page,
        "#condition > div > div:nth-child(5) > div.condition_list > div:nth-child(1) > div:nth-child(1) > div.conditon_item_caption"
      ),
    };

    // 上原
    const ueharaStatus = {
      portName: "上原航路",
      portCode: "uehara",
      status: ({ code, text } = await readStatusData(
        page,
        "#condition > div > div:nth-child(3) > div > div:nth-child(2) > a"
      )),
      comment: await readCommentData(
        page,
        "#condition > div > div:nth-child(5) > div.condition_list > div:nth-child(2) > div:nth-child(1) > div.conditon_item_caption"
      ),
    };

    // 鳩間
    const hatomaStatus = {
      portName: "鳩間航路",
      portCode: "hatoma",
      status: ({ code, text } = await readStatusData(
        page,
        "#condition > div > div:nth-child(3) > div > div:nth-child(3) > a"
      )),
      comment: await readCommentData(
        page,
        "#condition > div > div:nth-child(5) > div.condition_list > div:nth-child(3) > div:nth-child(1) > div.conditon_item_caption"
      ),
    };

    // 大原
    const ooharaStatus = {
      portName: "大原航路",
      portCode: "oohara",
      status: ({ code, text } = await readStatusData(
        page,
        "#condition > div > div:nth-child(3) > div > div:nth-child(4) > a"
      )),
      comment: await readCommentData(
        page,
        "#condition > div > div:nth-child(5) > div.condition_list > div:nth-child(2) > div:nth-child(2) > div.conditon_item_caption"
      ),
    };

    // 竹富
    const taketomiStatus = {
      portName: "竹富航路",
      portCode: "taketomi",
      status: ({ code, text } = await readStatusData(
        page,
        "#condition > div > div:nth-child(3) > div > div:nth-child(5) > a"
      )),
      comment: await readCommentData(
        page,
        "#condition > div > div:nth-child(5) > div.condition_list > div:nth-child(3) > div:nth-child(1) > div.conditon_item_caption"
      ),
    };

    // 小浜
    const kohamaStatus = {
      portName: "小浜航路",
      portCode: "kohama",
      status: ({ code, text } = await readStatusData(
        page,
        "#condition > div > div:nth-child(3) > div > div:nth-child(6) > a"
      )),
      comment: await readCommentData(
        page,
        "#condition > div > div:nth-child(5) > div.condition_list > div:nth-child(3) > div:nth-child(2) > div.conditon_item_caption"
      ),
    };

    // 黒島
    const kuroshimaStatus = {
      portName: "黒島航路",
      portCode: "kuroshima",
      status: ({ code, text } = await readStatusData(
        page,
        "#condition > div > div:nth-child(3) > div > div:nth-child(7) > a"
      )),
      comment: await readCommentData(
        page,
        "#condition > div > div:nth-child(5) > div.condition_list > div:nth-child(4) > div > div.conditon_item_caption"
      ),
    };

    const value = {
      hateruma: haterumaStatus,
      uehara: ueharaStatus,
      hatoma: hatomaStatus,
      oohara: ooharaStatus,
      taketomi: taketomiStatus,
      kohama: kohamaStatus,
      kuroshima: kuroshimaStatus,
    };

    // console.dir(value);
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
 * タグのcssクラス名からステータスコードを取得
 * @param {港単体タグ} arreaTag
 */
async function getStatusCode(className) {
  if (className == "operation_partial") {
    return { code: consts.CATION, text: "一部運休" };
  } else if (className == "operation_times") {
    return { code: consts.CANCEL, text: "全便欠航" };
  } else if (className == "operation_normal") {
    return { code: consts.NORMAL, text: "通常運航" };
  } else {
    return { code: consts.CATION, text: "一部運休" };
  }
}

// const statusMaster = [
//   { className: "operation_normall", code: consts.NORMAL },
//   { className: "operation_triangle", code: consts.CATION },
//   { className: "operation_times", code: consts.CANCEL },
// ];

// const statusFinder = async (className) => {
//   const status = statusMaster.find((s) => className == s.className)
//   console.log(`status: ${status}`);
//   if (status) {
//       return consts.CATION
//   }
//   return status.code;
// };

const readStatusData = async (page, statusSelector) => {
  const raw = await page.$eval(statusSelector, (item) => {
    return { className: item.className, text: item.textContent };
  });
  return await getStatusCode(raw.className);
};

const readCommentData = async (page, commentSelector) => {
  return await page.$eval(commentSelector, (item) => {
    return item.textContent.trim();
  });
};

/**
 * 運行ステータスは、XX航路のクラス名で判定する
 * https://aneikankou.co.jp/condition
 *
 * operation_normal = 通常運行
 * operation_triangle = 通常運行
 * operation_times = 全便欠航？（未確認）
 *
 */
