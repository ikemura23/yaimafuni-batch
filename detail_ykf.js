const client = require('cheerio-httpcli');
const firebase = require("firebase");
const consts = require('./consts.js');
const sendError = require('./slack');

const COMPANY = consts.YKF;
const URL = 'http://www.yaeyama.co.jp/situation.php';
const TABLE = COMPANY + '/detail/';
let $;
const ports = new Map();

module.exports = () => {
  console.log('開始:' + COMPANY + '-詳細');
  return Promise.resolve()
    .then(() => getStatusFromFirebase())
    .then(() => getHtmlContents())
    .then(() => perseAndSend(consts.TAKETOMI))  // 竹富
    .then(() => perseAndSend(consts.KOHAMA))    // 小浜
    .then(() => perseAndSend(consts.KUROSHIMA)) // 黒島
    .then(() => perseAndSend(consts.OOHARA))    // 大原
    .then(() => perseAndSend(consts.UEHARA))    // 上原
    .then(() => perseAndSend(consts.HATOMA))    // 鳩間
    // .then(() => perseAndSend(consts.KOHAMA_TAKETOMI)) // 小浜-竹富
    // .then(() => perseAndSend(consts.KOHAMA_OOHARA)) // 小浜-大原
    // .then(() => perseAndSend(consts.UEHARA_HATOMA)) // 上原-鳩間
    .catch((error) => sendError(error.stack))
    // .then(() => console.log('完了:' + COMPANY + '-詳細'))
    // .catch((error) => console.log(error))
}

function getHtmlContents() {
  return client.fetch(URL)
    .then(function (result) {
      return new Promise(function (resolve) {
        $ = result.$;
        resolve();
      })
    })
}

/**
 * 引数の港をパースしてDBに登録
 * @param {タグ全体} $ 
 */
function perseAndSend(portCode) {
  // console.log('スクレイピング開始 ' + portCode);
  const selecotr = getSelectorString(portCode);
  // putHtmlLog(selecotr).find('td');

  const portStatus = getPortStatus(portCode);
  const detailData = {
    portName: portStatus.portName,
    portCode: portCode,
    comment: portStatus.comment,
    status: portStatus.status,
    timeTable: {}
  }

  // 詳細テーブル用の変数
  let timeTable = {
    header: {
      left: '',
      right: ''
    },
    row: []
  };

  // tableタグをループしてパース
  $(selecotr).each(function (idx) {
    // console.log(idx);
    // 2列目以下は不要なのでスキップ
    if (idx < 2) {
      return true;
    } else if (idx == 2) {
      //ヘッダーをとる処理
      timeTable.header.left = $(this).find('td').eq(0).text().trim();
      timeTable.header.right = $(this).find('td').eq(1).text().trim();
      return true;
    }

    //ボディ部分
    //<span>○</span>10:00
    //<span>○</span>10:15
    const td = $(this).find('td');

    let row = {
      left: {
        time: td.eq(0).contents().eq(2).text(),
        status: {
          code: getRowStatusCode(td.eq(0).contents().eq(1).text()),
          text: td.eq(0).contents().eq(1).text()
        }
      },
      right: {
        time: td.eq(1).contents().eq(2).text(),
        status: {
          code: getRowStatusCode(td.eq(1).contents().eq(1).text()),
          text: td.eq(1).contents().eq(1).text().trim()
        }
      }
    }
    timeTable.row.push(row);
  });
  detailData.timeTable = timeTable;

  // console.log('スクレイピング完了 ' + portCode);

  // Firebaseへ登録
  return saveToFirebase(portCode, detailData);
};

function putHtmlLog(value) {
  if (!value.html()) return;
  console.log(value.html().trim().replace(/\t/g, ''));
}

/**
 * 指定した航路のSelectorを返す
 * @param {航路名} route 
 */
function getSelectorString(route) {
  switch (route) {
    case consts.TAKETOMI:
      return '#unkou_id1 table tbody tr';
    case consts.KOHAMA:
      return '#unkou_id2 > table > tbody > tr';
    case consts.KOHAMA_TAKETOMI:
      return '#unkou_id3 > table > tbody > tr';
    case consts.KUROSHIMA:
      return '#unkou_id4 > table > tbody > tr';
    case consts.KOHAMA_OOHARA:
      return '#unkou_id5 > table > tbody > tr';
    case consts.OOHARA:
      return '#unkou_id6 > table > tbody > tr';
    case consts.UEHARA:
      return '#unkou_id7 > table > tbody > tr';
    case consts.HATOMA:
      return '#unkou_id8 > table > tbody > tr';
    case consts.UEHARA_HATOMA:
      return '#unkou_id9 > table > tbody > tr';
    default:
      return '';
  }
}

/**
 * タグからステータスコードを判別して返す
 * @param {時刻表のStatusタグ} statusTag 
 */
function getRowStatusCode(statusRawText) {

  switch (statusRawText) {
    case '△':
      return consts.CATION;
    case '×':
      return consts.CANCEL;
    case '○':
      return consts.NORMAL;
    default:
      return consts.CATION;
  }
}
/**
 * タグのcssクラス名からステータスコードを取得
 * @param {港単体タグ} arrea 
 */
function getStatusCode(arreaTag) {
  if (arreaTag.find('span').eq(1).hasClass("flag triangle")) {
    return consts.CATION;
  } else if (arreaTag.find('span').eq(1).hasClass("flag out")) {
    return consts.CANCEL;
  } else if (arreaTag.find('span').eq(1).hasClass("flag circle")) {
    return consts.NORMAL;
  } else {
    return consts.CATION;
  }
}

/**
 * DBへ登録
 */
function saveToFirebase(portCode, sendData) {
  const tableName = TABLE + portCode;
  // console.log('DB登録開始 ' + tableName);
  // console.log(sendData);
  return new Promise(function (resolve, reject) {
    firebase.database()
      .ref(tableName)
      .set(sendData, function () {
        // console.log('DB登録完了 ' + tableName);
        resolve();
      })
  });
};

/**
 * 一覧のステータスを取得して変数に格納しておく
 */
function getStatusFromFirebase() {
  return firebase.database()
    .ref('ykf/list/ports')
    .once('value')
    .then(function (snapshot) {
      snapshot.val().forEach(function (e) {
        ports.set(e.portCode, e);
      });
    })
}

/**
 * ports変数から引数の港の運行ステータスを取得する
 */
function getPortStatus(targetPortCode) {
  let portStatus;
  ports.forEach(function (val, key) {
    if (val.portCode == targetPortCode) {
      portStatus = val;
      return false;
    }
  })
  return portStatus;
}