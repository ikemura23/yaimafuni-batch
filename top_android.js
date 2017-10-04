const firebase = require("firebase");
const consts = require('./consts.js');
const sendError = require('./slack');

const config = require("./config.json");
const NCMB = require("ncmb");
const ncmb = new NCMB(config.ncmb.apiKey, config.ncmb.clientKey);

const TABLE_NAME = 'top_company';

const sendData = {
    company_anei_status_type: '',
    company_ykf_status_type: '',
    company_dream_status_type: ''
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
    // console.log(orig);
    sendData.company_anei_status_type = makeData(orig.anei);
    sendData.company_ykf_status_type = makeData(orig.ykf);
    sendData.company_dream_status_type = makeData(orig.dream);
}

function makeData(params) {
    // console.log(params);

    if (params.cancel > 0) {
        return 'cancel';
    }
    else if (params.suspend > 0) {
        return 'suspend';
    }
    else if (params.cation > 0) {
        return 'other';
    }
    else {
        return 'normal';
    }
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
    const DataStore = ncmb.DataStore("TopInfo");
    const dataStore = new DataStore();

    return dataStore
        .set("company_anei_status_type", sendData.company_anei_status_type)
        .set("company_ykf_status_type", sendData.company_ykf_status_type)
        .set("company_dream_status_type", sendData.company_dream_status_type)
        .save();
}