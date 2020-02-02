const puppeteer = require("puppeteer");
// Heroku環境かどうかの判断
const LAUNCH_OPTION = process.env.DYNO
  ? { args: ["--no-sandbox", "--disable-setuid-sandbox"] }
  : { headless: true };
const URL = "https://www.yaeyama.co.jp/";
const consts = require("../consts.js");
const config = require("../config/config");
const firebase = require("firebase");

const COMPANY = consts.YKF;

module.exports = async () => {
  console.log(`開始: ${COMPANY} 一覧`);
  try {
    const browser = await puppeteer.launch(LAUNCH_OPTION);
    const page = await browser.newPage();
    page.setUserAgent(config.puppeteer.userAgent);
    await page.goto(URL, { waitUntil: "networkidle2" }); // ページへ移動＋表示されるまで待機

    const list = await getList(page);

    // 送信用の変数
    const data = {
  
    };

    // 送信開始
    await sendToFirebase(data);

    browser.close();
  } catch (error) {
    console.error(error.stack, `${COMPANY}一覧でエラー`);
    sendError(error.stack, `${COMPANY}一覧のスクレイピングでエラー発生!`);
    browser.close();
  } finally {
    console.log(`終了: ${COMPANY} 一覧`);
  }
};

/**
 * リスト取得
 */
async function getList(page) {
  const portData = await getDataList(
    page,
    "#operation_status > div:nth-child(2) > div > div > div > div"
  );
  console.log(portData);
}

async function getDataList(page, itemSelector) {
  return (datas = await page.evaluate(selector => {
    const list = Array.from(document.querySelectorAll(selector));
    return list.map(data => data.textContent.trim());
  }, itemSelector));
}

async function getDataClass(page, itemSelector) {
  const element = await page.$(itemSelector);
  const clazz = await (await element.getProperty("className")).jsonValue();
  // const span = elements.map(el => el.getE)
  return clazz;
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
  return await firebase
    .database()
    .ref(consts.YKF)
    .update(data, e => {
      if (e) {
        console.error("send error");
      } else {
        console.log("send complete!");
      }
    });
}

// 港名から港コードを返す
function getPortCode(portName) {
  const searchPorts = ['竹富','小浜','黒島','西表大原','西表上原','鳩間','小浜-竹富','']
  // 港id
  if (portName === "竹富") {
    return PORT.TAKETOMI;
  } else if (portName === "小浜") {
    return PORT.KOHAMA;
  } else if (portName === "小浜-竹富") {
    return PORT.KOHAMA_TAKETOMI;u
  } else if (portName === "黒島") {
    return PORT.KUROSHIMA;
  } else if (portName === "小浜-大原") {
    return PORT.KOHAMA_OOHARA;
  } else if (portName === "西表大原") {
    return PORT.OOHARA;
  } else if (portName === "西表上原") {
    return PORT.UEHARA;
  } else if (portName === "上原-鳩間") {
    return PORT.UEHARA_HATOMA;
  } else if (portName === "鳩間") {
    return PORT.HATOMA;
  }
}

// 記号から運行ステータスを判別
function getStatusCode(kigou) {
  const statu = {
    code: "",
    text: ""
  };
  if (kigou == "△") {
    statu.code = "cation";
    statu.text = "注意";
  } else if (kigou == "×") {
    statu.code = "cancel";
    statu.text = "欠航";
  } else if (kigou == "〇") {
    statu.code = "normal";
    statu.text = "通常運行";
  } else {
    statu.code = "cation";
    statu.text = "注意";
  }
  return statu;
}
