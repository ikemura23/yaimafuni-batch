const client = require('cheerio-httpcli');
const firebase = require("firebase");

const URL = 'http://weather.yahoo.co.jp/weather/jp/47/9410.html';
const TABLE = "weather";
const sendData = { today: '', tomorrow: '' };

console.log('開始 天気');
client.fetch(URL)
  .then(function(result) {
    return perseAndSend(result.$);
  })
  .catch(function(error) {
    console.log('Error');
    console.log(error);
  })
  .finally(function() {
    console.log('完了 天気');
    firebase.database().goOffline(); //プロセスが終わらない対策
  })

/**
 * 引数の港をパースしてDBに登録
 * @param {タグ全体} $ 
 */
function perseAndSend($) {
  console.log('スクレイピング 開始');
  $("div.forecastCity > table > tr > td").each(function(idx) {
    // putHtmlLog($(this));
    let value = {
      date: $(this).find("p.date").text(), //日付
      temp: {
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
    // console.log(value);
  });
  console.log('スクレイピング 完了');

  // Firebaseへ登録
  return saveToFirebase(sendData);
};

function putHtmlLog(value) {
  if (!value.html()) return;
  console.log(value.html().trim().replace(/\t/g, ''));
}

/**
 * DBへ登録
 */
function saveToFirebase(sendData) {
  console.log('DB登録開始 ' + TABLE);
  // console.log(sendData);
  return new Promise(function(resolve, reject) {
    firebase.database()
      .ref(TABLE)
      .set(sendData, function() {
        console.log('DB登録完了 ' + TABLE);
        resolve();
      })
  });
};