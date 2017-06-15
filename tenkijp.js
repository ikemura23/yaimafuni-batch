const client = require('cheerio-httpcli');
const firebase = require("firebase");
const sendError = require('./slack');

const URL = 'http://www.tenki.jp/forecast/10/50/9410/47207.html';
const sendData = { today: [], tomorrow: [] };

module.exports = () => {
  console.log('開始 天気詳細');
  return Promise.resolve()
    .then(() => getHtmlContents())
    .then($ => parseContents($))
    // .then(() => console.log(sendData))
    .then(() => send())
    .catch((error) => sendError(error.stack))
    .then(() => console.log('完了 天気詳細'))
}

function getHtmlContents() {
  return client.fetch(URL)
    .then(function (result) {
      return result.$;
    })
}

function parseContents($) {
  if (!$("table.leisurePinpointWeather").length) {
    const errorMessage = 'エラー!! tenki.jpのコンテンツ取得に失敗した、サイト構成が変わったのでtenkijp.jsを確認せよ';
    console.error(errorMessage)
    throw new Error(errorMessage)
  }
  return Promise.all([
    sendData.today = getWeatherData($, 0),    // 今日
    sendData.tomorrow = getWeatherData($, 1)  // 明日
  ])
}

/**
 * 指定インデックスからスクレイピング処理
 * @param {cheero.contents} $ htmlコンテンツ
 * @param {number} index 取得先のインデックス
 */
function getWeatherData($, index) {
  const data = [];
  /**
   * #bd-main > div:nth-child(3) > table:nth-child(4)"
   * この↑のselectorの取得方法だと失敗する。
   * 天気タグの真上に「警報・注意報」が表示され、それによってtable:nth-child()の数値が増減する
   * （実装当初は3だったが、後日には4になった）
   * クラス名をピンポイントで絞って取得する方法に切り替える 2017/06/13
   */
  const element = $("table.leisurePinpointWeather").eq(index);
  // console.log(element.find("thead p").text());  // 日付確認用 消さずに残しておく
  for (i = 1; i < 5; i++) {
    data.push({
      hour: element.find("tr.hour td").eq(i).text().trim(),
      weather:element.find("tr.weather td").eq(i).text().trim(),
      windBlow: element.find("tr.windBlow td").eq(i).text().trim(),
      windSpeed: element.find("tr.windSpeed td").eq(i).text().trim()
    })
  }
  return data;
}

// function getWeatherData($, index) {
//   hour = 0;
//   data = [];
//   for (var i = 3; i < 8; i++) {
//     data.push({
//       hour: $(`#bd-main > div:nth-child(3) > table:nth-child(${index}) > tbody > tr.hour > td:nth-child(${i-1}) > span`).text().trim(),
//       weather: $(`#bd-main > div:nth-child(3) > table:nth-child(${index}) > tbody > tr.weather > td:nth-child(${i}) > p`).text().trim(),
//       windBlow: $(`#bd-main > div:nth-child(3) > table:nth-child(${index}) > tbody > tr.windBlow > td:nth-child(${i}) > p`).text().trim(),
//       windSpeed: $(`#bd-main > div:nth-child(3) > table:nth-child(${index}) > tbody > tr.windSpeed > td:nth-child(${i}) > span`).text().trim()
//     })
//   }
//   return data;
// }

/**
 * DBへ登録
 */
function send(data) {
  return Promise.all([
    firebase.database().ref('weather/today/table').set(sendData.today),
    firebase.database().ref('weather/tomorrow/table').set(sendData.tomorrow)
  ])
};
