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

    const data = await getData(page);
    // console.log(info);

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

async function getData(page) {
  // 更新日時
  // const updateTime = await getUpdateTime(page);
  // console.log(updateTime);

  // アナウンス ※ここは表示されない日があるので要注意
  // const announce = await getAnnounce(page);
  // console.log(announce);

  // 竹富
  const taketomi = await getTaketomiStatus(page);
  // console.log(taketomi);

  // 小浜
  const kohama = await getKohamaStatus(page);
  // console.log(kohama);

  // 黒島
  const kuroshima = await getKuroshimaStatus(page);
  // console.log(kuroshima);

  // 大原
  const oohara = await getOoharaStatus(page);
  // console.log(oohara);

  // 上原
  const uehara = await getUeharaStatus(page);
  // console.log(uehara);

  // 鳩間
  const hatoma = await getHatomaStatus(page);
  // console.log(hatoma);

  // 小浜-竹富
  const kohamaTaketomi = await getKohamaTaketomiStatus(page);
  // console.log(kohamaTaketomi);

  // 小浜-大原
  const kohamaOohara = await getKohamaOoharaStatus(page);
  // console.log(kohamaOohara);

  // 上原-鳩間
  const ueharaHatoma = await getUeharaHatomaStatus(page);
  // console.log(ueharaHatoma);

  // 送信用データ生成
  const sendData = {
    taketomi: taketomi,
    kohama: kohama,
    kuroshima: kuroshima,
    oohara: oohara,
    uehara: uehara,
    hatoma: hatoma,
    kohama_oohara: kohamaOohara,
    kohama_taketomi: kohamaTaketomi,
    uehara_hatoma: ueharaHatoma
  };
  return sendData;
}
/**
 * 更新時刻 （2020年02月14日の運航状況）
 */
async function getUpdateTime(page) {
  return await getTextContent(page, "#operationstatus > div > div.statusdate");
}

/**
 * 今日のアナウンスを取得
 */
async function getAnnounce(page) {
  return await getTextContent(
    page,
    "#operationstatus > div > div:nth-child(5)"
  );
}

/**
 * 竹富航路
 */
async function getTaketomiStatus(page) {
  return await getStatusData(
    page,
    "#operationstatus > div > div:nth-child(7) > table > tbody > tr"
  );
}

/**
 * 小浜航路
 */
async function getKohamaStatus(page) {
  return await getStatusData(
    page,
    "#operationstatus > div > div:nth-child(8) > table > tbody > tr"
  );
}

/**
 * 黒島航路
 */
async function getKuroshimaStatus(page) {
  return await getStatusData(
    page,
    "#operationstatus > div > div:nth-child(9) > table > tbody > tr"
  );
}

/**
 * 西表大原航路
 */
async function getOoharaStatus(page) {
  return await getStatusData(
    page,
    "#operationstatus > div > div:nth-child(10) > table > tbody > tr"
  );
}

/**
 * 西表上原航路
 */
async function getUeharaStatus(page) {
  return await getStatusData(
    page,
    "#operationstatus > div > div:nth-child(11) > table > tbody > tr"
  );
}
/**
 * 鳩間航路
 */
async function getHatomaStatus(page) {
  return await getStatusData(
    page,
    "#operationstatus > div > div:nth-child(12) > table > tbody > tr"
  );
}

/**
 * 小浜-竹富航路
 */
async function getKohamaTaketomiStatus(page) {
  return await getStatusData(
    page,
    "#operationstatus > div > div:nth-child(13) > table > tbody > tr"
  );
}

/**
 * 小浜-大原航路
 */
async function getKohamaOoharaStatus(page) {
  return await getStatusData(
    page,
    "#operationstatus > div > div:nth-child(14) > table > tbody > tr"
  );
}

/**
 * 上原-鳩間航路
 */
async function getUeharaHatomaStatus(page) {
  return await getStatusData(
    page,
    "#operationstatus > div > div:nth-child(15) > table > tbody > tr"
  );
}

/**
 * 要素単体のElementプロパティのtextContentを取得する
 */
async function getTextContent(page, itemSelector) {
  const element = await page.$(itemSelector);
  return await (await element.getProperty("textContent")).jsonValue();
}

/**
 * 港単体のデータ取得
 */
async function getStatusData(page, itemSelector) {
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
    // 左の行
    const trLeft = await time.$eval("td:nth-child(1)", nd => nd.innerText);
    const leftWords = trLeft.split(" ");

    // 右の行
    const trRight = await time.$eval("td:nth-child(2)", nd => nd.innerText);
    const rightWords = trRight.split(" ");

    // 行データ生成
    const row = {
      left: {
        memo: "",
        time: leftWords[1],
        status: {
          code: getRowStatusCode(leftWords[0]),
          text: getRowStatusText(leftWords[0])
        }
      },
      right: {
        memo: "",
        time: rightWords[1],
        status: {
          code: getRowStatusCode(rightWords[0]),
          text: getRowStatusText(rightWords[0])
        }
      }
    };
    // 配列に追加
    rows.push(row);
  }
  // 返却データ作成
  const data = {
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
  console.log("送信開始" + tableName);
  return await firebase.update(tableName, data);
}

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

/**
 * 記号からステータスを取得
 */
function getRowStatusCode(statusRawText) {
  switch (statusRawText) {
    case "△":
      return consts.CATION;
    case "×":
      return consts.CANCEL;
    case "〇":
      return consts.NORMAL;
    case "":
      return "";
    default:
      return consts.CATION;
  }
}

/**
 * 記号からステータス文字を取得
 */
function getRowStatusText(statusRawText) {
  switch (statusRawText) {
    case "○":
      return "通常運行";
    case "〇":
      return "通常運行";
    case "×":
      return "欠航";
    case "":
      return "";
    default:
      return "注意";
  }
}
