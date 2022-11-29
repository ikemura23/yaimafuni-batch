const browserFactory = require('../../browser-factory');
const URL = "https://www.yaeyama.co.jp/operation.html";
const consts = require("../../consts.js");
const config = require("../../config/config");
const firebase = require("../../repository/firebase_repository");
const sendError = require('../../slack');
const COMPANY = consts.YKF;

module.exports = async () => {
    console.log("開始:" + COMPANY + " 時間+アナウンス");
    const browser = await browserFactory.create();
    try {
        const page = await browser.newPage();
        await page.setUserAgent(config.puppeteer.userAgent);
        await page.goto(URL, {waitUntil: "networkidle2"}); // ページへ移動＋表示されるまで待機

        // 更新日時
        const updateTime = await getUpdateTime(page);
        // アナウンス
        const announce = await getAnnounce(page);
        // アナウンス2
        const announce2 = await getAnnounce2(page);

        // 送信用の変数
        const data = {
            comment: announce2 ? `${announce}\n${announce2}` : announce,
            updateTime: updateTime,
        };
        console.dir(data)
        // 送信開始
        await firebase.update(consts.YKF, data);

    } catch (error) {
        console.error(error.stack, "異常: YKF 時間+アナウンスでエラー");
        sendError(
            error.stack,
            "異常: YKF 時間+アナウンスのスクレイピングでエラー発生!"
        );
    } finally {
        await browser.close();
        console.log("終了:" + COMPANY + " 時間+アナウンス");
    }
};

/**
 * 更新日時
 */
async function getUpdateTime(page) {
    const data = await getData(page, "#status > div > div.statusdate");
    // console.log(data);
    return data;
}

/**
 * アナウンス
 */
async function getAnnounce(page) {
    const data = await getData(page, "#status > div > div:nth-child(3)");
    // console.log(data);
    return data;
}

/**
 * アナウンス 2
 */
async function getAnnounce2(page) {
    const data = await getInnerTextForSelector(
        page,
        "#status > div > div.statusdate2.bgylw"
    );
    // console.log(data);
    return data;
}

/**
 * pageからセレククターで指定された値を取得して返す
 */
async function getData(page, itemSelector) {
    return await page.$eval(itemSelector, (item) => {
        return item.textContent;
    });
}

const getInnerTextForSelector = async (page, selector) => {
    try {
        return await page.$eval(selector, (item) => {
            return item.textContent;
        });
    } catch (error) {
        // 存在しない場合もあるのでエラーは握りつぶす
        // console.error(error)
        return '';
    }
};
