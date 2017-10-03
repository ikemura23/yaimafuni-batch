const client = require('cheerio-httpcli');
const firebase = require("firebase");
const consts = require('./consts.js');
const sendError = require('./slack');

const config = require("./config.json");
const NCMB = require("ncmb");
const ncmb = new NCMB(config.ncmb.apiKey, config.ncmb.clientKey);

const COMPANY = consts.YKF;
const TABLE_NAME = COMPANY;
// client.debug = true; // cheerio-httpcliのデバッグ出力切り替え

const sendData = {
    mCompany: 'YKF',
    mLiners: [],
    mTitle: '',
    mUpdateTime: ''
}
let orig = {};
/**
 * メイン処理
 */
module.exports = () => {
    return Promise.resolve()
        .then(() => console.log(`開始 ${COMPANY} android`))
        .then(() => getListData())
        // .then(() => console.log(orig))
        .then(() => makeAllData())
        .then(() => send())
        // .catch((error) => sendError(error.stack))
        .catch(process.on('unhandledRejection', console.dir))
        .then(() => console.log(`完了 ${COMPANY} android`))
}

function makeAllData() {
    if (!orig) return;
    sendData.mTitle = orig.comment;
    sendData.mUpdateTime = orig.updateTime;
    sendData.mLiners.push(makeData(orig.taketomi));
    sendData.mLiners.push(makeData(orig.kohama));
    sendData.mLiners.push(makeData(orig.kuroshima));
    sendData.mLiners.push(makeData(orig.oohara));
    sendData.mLiners.push(makeData(orig.uehara));
    sendData.mLiners.push(makeData(orig.hatoma));
}

function makeData(origData) {
    // console.log(origData)
    return {
        port: origData.portCode.toUpperCase(),
        status: origData.status.code.toUpperCase(),
        text: (origData.status.text + ' ' + origData.comment).trim(),
    }
}

function getListData() {
    return firebase.database()
        .ref(COMPANY)
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
    const AneiClass = ncmb.DataStore("YkfLinersTest");
    const anei = new AneiClass();

    return anei
        .set("result_json", sendData)
        .save();
}