const puppeteer = require("puppeteer");
// Heroku環境かどうかの判断
const LAUNCH_OPTION = process.env.DYNO
  ? { args: ["--no-sandbox", "--disable-setuid-sandbox"] }
  : { headless: true };
const URL = "http://www.aneikankou.co.jp";
const consts = require('../consts.js');

module.exports = async () => {
  try {
    const browser = await puppeteer.launch(LAUNCH_OPTION);
    const page = await browser.newPage();
    page.setUserAgent(
      "Mozilla /5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B5110e Safari/601.1"
    );
    await page.goto(URL, { waitUntil: "networkidle2" }); // ページへ移動＋表示されるまで待機
    await page.screenshot({ path: "graph.png" });
    // 全体アナウンス＋更新日時を取得
    const annaunce = await getAnnaunce(page);
    // console.log(annaunce);

    const portNames = await getData(
      page,
      "#situation > div > ul.route > li.chips-btn > a > div.area > span.name"
    );
    // console.log(portNames);
    const statusTexts = await getData(
      page,
      "#situation > div > ul.route > li.chips-btn > a > div.area > span:nth-child(2)"
    );
    // console.log(statusTexts);
    const statusClasses = await getClass(
      page,
      "#situation > div > ul.route > li.chips-btn > a > div.area > span:nth-child(2)"
    );
    // console.log(statusClasses);
    const chipsComments = await getData(
      page,
      "#situation > div > ul.route > li.chips-btn > div.route-chips > div > p"
    );
    // console.log(chipsComments);

    const sendData = {
      comment: annaunce.comment,
      updateTime: annaunce.updateTime,
      ports: []
    };

    // 送信用データを作成する
    portNames.forEach((_, i) => {
      const portName = portNames[i];
      const portCode = getPortCode(portName);
      const statusText = statusTexts[i];
      const statusCode = getStatusCode(statusText);
      const comment = chipsComments[i];

      const data = {
        portCode: portName,
        portName: portCode,
        status: {
          code: statusCode,
          text: statusCode
        },
        comment: comment
      };
      sendData.ports.push(data);
    });
    console.log(sendData);

    browser.close();
  } catch (e) {
    console.error(e);
    // sendError(error.stack, "tenkijpのスクレイピングでエラー発生!");
    browser.close();
  }
  //    finally {
  //     browser.close();
  //   }
};

async function getAnnaunce(page) {
  return await page.evaluate(() => {
    // 本日のアナウンス
    const comment = document.querySelector("div.content_wrap > p.all-note");
    // 本日アナウンスの更新日時
    const updateTime = document.querySelector("div.service > h3 > span");
    return {
      comment: comment.textContent.trim(),
      updateTime: updateTime.textContent.trim()
    };
  });
}

async function getData(page, itemSelector) {
  return (datas = await page.evaluate(selector => {
    const list = Array.from(document.querySelectorAll(selector));
    return list.map(data => data.textContent.trim());
  }, itemSelector));
}

async function getData2(page, itemSelector) {
  const element = await page.$(itemSelector);
  const clazz = await (await element.getProperty("className")).jsonValue();
  // const span = elements.map(el => el.getE)
  return clazz;
}

async function getClass(page, itemSelector) {
  const elements = await page.$$(itemSelector);
  // https://t-kojima.github.io/2018/07/18/0028-async-await-in-loop/
  return Promise.all(
    elements.map(async element => {
      return await (await element.getProperty("className")).jsonValue(); //  flag triangle
      // [ 'flag', 'triangle' ]という配列になるので、後者のみを返す
      // return value.split(/\s/)[1];
    })
  );
}

// 港名から港コードを返す
function getPortCode(portName) {
  // 港id
  if (portName.toString().includes("竹富")) {
    return consts.TAKETOMI;
  } else if (portName.toString().includes("小浜")) {
    return consts.KOHAMA;
  } else if (portName.toString().includes("黒島")) {
    return consts.KUROSHIMA;
  } else if (portName.toString().includes("大原")) {
    return consts.OOHARA;
  } else if (portName.toString().includes("上原")) {
    return consts.UEHARA;
  } else if (portName.toString().includes("鳩間")) {
    return consts.HATOMA;
  } else if (portName.toString().includes("波照間")) {
    return consts.HATERUMA;
  }
}

/**
 * タグのcssクラス名からステータスコードを取得
 * @param {港単体タグ} arreaTag 
 */
function getStatusCode(className) {

  if (className == "flag triangle") {
    return consts.CATION;
  } else if (className == "flag out") {
    return consts.CANCEL;
  } else if (className == "flag circle") {
    return consts.NORMAL;
  } else {
    return consts.CATION;
  }
}