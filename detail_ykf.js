const client = require('cheerio-httpcli');
const firebase = require("firebase");
const consts = require('./consts.js');
const sendError = require('./slack');

const COMPANY = consts.YKF;
const URL = 'https://www.yaeyama.co.jp/operation.html';
let $;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

module.exports = () => {
  return Promise.resolve()
    .then(() => console.log(`開始 ${COMPANY} 詳細`))
    .then(() => getHtmlContents())
    // .then(() => makeData())
    .then(() => perseAndSend(consts.TAKETOMI))  // 竹富
    // .then(() => perseAndSend(consts.KOHAMA))    // 小浜
    // .then(() => perseAndSend(consts.KUROSHIMA)) // 黒島
    // .then(() => perseAndSend(consts.OOHARA))    // 大原
    // .then(() => perseAndSend(consts.UEHARA))    // 上原
    // .then(() => perseAndSend(consts.HATOMA))    // 鳩間
    // .then(() => perseAndSend(consts.KOHAMA_TAKETOMI)) // 小浜-竹富
    // .then(() => perseAndSend(consts.KOHAMA_OOHARA)) // 小浜-大原
    // .then(() => perseAndSend(consts.UEHARA_HATOMA)) // 上原-鳩間
    // .catch((error) => sendError(error.stack))
    .catch(process.on('unhandledRejection', console.dir))
    .then(() => console.log(`完了 ${COMPANY} 詳細`))
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

// function makeData() {
//   $('#operation_status div.status div').each(function () {

//   });
//   return Promise.resolve();
// }

/**
 * 引数の港をパースしてDBに登録
 * @param {タグ全体} $ 
 */
function perseAndSend(portCode) {
  const selecotr = getSelectorString(portCode);

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
    console.log(idx)
    putHtmlLog($(this));


    const portCode = getPortCode($(this).find('h3').text());
    createTimelineOfPort($(this), portCode);

    // 1列目は不要なのでスキップ
    if (idx < 1) {
      return true;
    } else if (idx == 1) {
      //ヘッダーをとる処理
      timeTable.header.left = $(this).find('td').eq(0).text().trim();
      timeTable.header.right = $(this).find('td').eq(1).text().trim();
      return true;
    }

    // //ボディ部分
    // //<span>○</span>10:00
    // //<span>○</span>10:15   
    const td = $(this).find('td');
    console.log('contents');
console.log(td.eq(0).contents().eq(0).text());
console.log(td.eq(0).contents().eq(1).text());
console.log(td.eq(0).contents().eq(2).text());
console.log(td.eq(0).contents().eq(3).text());
    let row = {
      left: {
        time: td.eq(0).contents().eq(1).text(),
        status: {
          code: getRowStatusCode(td.eq(0).contents().eq(0).text()),
          text: convertRowStatusText(td.eq(0).contents().eq(0).text())
        }
      },
      right: {
        time: td.eq(1).contents().eq(2).text(),
        status: {
          code: getRowStatusCode(td.eq(1).contents().eq(0).text()),
          text: convertRowStatusText(td.eq(1).contents().eq(0).text().trim())
        }
      }
    }
    // console.log(row)
    timeTable.row.push(row);
  });
  console.log(portCode)
  console.log(timeTable)
  return Promise.resolve();
  // Firebaseへ登録
  // return sendToFirebase(portCode, timeTable);
};

function createTimelineOfPort(data, portCode) {
  data.find('tr').each(function (idx) {

    console.log(idx)
    putHtmlLog($(this));
  })
}

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

      return '#operationstatus div.local table';
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
    case '':
      return '';
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

function convertRowStatusText(statusText) {

  switch (statusText) {
    case '○':
      return '通常運行'
    case '〇':
      return '通常運行'
    case '×':
      return '欠航'
    case '':
      return ''
    default:
      return '注意'
  }
}

/**
 * DBへ登録
 */
function sendToFirebase(portCode, sendData) {
  const tableName = `${COMPANY}/${portCode}/timeTable/`;
  return firebase.database()
    .ref(tableName)
    .set(sendData)
};

// 港名から港コードを返す
function getPortCode(portName) {
  // 港id
  if (portName.toString().includes("竹富")) {
    return consts.TAKETOMI;
  } else if (portName.toString().includes("小浜")) {
    return consts.KOHAMA;
  } else if (portName.toString().includes("黒島")) {
    return consts.KUROSHIMA;
  } else if (portName.toString().includes("大原")) {
    return consts.OOHARA;
  } else if (portName.toString().includes("上原")) {
    return consts.UEHARA;
  } else if (portName.toString().includes("鳩間")) {
    return consts.HATOMA;
  } else if (portName.toString().includes("波照間")) {
    return consts.HATERUMA;
  }
}