const puppeteer = require("puppeteer");
// Heroku環境かどうかの判断
const LAUNCH_OPTION = process.env.DYNO
  ? { args: ["--no-sandbox", "--disable-setuid-sandbox"] }
  : { headless: true };
const URL = "http://www.aneikankou.co.jp";
const consts = require("../consts.js");
const config = require("../config/config");
const firebase = require("firebase");

module.exports = async () => {
  console.log("開始:" + consts.ANEI + " 一覧");
  const browser = await puppeteer.launch(LAUNCH_OPTION);
  try {
    const page = await browser.newPage();
    page.setUserAgent(config.puppeteer.userAgent);
    await page.goto(URL, { waitUntil: "networkidle2" }); // ページへ移動＋表示されるまで待機
    // await page.screenshot({ path: "graph.png" });

    // 全体アナウンス＋更新日時を取得
    const annaunce = await getAnnaunce(page);
    // console.log(annaunce);

    // 港名を取得
    const portNames = await getData(
      page,
      "#situation > div > ul.route > li.chips-btn > a > div.area > span.name"
    );
    // console.log(portNames);

    // 各港の運行ステータスを取得
    const statusTexts = await getData(
      page,
      "#situation > div > ul.route > li.chips-btn > a > div.area > span:nth-child(2)"
    );
    // console.log(statusTexts);
    const statusClasses = await getClass(
      page,
      "#situation > div > ul.route > li.chips-btn > a > div.area > span:nth-child(2)"
    );
    // console.log(statusClasses);

    // 各港のコメントを取得
    const chipsComments = await getData(
      page,
      "#situation > div > ul.route > li.chips-btn > div.route-chips > div > p"
    );
    // console.log(chipsComments);

    // 送信用の変数
    const sendData = {
      comment: annaunce.comment,
      updateTime: annaunce.updateTime
    };

    // 送信用データを作成する
    portNames.forEach((_, i) => {
      const portName = portNames[i];
      const portCode = getPortCode(portName);
      const statusText = statusTexts[i];
      const statusCode = getStatusCode(statusClasses[i]);
      const comment = chipsComments[i];

      const data = {
        portCode: portCode,
        portName: portName,
        status: {
          code: statusCode,
          text: statusText
        },
        comment: comentFilter(comment) // 特定のコメントは表示させないようにする、ただの通常運行とか
      };
      sendData[portCode] = data;
    });

    // DB登録
    await firebase
      .database()
      .ref(consts.ANEI)
      .update(sendData, e => {
        if (e) {
          console.error("update error");
        } else {
          console.log("update complete!");
        }
      });
    // console.log(sendData);

  } catch (error) {
    console.error(error.stack, "安栄一覧でエラー");
    sendError(error.stack, "安栄一覧のスクレイピングでエラー発生!");
  } finally {
    browser.close();
    console.log("終了:" + consts.ANEI + " 一覧");
  }
};

async function getAnnaunce(page) {
  return await page.evaluate(() => {
    // 本日のアナウンス
    const comment = document.querySelector("div.content_wrap > p.all-note");
    // 本日アナウンスの更新日時
    const updateTime = document.querySelector("div.service > h3 > span");
    return {
      comment: comment.textContent.trim(),
      updateTime: updateTime.textContent.trim()
    };
  });
}

async function getData(page, itemSelector) {
  return (datas = await page.evaluate(selector => {
    const list = Array.from(document.querySelectorAll(selector));
    return list.map(data => data.textContent.trim());
  }, itemSelector));
}

async function getData2(page, itemSelector) {
  const element = await page.$(itemSelector);
  const clazz = await (await element.getProperty("className")).jsonValue();
  // const span = elements.map(el => el.getE)
  return clazz;
}

async function getClass(page, itemSelector) {
  const elements = await page.$$(itemSelector);
  // https://t-kojima.github.io/2018/07/18/0028-async-await-in-loop/
  return Promise.all(
    elements.map(async element => {
      return await (await element.getProperty("className")).jsonValue(); //  flag triangle
    })
  );
}

// 港名から港コードを返す
function getPortCode(portName) {
  // 港id
  if (portName.toString().includes("竹富")) {
    return consts.TAKETOMI;
  } else if (portName.toString().includes("小浜")) {
    return consts.KOHAMA;
  } else if (portName.toString().includes("黒島")) {
    return consts.KUROSHIMA;
  } else if (portName.toString().includes("大原")) {
    return consts.OOHARA;
  } else if (portName.toString().includes("上原")) {
    return consts.UEHARA;
  } else if (portName.toString().includes("鳩間")) {
    return consts.HATOMA;
  } else if (portName.toString().includes("波照間")) {
    return consts.HATERUMA;
  }
}

/**
 * タグのcssクラス名からステータスコードを取得
 * @param {港単体タグ} arreaTag
 */
function getStatusCode(className) {
  if (className == "flag triangle") {
    return consts.CATION;
  } else if (className == "flag out") {
    return consts.CANCEL;
  } else if (className == "flag circle") {
    return consts.NORMAL;
  } else {
    return consts.CATION;
  }
}

/**
 * 重要そうなコメントだけ表示するため精査する
 * @param string comment
 */
function comentFilter(comment) {
  switch (comment) {
    case "全便平常運航":
      return "";
    case "通常運航。":
      return "";
    case "竹富航路、通常運航です。":
      return "";
    case "竹富航路、通常運航です":
      return "";
    case "竹富島航路、通常運航。":
      return "";
    case "小浜航路、通常運航です。":
      return "";
    case "小浜航路、通常運航です":
      return "";
    case "小浜島航路、通常運航。":
      return "";
    case "黒島航路、通常運航です。":
      return "";
    case "黒島航路、通常運航です":
      return "";
    case "黒島航路、通常運航。":
      return "";
    case "西表島上原航路、通常運航です。":
      return "";
    case "西表島上原航路、通常運航です":
      return "";
    case "西表島上原航路、通常運航。":
      return "";
    case "西表島上原航路、欠航。":
      return "";
    case "鳩間航路、通常運航です。":
      return "";
    case "鳩間航路、通常運航です":
      return "";
    case "鳩間航路、通常運航。":
      return "";
    case "鳩間島航路、通常運航。":
      return "";
    case "鳩間航路、欠航。":
      return "";
    case "鳩間島航路、欠航。":
      return "";
    case "西表島大原航路、通常運航です。":
      return "";
    case "西表島大原航路、通常運航です":
      return "";
    case "西表島大原航路、通常運航。":
      return "";
    case "波照間島航路、通常運航。":
      return "";
    case "波照間島航路、通常運航":
      return "";
    case "波照間島航路、運航。":
      return "";
    case "波照間島航路、運航":
      return "";
    case "波照間島航路、欠航。":
      return "";

    default:
      return comment;
  }
}
