const client = require('cheerio-httpcli');
const firebase = require("firebase");
const sendError = require('../slack');
client.setBrowser('chrome');
const URL = 'http://weather.yahoo.co.jp/weather/jp/47/9410.html';
const TABLE = "weather";
const sendData = { today: '', tomorrow: '' };

function run() {
  console.log('開始 天気');
  return new Promise(function(resolve) {
    client.fetch(URL)
      .then(function(result) {
        return perseAndSend(result.$);
      })
      .then(sendData => saveToFirebase(sendData))
      .catch((error) => sendError(error))
      .finally(function() {
        console.log('完了 天気');
        resolve();
      })
  })
}

/**
 * 引数の港をパースしてDBに登録
 * @param {タグ全体} $ 
 */
function perseAndSend($) {
  return new Promise((resolve) => {

    $("div.forecastCity > table > tr > td").each(function(idx) {
      let value = {
        date: $(this).find("p.date").text(), //日付
        weather: $(this).find("p.pict").text(), //天気
        temperature: {
          hight: $(this).find("ul > li.high").text(), //最高 気温
          low: $(this).find("ul > li.low").text() //最高 気温
        },
        wind: $(this).find("dl > dd:nth-child(2)").text(), //風
        wave: $(this).find("dl > dd:nth-child(4)").text() //波
      };
      if (idx == 0) {
        // 今日
        sendData.today = value;
      } else {
        // 明日
        sendData.tomorrow = value;
      }
    });

    resolve(sendData);
  })
};

function putHtmlLog(value) {
  if (!value.html()) return;
  console.log(value.html().trim().replace(/\t/g, ''));
}

/**
 * DBへ登録
 */
function saveToFirebase(sendData) {
  // console.log('DB登録開始 ' + TABLE);
  // console.log(sendData);
  return firebase.database()
    .ref(TABLE)
    .set(sendData, function() {
      // console.log('DB登録完了 ' + TABLE);
    })
};

module.exports = run;