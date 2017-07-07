const client = require('cheerio-httpcli');
const firebase = require("firebase");
const sendError = require('./slack');

const URL = 'https://tenki.jp/forecast/10/50/9410/47207/3hours.html';
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
  const todayTableTagQuery = 'table#forecast-point-3h-today';
  const tomorrowTableTagQuery = 'table#forecast-point-3h-tomorrow';

  // コンテンツが取得できるか？ページ構成は変わってないか？
  if (!$(todayTableTagQuery).length) {
    // 取得失敗はエラーをなげる
    const errorMessage = 'エラー!! tenki.jpのコンテンツ取得に失敗した、サイト構成が変わったのでtenkijp.jsを確認せよ';
    console.error(errorMessage)
    throw new Error(errorMessage)
  }

  return Promise.all([
    sendData.today = getWeatherData($, todayTableTagQuery),    // 今日
    sendData.tomorrow = getWeatherData($, tomorrowTableTagQuery)  // 明日
  ])
}

/**
 * 指定インデックスからスクレイピング処理
 * @param {cheero.contents} $ htmlコンテンツ
 * @param {number} index 取得先のインデックス
 */
function getWeatherData($, tableTagQuery) {
  const data = [];
  /**
   * #bd-main > div:nth-child(3) > table:nth-child(4)"
   * この↑のselectorの取得方法だと失敗する。
   * 天気タグの真上に「警報・注意報」が表示され、それによってtable:nth-child()の数値が増減する
   * （実装当初は3だったが、後日には4になった）
   * テーブルタグのIDを指定しピンポイントで絞って取得する方法する　2017/07/07
   */
  const element = $(tableTagQuery);
  const windBlowQuery = element.find("tr.wind-direction td").length ? "tr.wind-direction td" : "tr.wind-blow td"
  // console.log(element.find("tr.head td div p").text());  // 日付確認用 消さずに残しておく
  for (i = 1; i < 5; i++) {
    data.push({
      hour: element.find("tr.hour td").eq(i).text().trim(),
      weather:element.find("tr.weather td").eq(i).text().trim(),
      windBlow: element.find(windBlowQuery).eq(i).text().trim(),
      windSpeed: element.find("tr.wind-speed td").eq(i).text().trim()
    })
  }
  return data;
}

/**
 * DBへ登録
 */
function send(data) {
  return Promise.all([
    firebase.database().ref('weather/today/table').set(sendData.today),
    firebase.database().ref('weather/tomorrow/table').set(sendData.tomorrow)
  ])
};
