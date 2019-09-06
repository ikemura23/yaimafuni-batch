const puppeteer = require('puppeteer')
const url = 'https://tenki.jp/lite/bousai/typhoon/'
const firebase = require("firebase");
const sendError = require('../slack');
// Heroku環境かどうかの判断
const LAUNCH_OPTION = process.env.DYNO ? { args: ['--no-sandbox', '--disable-setuid-sandbox'] } : { headless: true };

module.exports = (async () => {
  try {
    const browser = await puppeteer.launch(LAUNCH_OPTION)
    const page = await browser.newPage()
    await page.goto(url, { waitUntil: 'domcontentloaded' }) // ページへ移動＋表示されるまで待機

    const today = await getSection(page)

    // const sendData = { today: today, tomorrow: tomorrow };
    // await send(sendData)

    browser.close()
  } catch (err) {
    console.error(err)
    sendError(err.stack, "tenkijpのスクレイピングでエラー発生!")
    browser.close()
  }
})

async function getData(page, itemSelector) {
  return datas = await page.evaluate((selector) => {
    const list = Array.from(document.querySelectorAll(selector));
    return list.map(data => data.textContent.trim());
  }, itemSelector);
}

async function getData2(page, itemSelector) {
  const nodes = await page.$$eval(itemSelector, list => {
    const datas = list.filter((_, i) => i != 0 && i != list.length-1)
    console.log(datas.length)
    datas.forEach(data => {
      console.log(data.textContent)
    });
    return {

    }
  })

  console.log(nodes)
}

async function getData3(page,itemSelector) {
  const beforeNodes = await page.$$(itemSelector)
  const nodes = beforeNodes.filter((_, i) => i != 0 && i != beforeNodes.length-1)
  // const ns = await nodes.$$eval("h3", nds => nds.map(n => n.innerText))

  for (const node of nodes) {
    // const label = await page.evaluate(el => el.innerHTML, "h3");
    const label = await node.$eval('h3', nd => nd.innerText)
    const data = {
      name : await node.$eval('h3', nd => nd.innerText),
      dateTime : await node.$eval('.date-time', nd => nd.innerText),
      img : await node.$eval('img', nd => nd.src),
      scale : await node.$eval('tr:nth-child(1) > td', nd => nd.innerText),
      intensity : await node.$eval('tr:nth-child(2) > td', nd => nd.innerText),
      pressure : await node.$eval('tr:nth-child(3) > td', nd => nd.innerText),
      area : await node.$eval('tr:nth-child(4) > td', nd => nd.innerText),
      maxWindSpeedNearCenter : await node.$eval('tr:nth-child(5) > td', nd => nd.innerText),
    }
    console.log(data)
  }
    // const h3 = data.$("h3")

}

/**
 * 台風のセクションを取得、1番目は気象予報士の見解なので、スキップ
 * ２番めから台風情報なので、２番め以降をとる
 * 
 * @param {Page} page 
 */
async function getSection(page) {
  const datas = await getData3(page, "body > section > section.section-wrap")
  // 最初と最後は不要データなので除外する [ '気象予報士の見解（日直予報士：台風関連記事）', '台風13号(レンレン)', '台風14号(カジキ)', '台風を知る' ]
  // const data = notFilterData.filter((d, i) => i != 0 && i != notFilterData.length-1)

  // const data2 = await getData2(page, "body > section > section.section-wrap")
  // // console.log(hour) //=> [ '03', '06', '09', '12', '15', '18', '21', '24' ]
  // const weather = await getData(page, "#forecast-point-3h-today > tbody > tr.weather > td")
  // // console.log(weather) //=> [ '雨', '曇り', '晴れ', '晴れ', '晴れ', '曇り', '曇り', '曇り' ]
  // const windDirection = await getData(page, "#forecast-point-3h-today > tbody > tr.wind-direction > td > p")
  // // console.log(windDirection) //=> [ '南西', '南', '南東', '南東', '東南東', '東南東', '東南東', '南東' ]
  // const windSpeed = await getData(page, "#forecast-point-3h-today > tbody > tr.wind-speed > td")
  // // console.log(windSpeed) //=> [ '5', '5', '5', '5', '5', '5', '5', '4' ]
  // const datas = []

  // for (i = 1; i < 6; i++) {
  //   datas.push({
  //     hour: hour[i],
  //     weather: weather[i],
  //     windBlow: windDirection[i],
  //     windSpeed: windSpeed[i]
  //   })
  // }
  // console.log(data)
  return datas
}

/**
 * DBへ登録
 */
async function send(data) {
  return Promise.all([
    firebase.database().ref('weather/today/table').set(data.today),
    firebase.database().ref('weather/tomorrow/table').set(data.tomorrow)
  ])
};
