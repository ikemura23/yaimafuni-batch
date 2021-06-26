const puppeteer = require('puppeteer')
const url = 'https://tenki.jp/lite/bousai/typhoon/'
const firebase = require("firebase");
const sendError = require('../slack');
// Heroku環境かどうかの判断
const LAUNCH_OPTION = process.env.DYNO ? { args: ['--no-sandbox', '--disable-setuid-sandbox'] } : { headless: true };

module.exports = (async () => {
  console.group('開始 : 台風 tenkijp');
  const browser = await puppeteer.launch(LAUNCH_OPTION)
  try {
    const page = await browser.newPage()
    await page.goto(url, { waitUntil: 'domcontentloaded' }) // ページへ移動＋表示されるまで待機

    const sendData = await getSection(page)

    await send(sendData)
  } catch (err) {
    console.log('異常 : 台風 tenkijp');
    console.error(err)
    sendError(err.stack, "台風:tenkijpのスクレイピングでエラー発生!")
    
  }
  finally {
    browser.close()
    console.groupEnd()
    console.log('完了 : 台風 tenkijp');
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
  // 最初と最後は台風データではないので除外する
  const nodes = await asyncFilter(beforeNodes, async (node) => {
    const title = await node.$eval('h3', nd => nd.innerText)
    return title.startsWith("台風"); // h3タグが 台風 から始まってるnodeのみに絞る
  });

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
    console.log(data)
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

/**
 * filterでawaitを使える関数
 * 参考： https://advancedweb.hu/how-to-use-async-functions-with-array-filter-in-javascript/
 * 
 * @param arr filter対象配列
 * @param predicate 判定関数
 * @returns フィルターされた配列
 */
const asyncFilter = async (arr, predicate) => {
	const results = await Promise.all(arr.map(predicate));

	return arr.filter((_v, index) => results[index]);
}