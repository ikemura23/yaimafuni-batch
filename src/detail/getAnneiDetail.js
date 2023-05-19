const createBrowser = require('../browser-factory')
const TARGET_URL = "https://aneikankou.co.jp/condition";
const consts = require("../consts.js");
const sendError = require("../slack");

const getAnneiDetail = async () => {
    console.group("getAnneiDetail start");
    const browser = await createBrowser();
    try {
        const page = await browser.newPage();

        await page.goto(TARGET_URL, {waitUntil: "networkidle2"}); // ページへ移動＋表示されるまで待機
        // メイン処理
        // console.dir(value);
        return await readTimetableData(page);
    } catch (error) {
        sendError(error);
    } finally {
        await browser.close();
        console.log("getAnneiDetail end");
        console.groupEnd();
    }
};
module.exports = getAnneiDetail;

/**
 * スクレイピング処理
 * @param page pupperteer.page
 * @returns 取得値
 */
const readTimetableData = async (page) => {
    // 送信用データ生成
    return {
        // 波照間
        hateruma: await getHaterumaStatus(page),
        // 上原
        uehara: await getUeharaStatus(page),
        // 鳩間
        hatoma: await getHatomaStatus(page),
        // 大原
        oohara: await getOoharaStatus(page),
        // 竹富
        taketomi: await getTaketomiStatus(page),
        // 小浜
        kohama: await getKohamaStatus(page),
        // 黒島
        kuroshima: await getKuroshimaStatus(page),
    };
};

/**
 * 波照間
 */
async function getHaterumaStatus(page) {
    return await getStatusData(
        page,
        "#condition > div > div:nth-child(5) > div.condition_list > div:nth-child(1) > div:nth-child(1) > div:nth-child(3) > div:nth-child(1) > div",
        "#condition > div > div:nth-child(5) > div.condition_list > div:nth-child(1) > div:nth-child(1) > div:nth-child(3) > div:nth-child(2) > div",
        "波照間発"
    );
}

/**
 * 上原
 */
async function getUeharaStatus(page) {
    return await getStatusData(
        page,
        "#condition > div > div:nth-child(5) > div.condition_list > div:nth-child(1) > div:nth-child(2) > div:nth-child(3) > div:nth-child(1) > div",
        "#condition > div > div:nth-child(5) > div.condition_list > div:nth-child(1) > div:nth-child(2) > div:nth-child(3) > div:nth-child(2) > div",
        "上原発"
    );
}

/**
 * 鳩間
 */
async function getHatomaStatus(page) {
    return await getStatusData(
        page,
        "#condition > div > div:nth-child(5) > div.condition_list > div:nth-child(2) > div:nth-child(1) > div:nth-child(3) > div:nth-child(1) > div",
        "#condition > div > div:nth-child(5) > div.condition_list > div:nth-child(2) > div:nth-child(1) > div:nth-child(3) > div:nth-child(2) > div",
        "鳩間発"
    );
}

/**
 * 大原
 */
async function getOoharaStatus(page) {
    return await getStatusData(
        page,
        "#condition > div > div:nth-child(5) > div.condition_list > div:nth-child(2) > div:nth-child(2) > div:nth-child(3) > div:nth-child(1) > div",
        "#condition > div > div:nth-child(5) > div.condition_list > div:nth-child(2) > div:nth-child(2) > div:nth-child(3) > div:nth-child(2) > div",
        "大原発"
    );
}

/**
 * 竹富
 */
async function getTaketomiStatus(page) {
    return await getStatusData(
        page,
        "#condition > div > div:nth-child(5) > div.condition_list > div:nth-child(3) > div:nth-child(1) > div:nth-child(3) > div:nth-child(1) > div",
        "#condition > div > div:nth-child(5) > div.condition_list > div:nth-child(3) > div:nth-child(1) > div:nth-child(3) > div:nth-child(2) > div",
        "竹富発"
    );
}

/**
 * 小浜
 */
async function getKohamaStatus(page) {
    return await getStatusData(
        page,
        "#condition > div > div:nth-child(5) > div.condition_list > div:nth-child(3) > div:nth-child(2) > div:nth-child(3) > div:nth-child(1) > div",
        "#condition > div > div:nth-child(5) > div.condition_list > div:nth-child(3) > div:nth-child(2) > div:nth-child(3) > div:nth-child(2) > div",
        "小浜発"
    );
}

/**
 * 黒島
 */
async function getKuroshimaStatus(page) {
    return await getStatusData(
        page,
        "#condition > div > div:nth-child(5) > div.condition_list > div:nth-child(4) > div > div:nth-child(3) > div:nth-child(1) > div",
        "#condition > div > div:nth-child(5) > div.condition_list > div:nth-child(4) > div > div:nth-child(3) > div:nth-child(2) > div",
        "黒島発"
    );
}

/**
 * 港単体のデータ取得
 */
async function getStatusData(
    page,
    leftSelector,
    rightSelector,
    rightHeaderText
) {
    const leftNodes = await page.$$(leftSelector);
    const leftRow = await convertRowData(leftNodes);

    const rightNodes = await page.$$(rightSelector);
    const rightRow = await convertRowData(rightNodes);

    const row = [];

    for (var i = 0; i < leftRow.length; i++) {
        row.push({
            left: leftRow[i],
            right: rightRow[i],
        });
    }
    //   console.dir(row);
    return {
        header: {
            left: "石垣発",
            right: rightHeaderText,
        },
        row: row,
    };
}

/**
 * divタグのnode配列を整形して配列にする
 * @param  parentNodes divタグのnode配列
 * @returns 縦1列の配列
 */
async function convertRowData(parentNodes) {
    if (parentNodes.length === 0) {
        console.log("parentNodes is empty");
        return;
    }
    // console.log(parentNodes.length);

    // returnで返す変数
    const row = [];

    // divをループして値を取り出す
    for (const node of parentNodes) {
        // 左の時刻（例 08:00）
        const time = await node.$eval(
            "div.condition_item_port_detail_time",
            (nd) => nd.innerText
        );

        // 右のステータス記号文字（例 ○ △ ✗）
        const status = await node.$eval(
            "div.condition_item_port_detail_status",
            (nd) => nd.innerText
        );

        // console.log(`time: ${time} , status: ${status}`);

        row.push({
            memo: "",
            time: time,
            status: {
                code: await getStatusCode(status),
                text: await getStatusText(status),
            },
        });
    }
    // console.log(row);
    return row;
}

/**
 * ステータスコードを取得
 */
async function getStatusCode(statusText) {
    if (statusText === "◯") {
        return consts.NORMAL;
    } else if (statusText === "△") {
        return consts.CATION;
    } else if (statusText === "✕") {
        return consts.CANCEL;
    } else if (statusText === "未定") {
        return consts.CATION;
    } else {
        return consts.CATION;
    }
}

/**
 * ステータス文字
 */
async function getStatusText(statusText) {
    if (statusText === "◯") {
        return "通常運航";
    } else if (statusText === "△") {
        return "一部運休";
    } else if (statusText === "✕") {
        return "欠航";
    } else {
        return statusText;
    }
}
