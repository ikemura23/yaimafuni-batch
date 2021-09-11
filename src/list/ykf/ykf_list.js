const puppeteer = require("puppeteer");
// Heroku環境かどうかの判断
const LAUNCH_OPTION = process.env.DYNO
    ? {args: ["--no-sandbox", "--disable-setuid-sandbox"]}
    : {headless: true};
const URL = "https://www.yaeyama.co.jp/";
const consts = require("../../consts.js");
const config = require("../../config/config");
const firebase = require("../../repository/firebase_repository");
const sendError = require('../../slack');

const COMPANY = consts.YKF;

module.exports = async () => {
    console.log(`開始: ${COMPANY} 一覧`);
    const browser = await puppeteer.launch(LAUNCH_OPTION);
    try {
        const page = await browser.newPage();
        page.setUserAgent(config.puppeteer.userAgent);
        await page.goto(URL, {waitUntil: "networkidle2"}); // ページへ移動＋表示されるまで待機

        // スクレイピングした生の値
        const listRaw = await getList(page) // 竹富<br>一部欠航,小浜<br>一部欠航,黒島<br>一部欠航
        // console.log(`listRaw: ${listRaw}`);

        // 送信用に変換
        const sendData = await makeSendData(listRaw);
        console.dir(sendData);
        // 送信開始
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
async function getList(page) {
    return await getDataList(
        page,
        "#operation_status > div:nth-child(2) > div > div > div > div"
    );
}

async function getDataList(page, itemSelector) {
    return (datas = await page.evaluate(selector => {
        const list = Array.from(document.querySelectorAll(selector));
        return list.map(data => data.innerHTML);
    }, itemSelector));
}

/**
 * 生データから送信用の値を作成する
 */
async function makeSendData(listRaw) {
    const splitData = listRaw.map(raw => raw.split('<br>', 2)); //  [竹富,一部欠航],[小浜,一部欠航],[黒島,一部欠航]... に変換する
    // console.log(`splitData: ${splitData}, length:${splitData.length}`);

    const returnData = {};
    for (const data of splitData) {
        const portName = data[0];
        // console.log(`portName: ${portName}`)
        const portCode = getPortCode(portName);
        const statusText = data[1]; // 記号文字、◯や△や☓など
        const portData = {
            comment: "",
            portCode: portCode,
            portName: portName,
            status: getStatusCode(statusText)
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
        text: ""
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
