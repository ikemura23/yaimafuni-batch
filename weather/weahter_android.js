const firebase = require("firebase");
// const sendError = require('../slack');

const config = require("../config/config.js");
const NCMB = require("ncmb");
const ncmb = new NCMB(config.ncmb.apiKey, config.ncmb.clientKey);

const TABLE_NAME = 'weather';

const sendData = {
  date: '',
  wave: '',
  temperature: '',
  weather: '',
  wind: ''
}
let orig = {};
/**
 * メイン処理
 */
module.exports = () => {
  return Promise.resolve()
    .then(() => console.log(`開始 ${TABLE_NAME} android`))
    .then(() => getFirebaseData())
    // .then(() => console.log(orig))
    .then(() => makeSendData())
    .then(() => send())
    // .catch((error) => sendError(error.stack))
    .catch(process.on('unhandledRejection', console.dir))
    .then(() => console.log(`完了 ${TABLE_NAME} android`))
}

function makeSendData() {
  if (!orig) return;
  sendData.date = orig.today.date;
  sendData.wave = orig.today.wave;
  sendData.weather = orig.today.weather;
  sendData.wind = orig.today.wind;
}

function getFirebaseData() {
  return firebase.database()
    .ref(TABLE_NAME)
    .once('value')
    .then(function (snapshot) {
      orig = snapshot.val();
      return Promise.resolve();
    });
}

/**
 * firebaseへ送信
 * 
 * NCMB:オブジェクトの保存
 * http://mb.cloud.nifty.com/doc/current/datastore/basic_usage_javascript.html#オブジェクトの保存
 */
function send() {
  console.log(sendData);
  const DataStore = ncmb.DataStore("Weather");
  const dataStore = new DataStore();

  return dataStore
    .set("weather", sendData)
    .save();
}