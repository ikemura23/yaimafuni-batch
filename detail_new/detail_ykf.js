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

    // スクレイピングした生の値、9件取得できるはず
    const listRaw = await getRawData(page);
    // 送信用に変換
    const sendData = await convertSendData(page, listRaw);

    // 送信開始
    // await firebase.update(consts.YKF, sendData);

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
async function getRawData(page) {
  const SELECTOR = {
    TAKETOMI: "#operationstatus > div > div:nth-child(4) > table > tbody > tr"
  };
  console.log("getRawData");
  const trNodes = await page.$$(SELECTOR.TAKETOMI);
  console.log(trNodes.length);

  // 港名
  const portName = await trNodes[0].$eval("h3", nd => nd.innerText);
  console.log(portName);
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
  // const trNodes = await page.$$(`${SELECTOR.TAKETOMI}  > tr`);
  console.log(
    `leftPortName: ${leftPortName} , rightPortName: ${rightPortName}`
  );

  // trタグの0〜1行目は港名なので除外する
  const timeTable = trNodes.filter((_, i) => i > 1);
  // 時間ステータス
  const rows = [];
  for (const time of timeTable) {
    const trLeft = await time.$eval("td:nth-child(1)", nd => nd.innerText);
    const trLright = await time.$eval("td:nth-child(2)", nd => nd.innerText);

    const row = {
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
  console.log(data);

  return data;

  // return await getDataList(page, "#operationstatus > div > div.local");
}

async function getDataList(page, itemSelector) {
  return (datas = await page.evaluate(selector => {
    const list = Array.from(document.querySelectorAll(selector));
    return list.map(data => data.textContent.trim());
  }, itemSelector));
}

/**
 * 生データから送信用の値を作成する
 */
async function convertSendData(page, nodes) {
  // console.log(nodes)
  // raws.map(raw => console.log(raw))
  if (nodes) return;
  nodes.foreach(node => console.log(node.textContent));

  // const sendData = list.map(text => {
  //   const portName = text.slice(0, -1);
  //   const statusRaw = text.slice(-1);
  //   return {
  //     portCode: getPortCode(portName),
  //     portName: portName,
  //     status: getStatusCode(statusRaw)
  //   };
  // });
  return sendData;
}

function getSendDataTemplete() {
  const timeTable = {
    header: {
      left: "",
      right: ""
    },
    row: []
  };

  const row = {
    left: {
      time: leftTime,
      status: {
        code: "normal",
        text: "通常運行"
      }
    },
    right: {
      time: righTime,
      status: {
        code: "normal",
        text: "通常運行"
      }
    }
  };
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
