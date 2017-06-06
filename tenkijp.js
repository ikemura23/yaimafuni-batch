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
    .then(() => send())
    // .catch((error) => sendError(error.stack))
    .then(() => console.log('完了 天気詳細'))
    .catch((e) => console.log(e.stack))
}

function getHtmlContents() {
  return client.fetch(URL)
    .then(function (result) {
      return result.$;
    })
}

function parseContents($) {
  if (!$("#bd-main > div:nth-child(3) > table:nth-child(3) > tbody").length) {
    throw 'エラー、天気jpのページ構成が変わってるかも'
  }
  return Promise.all([
    sendData.today = getWeatherData($, 3),
    sendData.tomorrow = getWeatherData($, 4)
  ])
}

function getWeatherData($, index) {
  hour = 0;
  data = [];
  for (var i = 3; i < 8; i++) {
    data.push({
      hour: $(`#bd-main > div:nth-child(3) > table:nth-child(${index}) > tbody > tr.hour > td:nth-child(${i-1}) > span`).text().trim(),
      weather: $(`#bd-main > div:nth-child(3) > table:nth-child(${index}) > tbody > tr.weather > td:nth-child(${i}) > p`).text().trim(),
      windBlow: $(`#bd-main > div:nth-child(3) > table:nth-child(${index}) > tbody > tr.windBlow > td:nth-child(${i}) > p`).text().trim(),
      windSpeed: $(`#bd-main > div:nth-child(3) > table:nth-child(${index}) > tbody > tr.windSpeed > td:nth-child(${i}) > span`).text().trim()
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
