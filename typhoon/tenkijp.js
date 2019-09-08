const puppeteer = require('puppeteer')
const url = 'https://tenki.jp/lite/bousai/typhoon/'
const firebase = require("firebase");
const sendError = require('../slack');
// Heroku環境かどうかの判断
const LAUNCH_OPTION = process.env.DYNO ? { args: ['--no-sandbox', '--disable-setuid-sandbox'] } : { headless: true };

module.exports = (async () => {
  console.log('開始 : 台風 tenkijp');
  try {
    const browser = await puppeteer.launch(LAUNCH_OPTION)
    const page = await browser.newPage()
    await page.goto(url, { waitUntil: 'domcontentloaded' }) // ページへ移動＋表示されるまで待機

    const sendData = await getSection(page)

    await send(sendData)

    browser.close()
    console.log('完了 : 台風 tenkijp');
  } catch (err) {
    console.log('異常 : 台風 tenkijp');
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
async function getSection(page) {
  const datas = await getData(page, "body > section > section.section-wrap")
  return datas
}

/**
 * スクレイピング処理
 */
async function getData(page, itemSelector) {
  const beforeNodes = await page.$$(itemSelector)
  // 最初と最後は不要データなので除外する [ '気象予報士の見解（日直予報士：台風関連記事）', '台風13号(レンレン)', '台風14号(カジキ)', '台風を知る' ]
  const nodes = beforeNodes.filter((_, i) => i != 0 && i != beforeNodes.length-1)
  const datas = []
  for (const node of nodes) {
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
    // console.log(data)
    datas.push(data)
  }
  return datas
}

/**
 * DBへ登録
 */
async function send(data) {
  // console.log(data)
  return firebase.database().ref('typhoon/tenkijp').set(data)
}
