const createBrowser = require('../browser-factory');
// const sendError = require('../slack');

const TARGET_URL = "https://aneikankou.co.jp/condition";

const getAnneiUpdateTimeAndComment = async () => {
    console.group("getAnneiUpdateTimeAndComment start");

    console.log("await createBrowser()")
    const browser = await createBrowser();
    console.log("await browserFactory.create() end")
    try {
        console.log("try start")
        const page = await browser.newPage();
        console.log("browser.newPage() ok")

        await page.goto(TARGET_URL, {waitUntil: "networkidle2"}); // ページへ移動＋表示されるまで待機
        console.log("page.goto ok: ", TARGET_URL)
        console.log("更新時刻の取得")
        // 更新時刻の取得
        const updateTimeText = await page.$eval(
            "div.condition_subtitle > div",
            (item) => {
                return item.textContent
                    .replace("【更新時間", "")
                    .replace("】", "")
                    .trim();
            }
        );
        console.log("お知らせコメントの取得")
        // お知らせコメントの取得
        const commentText = await page.$eval("div.condition_list > div", (item) => {
            return item.textContent.trim();
        });

        // 返却に整形
        const value = {
            updateTime: updateTimeText,
            comment: commentText,
        };

        console.dir(value);
        return value;
    } catch (error) {
        console.error("Error getAnneiUpdateTimeAndComment: ", error);
        // sendError(error)
    } finally {
        await browser.close();
        console.groupEnd();
    }
};

module.exports = getAnneiUpdateTimeAndComment;
