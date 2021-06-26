const puppeteer = require("puppeteer");
// Heroku環境かどうかの判断
const LAUNCH_OPTION = process.env.DYNO
  ? { args: ["--no-sandbox", "--disable-setuid-sandbox"] }
  : { headless: true };
const TARGET_URL = "https://aneikankou.co.jp/condition";
const config = require("../config/config");

const getAnneiUpdateTimeAndComment = async () => {
  console.group("getAnneiUpdateTimeAndComment start");
  const browser = await puppeteer.launch(LAUNCH_OPTION);
  try {
    const page = await browser.newPage();

    await page.goto(TARGET_URL, { waitUntil: "networkidle2" }); // ページへ移動＋表示されるまで待機

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

    // お知らせコメントの取得
    const commentText = await page.$eval("div.condition_list > div", (item) => {
      return item.textContent.trim();
    });

    // 返却に整形
    const value = {
      updateTime: updateTimeText,
      comment: commentText,
    };

    // console.dir(value);
    return value;
  } catch (error) {
    // TODO
  } finally {
    browser.close();
    console.groupEnd();
  }
};

module.exports = getAnneiUpdateTimeAndComment;
