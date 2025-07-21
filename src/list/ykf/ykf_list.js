const createBrowser = require("../../browser-factory");
const URL = "http://www.yaeyama.co.jp/operation.html";
const consts = require("../../consts.js");
const config = require("../../config/config");
const firebase = require("../../repository/firebase_repository");
const sendError = require("../../slack");

const COMPANY = consts.YKF;

module.exports = async () => {
  console.log(`開始: ${COMPANY} 一覧`);
  const browser = await createBrowser();
  try {
    const page = await browser.newPage();
    await page.setUserAgent(config.puppeteer.userAgent);
    await page.goto(URL, { waitUntil: "networkidle2", timeout: 60000 }); // ページへ移動＋表示されるまで待機

    // スクレイピングした生の値
    const sendData = await generateSendData(page); // 竹富<br>一部欠航,小浜<br>一部欠航,黒島<br>一部欠航
    console.log("送信値");
    console.dir(sendData);
    // // 送信開始
    await firebase.set(consts.YKF, sendData);
  } catch (error) {
    console.error(error.stack, `${COMPANY}一覧でエラー`);
    sendError(error.stack, `${COMPANY}一覧のスクレイピングでエラー発生!`);
  } finally {
    await browser.close();
    console.log(`終了: ${COMPANY} 一覧`);
  }
};

/**
 * リスト取得
 */
async function generateSendData(page) {
  const contentList = await getDataList(
    page,
    "#status > div > div.status > div.list"
  );
  console.log("YKF 一覧 inner htmlデータ");
  console.table(contentList);
  return makeSendData(contentList);
}

async function getDataList(page, itemSelector) {
  return (datas = await page.evaluate((selector) => {
    const list = Array.from(document.querySelectorAll(selector));
    /* こんなデータが取得できる
  ┌─────────┬─────────────────────────────────────────────┐
  │ (index) │                   Values                    │
  ├─────────┼─────────────────────────────────────────────┤
  │    0    │   '<span>竹富</span><strong>〇</strong>'    │
  │    1    │   '<span>小浜</span><strong>〇</strong>'    │
  │    2    │   '<span>黒島</span><strong>〇</strong>'    │
  │    3    │ '<span>西表大原</span><strong>〇</strong>'  │
  │    4    │ '<span>西表上原</span><strong>〇</strong>'  │
  │    5    │   '<span>鳩間</span><strong>〇</strong>'    │
  │    6    │ '<span>上原-鳩間</span><strong>〇</strong>' │
  └─────────┴─────────────────────────────────────────────┘
    */
    return list.map((data) => {
      {
        // 子要素のtextContentを取得して、オブジェクトにセットして返す
        let obj = {};
        obj["port"] = data.firstChild.textContent; // 港名
        obj["status"] = data.lastChild.textContent; // 運行ステータス値
        return obj;
      }
    });
  }, itemSelector));
}

/**
 * 生データから送信用の値を作成する
 */
async function makeSendData(contentList) {
  const returnData = {};
  for (const data of contentList) {
    const portName = data.port;
    // console.log(`portName: ${portName}`)
    const portCode = getPortCode(portName);
    const statusText = data.status; // 記号文字、◯や△や☓など
    const portData = {
      comment: "",
      portCode: portCode,
      portName: portName,
      status: getStatusCode(statusText),
    };
    returnData[portCode] = portData;
  }
  // console.log(returnData)
  return returnData;
}

// 港名から港コードを返す
function getPortCode(portName) {
  // 港id
  if (portName === "竹富") {
    return consts.TAKETOMI;
  } else if (portName === "小浜") {
    return consts.KOHAMA;
  } else if (portName === "小浜-竹富") {
    return consts.KOHAMA_TAKETOMI;
  } else if (portName === "黒島") {
    return consts.KUROSHIMA;
  } else if (portName === "小浜-大原") {
    return consts.KOHAMA_OOHARA;
  } else if (portName === "西表大原") {
    return consts.OOHARA;
  } else if (portName === "西表上原") {
    return consts.UEHARA;
  } else if (portName === "上原-鳩間") {
    return consts.UEHARA_HATOMA;
  } else if (portName === "鳩間") {
    return consts.HATOMA;
  }
}

// 記号から運行ステータスを判別
function getStatusCode(kigou) {
  const status = {
    code: "",
    text: "",
  };
  if (kigou === "△") {
    status.code = "cation";
    status.text = "注意";
  } else if (kigou === "×") {
    status.code = "cancel";
    status.text = "欠航";
  } else if (kigou === "〇") {
    status.code = "normal";
    status.text = "通常運行";
  } else if (kigou === "一部欠航") {
    status.code = "cation";
    status.text = "一部欠航";
  } else {
    status.code = "cation";
    status.text = "注意";
  }
  return status;
}
