const puppeteer = require('puppeteer')
const url = 'https://weather.yahoo.co.jp/weather/jp/47/9410.html'
const firebase = require("firebase");
const sendError = require('../../slack');
// Heroku環境かどうかの判断
const LAUNCH_OPTION = process.env.DYNO ? { args: ['--no-sandbox', '--disable-setuid-sandbox'] } : { headless: true };

module.exports = (async () => {
  console.log("yahoo start")
  const browser = await puppeteer.launch(LAUNCH_OPTION)
  try {
    const page = await browser.newPage()
    await page.goto(url, { waitUntil: 'networkidle2' }) // ページへ移動＋表示されるまで待機
    // await page.screenshot({ path: 'screenshot.png' });

    const today = await getToday(page)
    const tomorrow = await getTomorrow(page)

    const sendData = { today: today, tomorrow: tomorrow };
    await send(sendData)
    
  } catch (err) {
    console.error(err)
    sendError(err.stack, "yahooのスクレイピングでエラー発生!")
    console.log(err)
  } finally {
    browser.close()
    console.log("yahoo end")
  }
})

/**
 * pageからセレククターの値を返す
 * @param {ページ} page 
 * @param {セレクター} itemSelector 
 */
async function getData(page, itemSelector) {
  return await page.$eval(itemSelector, item => {
    return item.textContent;
  })
}

/**
 * 今日
 * @param {Page} page 
 */
async function getToday(page) {
  const date = await getData(page, "div.forecastCity > table > tbody > tr > td:nth-child(1) > div > p.date")
  // console.log(date)
  const weather = await getData(page, "#main > div.forecastCity > table > tbody > tr > td:nth-child(1) > div > p.pict")
  // console.log(weather)
  const wind = await getData(page, "#main > div.forecastCity > table > tbody > tr > td:nth-child(1) > div > dl > dd:nth-child(2)")
  // console.log(wind)
  const wave = await getData(page, "#main > div.forecastCity > table > tbody > tr > td:nth-child(1) > div > dl > dd:nth-child(4)")
  // console.log(wave)
  const temperatureHight = await getData(page, "#main > div.forecastCity > table > tbody > tr > td:nth-child(1) > div > ul > li.high")
  // console.log(temperatureHight)
  const temperatureLow = await getData(page, "#main > div.forecastCity > table > tbody > tr > td:nth-child(1) > div > ul > li.low")
  // console.log(temperatureLow)

  //返却データ作成
  const data = {
    date: date,
    weather: weather,
    temperature: {
      hight: temperatureHight,
      low: temperatureLow
    },
    wave: wave,
    wind: wind
  }
  // console.log(data)
  return data
}

/**
 * 明日
 * @param {page}} page 
 */
async function getTomorrow(page) {
  const date = await getData(page, "#main > div.forecastCity > table > tbody > tr > td:nth-child(2) > div > p.date")
  console.log(date)
  const weather = await getData(page, "#main > div.forecastCity > table > tbody > tr > td:nth-child(2) > div > p.pict")
  // console.log(weather)
  const wind = await getData(page, "#main > div.forecastCity > table > tbody > tr > td:nth-child(2) > div > dl > dd:nth-child(2)")
  // console.log(wind)
  const wave = await getData(page, "#main > div.forecastCity > table > tbody > tr > td:nth-child(2) > div > dl > dd:nth-child(4)")
  // console.log(wave)
  const temperatureHight = await getData(page, "#main > div.forecastCity > table > tbody > tr > td:nth-child(2) > div > ul > li.high")
  // console.log(temperatureHight)
  const temperatureLow = await getData(page, "#main > div.forecastCity > table > tbody > tr > td:nth-child(2) > div > ul > li.low")
  // console.log(temperatureLow)

  //返却データ作成
  const data = {
    date: date,
    weather: weather,
    temperature: {
      hight: temperatureHight,
      low: temperatureLow
    },
    wave: wave,
    wind: wind
  }
  // console.log(data)
  return data
}
/**
 * DBへ登録
 */
async function send(data) {
  return Promise.all([
    firebase.database().ref('weather/today').set(data.today),
    firebase.database().ref('weather/tomorrow').set(data.tomorrow)
  ])
};
