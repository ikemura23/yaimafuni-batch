const url = 'https://tenki.jp/forecast/10/50/9410/47207/3hours.html';
const admin = require('firebase-admin');
const config = require('../config/config');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require('../../serviceAccountKey.json')),
    databaseURL: config.firebase.databaseURL,
  });
}

const database = admin.database();
const sendError = require('../slack');
const createBrowser = require('../browser-factory');

module.exports = async () => {
  console.log(`開始: tenkijp`);
  const browser = await createBrowser();
  try {
    const page = await browser.newPage();
    await page.goto(url, {
      timeout: 30000,
      waitUntil: 'domcontentloaded',
    }); // ページへ移動＋表示されるまで待機

    const today = await getToday(page);
    const tomorrow = await getTomorrow(page);

    const sendData = { today: today, tomorrow: tomorrow };
    await send(sendData);
  } catch (err) {
    console.error(err);
    sendError(err.stack, 'tenkijpのスクレイピングでエラー発生!');
  } finally {
    await browser.close();
    console.log(`完了: tenkijp`);
  }
};

async function getData(page, itemSelector) {
  return (datas = await page.evaluate((selector) => {
    const list = Array.from(document.querySelectorAll(selector));
    return list.map((data) => data.textContent.trim());
  }, itemSelector));
}

/**
 * 今日
 * @param {Page} page
 */
async function getToday(page) {
  const hour = await getData(page, '#forecast-point-3h-today > tbody > tr.hour > td');
  // console.log(hour) //=> [ '03', '06', '09', '12', '15', '18', '21', '24' ]
  const weather = await getData(page, '#forecast-point-3h-today > tbody > tr.weather > td');
  // console.log(weather) //=> [ '雨', '曇り', '晴れ', '晴れ', '晴れ', '曇り', '曇り', '曇り' ]
  const windDirection = await getData(page, '#forecast-point-3h-today > tbody > tr.wind-direction > td > p');
  // console.log(windDirection) //=> [ '南西', '南', '南東', '南東', '東南東', '東南東', '東南東', '南東' ]
  const windSpeed = await getData(page, '#forecast-point-3h-today > tbody > tr.wind-speed > td');
  // console.log(windSpeed) //=> [ '5', '5', '5', '5', '5', '5', '5', '4' ]
  const datas = [];

  for (i = 1; i < 6; i++) {
    datas.push({
      hour: hour[i],
      weather: weather[i],
      windBlow: windDirection[i],
      windSpeed: windSpeed[i],
    });
  }
  // console.log(datas)
  return datas;
}

/**
 * 明日
 * @param page
 */
async function getTomorrow(page) {
  const hour = await getData(page, '#forecast-point-3h-tomorrow > tbody > tr.hour > td');
  // console.log(hour) //=> [ '03', '06', '09', '12', '15', '18', '21', '24' ]
  const weather = await getData(page, '#forecast-point-3h-tomorrow > tbody > tr.weather > td');
  // console.log(weather) //=> [ '雨', '曇り', '晴れ', '晴れ', '晴れ', '曇り', '曇り', '曇り' ]
  const windDirection = await getData(page, '#forecast-point-3h-tomorrow > tbody > tr.wind-blow > td > p'); //todayとtrクラス名が違う
  // console.log(windDirection) //=> [ '南西', '南', '南東', '南東', '東南東', '東南東', '東南東', '南東' ]
  const windSpeed = await getData(page, '#forecast-point-3h-tomorrow > tbody > tr.wind-speed > td');
  // console.log(windSpeed) //=> [ '5', '5', '5', '5', '5', '5', '5', '4' ]
  const datas = [];
  for (i = 1; i < 6; i++) {
    datas.push({
      hour: hour[i],
      weather: weather[i],
      windBlow: windDirection[i],
      windSpeed: windSpeed[i],
    });
  }
  console.log(datas);
  return datas;
}

/**
 * DBへ登録
 */
async function send(data) {
  return Promise.all([
    database.ref('weather/today/table').set(data.today),
    database.ref('weather/tomorrow/table').set(data.tomorrow),
  ]);
}
