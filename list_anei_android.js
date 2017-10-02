const client = require('cheerio-httpcli');
const firebase = require("firebase");
const consts = require('./consts.js');
const sendError = require('./slack');

const COMPANY = consts.ANEI;
const TABLE_NAME = COMPANY;
// client.debug = true; // cheerio-httpcliのデバッグ出力切り替え

const sendData = {
    mCompany: 'ANEI',
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
        .then(() => console.log(orig))
        .then(() => makeAllData())
        .then(() => send())
        // .catch((error) => sendError(error.stack))
        .catch(process.on('unhandledRejection', console.dir))
        .then(() => console.log(`完了 ${COMPANY} android`))
}

function makeAllData() {
    if (!orig) return;
    sendData.mTitle = orig.comment;
    sendData.mUpdateTime = '';

    sendData['hatoma'] = makeData(orig.hatoma);
    sendData['kohama'] = makeData(orig.kohama);
    sendData['kuroshima'] = makeData(orig.kuroshima);
    sendData['oohara'] = makeData(orig.oohara);
    sendData['taketomi'] = makeData(orig.taketomi);
    sendData['uehara'] = makeData(orig.uehara);
    sendData['hateruma'] = makeData(orig.hateruma);
}

function makeData(origData) {
    console.log(origData)
    return {
        port: origData.portCode.toUpperCase(),
        status: origData.status.code.toUpperCase(),
        text: origData.status.text + ' ' + origData.comment,
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
 */
function send() {
    console.log(sendData);
}