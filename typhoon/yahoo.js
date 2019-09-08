const puppeteer = require('puppeteer')
const url = 'https://typhoon.yahoo.co.jp/weather/typhoon/'
const firebase = require("firebase");
const sendError = require('../slack');
// Heroku環境かどうかの判断
const LAUNCH_OPTION = process.env.DYNO ? { args: ['--no-sandbox', '--disable-setuid-sandbox'] } : { headless: true };

// 選択するパターン
const devices = require('puppeteer/DeviceDescriptors');

module.exports = (async () => {
  console.log('開始 台風 yahoo');
  try {
    const browser = await puppeteer.launch(LAUNCH_OPTION)
    const page = await browser.newPage()  
    await page.emulate(devices['iPhone X']);
    await page.goto(url, { waitUntil: 'networkidle2' }) // ページへ移動＋表示されるまで待機

    const sendData = await getSendData(page)

    await send(sendData)
    console.log('終了 台風 yahoo');
    browser.close()
  } catch (err) {
    console.error(err)
    sendError(err.stack, "台風:tenkijpのスクレイピングでエラー発生!")
    browser.close()
  }
})

/**
 * 台風のセクションを取得、1番目は気象予報士の見解なので、スキップ
 * ２番めから台風情報なので、２番め以降をとる
 * 
 * @param {Page} page 
 */
async function getSendData(page) {
  const datas = await getData(page, "#content > section > section > section > section")
  return datas
}

/**
 * スクレイピング処理
 */
async function getData(page, itemSelector) {
  const nodes = await page.$$(itemSelector)
  console.log(nodes.length)
  // 最初と最後は不要データなので除外する [ '気象予報士の見解（日直予報士：台風関連記事）', '台風13号(レンレン)', '台風14号(カジキ)', '台風を知る' ]
  // const nodes = beforeNodes.filter((_, i) => i != 0 && i != beforeNodes.length-1)

  const datas = []
  for (const node of nodes) {
    // const data = await node.$eval(nd => nd.innerHtml)
    // const data = await page.evaluate(el => el.innerHTML, node);
    const data = {
      no : await node.$eval('h4', nd => nd.innerText), //台風13号
      description : await node.$eval('.textLarge', nd => nd.innerText),
      name: await node.$eval('div.typhoonDetail > table > tbody > tr:nth-child(1) > td', nd => nd.innerText),
      scale : await node.$eval('div.typhoonDetail > table > tbody > tr:nth-child(2) > td', nd => nd.innerText),
      intensity : await node.$eval('div.typhoonDetail > table > tbody > tr:nth-child(3) > td', nd => nd.innerText), //強さ(強い、非常に強いなど)
      area : await node.$eval('div.typhoonDetail > table > tbody > tr:nth-child(4) > td', nd => nd.innerText),
      direction : await node.$eval('div.typhoonDetail > table > tbody > tr:nth-child(6) > td', nd => nd.innerText),
      speedOfMovement : await node.$eval('div.typhoonDetail > table > tbody > tr:nth-child(7) > td', nd => nd.innerText),
      pressure : await node.$eval('div.typhoonDetail > table > tbody > tr:nth-child(8) > td', nd => nd.innerText),
      maxWindSpeedNearCenter : await node.$eval('div.typhoonDetail > table > tbody > tr:nth-child(9) > td', nd => nd.innerText), //最大風速
      maxWindGuestSpeed : await node.$eval('div.typhoonDetail > table > tbody > tr:nth-child(10) > td', nd => nd.innerText), //最大瞬間風速
    }
    datas.push(data)
  }
  console.log(datas)
  return datas
}

/**
 * DBへ登録
 */
async function send(data) {
  console.log(data)
  return firebase.database().ref('weather/typhoon_yahoo').set(data)
}
