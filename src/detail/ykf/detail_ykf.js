// YKF 詳細
const browserFactory = require('../../browser-factory')
const URL = "https://www.yaeyama.co.jp/operation.html";
const consts = require("../../consts.js");
const config = require("../../config/config");
const firebase = require("../../repository/firebase_repository");
const sendError = require("../../slack");
const COMPANY = consts.YKF;

module.exports = async () => {
    console.log(`開始: ${COMPANY} 詳細`);
    const browser = await browserFactory.create();
    try {
        const page = await browser.newPage();
        await page.setUserAgent(config.puppeteer.userAgent);
        await page.goto(URL, {waitUntil: "networkidle2"}); // ページへ移動＋表示されるまで待機

        // データ取得
        const data = await getData(page);
        console.table(data);

        // 送信開始
        if (data != null) {
            await sendToFirebase(data);
        } else {
            console.log("dataが null のため送信しない " + tableName);
        }

    } catch (error) {
        console.error(error.stack, `${COMPANY}一覧でエラー`);
        sendError(error.stack, `${COMPANY}一覧のスクレイピングでエラー発生!`);

    } finally {
        await browser.close();
        console.log(`終了: ${COMPANY} 詳細`);
    }
};

async function getData(page) {
    // 最初に div.local をまとめて取得
    const devLocalNodes = await page.$$("#status > div > div.local");
    // console.log(`devLocalNodes.length:${devLocalNodes.length}`);
    if (devLocalNodes.length == 0) {
        console.log("devLocalNodes is empty");
        return null;
    }

    // 送信用データ生成
    const sendData = {
        taketomi: await getStatusData(
            await devLocalNodes[0].$$("div.local.local0 > table > tbody > tr")
        ), // 竹富
        kohama: await getStatusData(
            await devLocalNodes[1].$$("div.local.local1 > table > tbody > tr")
        ), // 小浜
        kuroshima: await getStatusData(
            await devLocalNodes[2].$$("div.local.local2 > table > tbody > tr")
        ), // 黒島
        oohara: await getStatusData(
            await devLocalNodes[3].$$("div.local.local3 > table > tbody > tr")
        ), // 大原
        uehara: await getStatusData(
            await devLocalNodes[4].$$("div.local.local4 > table > tbody > tr")
        ), // 上原
        hatoma: await getStatusData(
            await devLocalNodes[5].$$("div.local.local5 > table > tbody > tr")
        ), // 鳩間
        // TODO: 上原ー鳩間も送って大丈夫か試す
        // kohama_oohara: await getKohamaOoharaStatus(page), // 小浜-大原
        // kohama_taketomi: await getKohamaTaketomiStatus(page), // 小浜-竹富
        // uehara_hatoma: await getUeharaHatomaStatus(page) // 上原-鳩間
    };
    return sendData;
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
async function getStatusData(trNodes) {
    // console.log(`trNodes.length:${trNodes.length}`);
    if (trNodes.length === 0) {
        console.log("trNodes is empty");
        return;
    }
    // ヘッダー左
    const leftPortName = await trNodes[1].$eval(
        "td:nth-child(1)",
        (nd) => nd.innerText
    );
    // ヘッダー右
    const rightPortName = await trNodes[1].$eval(
        "td:nth-child(2)",
        (nd) => nd.innerText
    );
    // console.log(`leftPortName:${leftPortName} rightPortName:${rightPortName}`);

    // 時刻ごとのステータス
    // trタグの0〜1行目は港名なので除外する
    const timeTable = trNodes.filter((_, i) => i > 1);
    const rows = [];
    // 時刻ステータスのループ
    for (const time of timeTable) {
        // 左の行
        const trLeft = await time.$eval("td:nth-child(1)", (nd) => nd.innerText);
        const leftWords = trLeft.split(" ");

        // 右の行
        const trRight = await time.$eval("td:nth-child(2)", (nd) => nd.innerText);
        const rightWords = trRight.split(" ");

        // 行データ生成
        const row = {
            left: {
                memo: "",
                time: leftWords[1],
                status: {
                    code: getRowStatusCode(leftWords[0]),
                    text: getRowStatusText(leftWords[0]),
                },
            },
            right: {
                memo: "",
                time: rightWords[1],
                status: {
                    code: getRowStatusCode(rightWords[0]),
                    text: getRowStatusText(rightWords[0]),
                },
            },
        };
        // console.log(row);
        // 配列に追加
        rows.push(row);
    }
    // 返却データ作成
    // console.log(data);
    return {
        header: {
            left: leftPortName,
            right: rightPortName,
        },
        row: rows,
    };
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
