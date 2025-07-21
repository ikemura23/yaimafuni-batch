const createBrowser = require("../browser-factory");
const url = "https://weather.yahoo.co.jp/weather/jp/47/9410.html";
const admin = require("firebase-admin");
const config = require("../config/config");
const sendError = require("../slack");

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require("../../serviceAccountKey.json")),
    databaseURL: config.firebase.databaseURL,
  });
}

const database = admin.database();

module.exports = async () => {
  console.log("yahoo start");
  const browser = await createBrowser();
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" }); // ページへ移動＋表示されるまで待機
    // await page.screenshot({ path: 'screenshot.png' });

    const today = await getToday(page);
    const tomorrow = await getTomorrow(page);

    const sendData = { today: today, tomorrow: tomorrow };
    await send(sendData);
  } catch (err) {
    console.error(err);
    sendError(err.stack, "yahooのスクレイピングでエラー発生!");
    console.log(err);
  } finally {
    await browser.close();
    console.log("yahoo end");
  }
};

/**
 * pageからセレククターの値を返す
 * @param {"ページ"} page
 * @param {"セレクター"} itemSelector
 */
async function getData(page, itemSelector) {
  return await page.$eval(itemSelector, (item) => {
    return item.textContent;
  });
}

/**
 * 今日
 * @param {Page} page
 */
async function getToday(page) {
  const date = await getData(
    page,
    "div.forecastCity > table > tbody > tr > td:nth-child(1) > div > p.date"
  );
  // console.log(date)
  const weather = await getData(
    page,
    "#main > div.forecastCity > table > tbody > tr > td:nth-child(1) > div > p.pict"
  );
  // console.log(weather)
  const wind = await getData(
    page,
    "#main > div.forecastCity > table > tbody > tr > td:nth-child(1) > div > dl > dd:nth-child(2)"
  );
  // console.log(wind)
  const wave = await getData(
    page,
    "#main > div.forecastCity > table > tbody > tr > td:nth-child(1) > div > dl > dd:nth-child(4)"
  );
  // console.log(wave)
  const temperatureHight = await getData(
    page,
    "#main > div.forecastCity > table > tbody > tr > td:nth-child(1) > div > ul > li.high"
  );
  // console.log(temperatureHight)
  const temperatureLow = await getData(
    page,
    "#main > div.forecastCity > table > tbody > tr > td:nth-child(1) > div > ul > li.low"
  );
  // console.log(temperatureLow)

  //返却データ作成
  const data = {
    date: date.replace(/\r?\n/g, "").trim(),
    weather: weather.replace(/\r?\n/g, "").trim(),
    temperature: {
      hight: temperatureHight.replace(/\r?\n/g, "").trim(),
      low: temperatureLow.replace(/\r?\n/g, "").trim(),
    },
    wave: wave.replace(/\r?\n/g, "").trim(),
    wind: wind.replace(/\r?\n/g, "").trim(),
  };
  // console.log(data)
  return data;
}

/**
 * 明日
 * @param page
 */
async function getTomorrow(page) {
  const date = await getData(
    page,
    "#main > div.forecastCity > table > tbody > tr > td:nth-child(2) > div > p.date"
  );
  console.log(date);
  const weather = await getData(
    page,
    "#main > div.forecastCity > table > tbody > tr > td:nth-child(2) > div > p.pict"
  );
  // console.log(weather)
  const wind = await getData(
    page,
    "#main > div.forecastCity > table > tbody > tr > td:nth-child(2) > div > dl > dd:nth-child(2)"
  );
  // console.log(wind)
  const wave = await getData(
    page,
    "#main > div.forecastCity > table > tbody > tr > td:nth-child(2) > div > dl > dd:nth-child(4)"
  );
  // console.log(wave)
  const temperatureHight = await getData(
    page,
    "#main > div.forecastCity > table > tbody > tr > td:nth-child(2) > div > ul > li.high"
  );
  // console.log(temperatureHight)
  const temperatureLow = await getData(
    page,
    "#main > div.forecastCity > table > tbody > tr > td:nth-child(2) > div > ul > li.low"
  );
  // console.log(temperatureLow)

  //返却データ作成
  const data = {
    date: date.replace(/\r?\n/g, "").trim(),
    weather: weather.replace(/\r?\n/g, "").trim(),
    temperature: {
      hight: temperatureHight.replace(/\r?\n/g, "").trim(),
      low: temperatureLow.replace(/\r?\n/g, "").trim(),
    },
    wave: wave.replace(/\r?\n/g, "").trim(),
    wind: wind.replace(/\r?\n/g, "").trim(),
  };
  console.dir(data);
  return data;
}

/**
 * DBへ登録
 */
async function send(data) {
  return Promise.all([
    database.ref("weather/today").set(data.today),
    database.ref("weather/tomorrow").set(data.tomorrow),
  ]);
}
