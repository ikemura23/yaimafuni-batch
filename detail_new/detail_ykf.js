// YKF 詳細
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
  console.log(`開始: ${COMPANY} 詳細`);
  try {
    const browser = await puppeteer.launch(LAUNCH_OPTION);
    const page = await browser.newPage();
    page.setUserAgent(config.puppeteer.userAgent);
    await page.goto(URL, { waitUntil: "networkidle2" }); // ページへ移動＋表示されるまで待機

    // スクレイピングした値、9件取得できるはず
    const data = await getDataList(page);

    // 送信開始
    await sendToFirebase(data);

    browser.close();
  } catch (error) {
    console.error(error.stack, `${COMPANY}一覧でエラー`);
    sendError(error.stack, `${COMPANY}一覧のスクレイピングでエラー発生!`);
    browser.close();
  } finally {
    console.log(`終了: ${COMPANY} 詳細`);
  }
};

/**
 * リスト取得
 */
async function getDataList(page) {
  // Selectorを作成、4〜12までが各港の時間別ステータスになる
  const selectors = [];
  for (let i = 4; i < 13; i++) {
    selectors.push(
      `#operationstatus > div > div:nth-child(${i}) > table > tbody > tr`
    );
  }

  // 港ごとに処理
  const dataList = {};
  for (const selector of selectors) {
    const data = await getRawData(page, selector);
    dataList[data.portCode] = data
  }
  return dataList;
}

/**
 * 港単体のデータ取得
 */
async function getRawData(page, itemSelector) {
  const trNodes = await page.$$(itemSelector);

  // 港名
  const portName = await trNodes[0].$eval("h3", nd => nd.innerText);
  // ヘッダー左
  const leftPortName = await trNodes[1].$eval(
    "td:nth-child(1)",
    nd => nd.innerText
  );
  // ヘッダー右
  const rightPortName = await trNodes[1].$eval(
    "td:nth-child(2)",
    nd => nd.innerText
  );
  
  // 時刻ごとのステータス
  // trタグの0〜1行目は港名なので除外する
  const timeTable = trNodes.filter((_, i) => i > 1);
  const rows = [];
  // 時刻ステータスのループ
  for (const time of timeTable) {
    const trLeft = await time.$eval("td:nth-child(1)", nd => nd.innerText);
    const trLright = await time.$eval("td:nth-child(2)", nd => nd.innerText);

    const row = {
      portCode: getPortCode(portName),
      left: trLeft,
      right: trLright
    };
    rows.push(row);
  }
  // 返却データ作成
  const data = {
    portCode: getPortCode(portName),
    header: {
      left: leftPortName,
      right: rightPortName
    },
    row: rows
  };
  // console.log(data);
  return data;
}

/**
 * DBへ登録
 */
async function sendToFirebase(data) {
  const tableName = `${COMPANY}_timeTable/`;
  console.log('送信開始' + tableName)
  return await firebase.update(tableName, data);
};

// 港名から港コードを返す
function getPortCode(portName) {
  // 港id
  if (portName === "竹富航路") {
    return consts.TAKETOMI;
  } else if (portName === "小浜航路") {
    return consts.KOHAMA;
  } else if (portName === "小浜-竹富航路") {
    return consts.KOHAMA_TAKETOMI;
  } else if (portName === "黒島航路") {
    return consts.KUROSHIMA;
  } else if (portName === "小浜-大原航路") {
    return consts.KOHAMA_OOHARA;
  } else if (portName === "西表大原航路") {
    return consts.OOHARA;
  } else if (portName === "西表上原航路") {
    return consts.UEHARA;
  } else if (portName === "上原-鳩間航路") {
    return consts.UEHARA_HATOMA;
  } else if (portName === "鳩間航路") {
    return consts.HATOMA;
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
