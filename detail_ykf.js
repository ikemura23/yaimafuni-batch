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

/**
 * HTMLコンテンツを取得してクラス変数に保持
 */
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
  // console.log(portCode);
  const selecotr = '#operationstatus div.local table';
  const targetIndex = getPortIndex(portCode);

  // tableタグをループしてパース
  $(selecotr).each(function (idx) {
    // console.log(idx)
    // putHtmlLog($(this));

    // 港ごとにループ
    if (targetIndex == idx) {
      createTimelineOfPort($(this));
    }

  });
  return Promise.resolve();
};

/**
 * スクレイピングして送信する
 */
function createTimelineOfPort(data) {

  // 港コード
  const portCode = getPortCode(data.find('h3').text());
  // console.log(data.find('h3').text());
  console.log(portCode)
  // 詳細テーブル用の変数
  let timeTable = {
    header: {
      left: '',
      right: ''
    },
    row: []
  };

  // trタグでループ
  data.find('tr').each(function (idx) {
    // console.log(idx)
    // putHtmlLog($(this));

    // 0行名は見出しなのでスキップ
    if (idx == 0) {
      return true;
    }
    else if (idx == 1) {
      //ヘッダーの港名
      timeTable.header.left = $(this).find('td').eq(0).text().trim();
      timeTable.header.right = $(this).find('td').eq(1).text().trim();
      return true;
    }

    // 以下、ボディ処理

    const td = $(this).find('td');

    // 左
    const leftKigou = td.eq(0).contents().eq(0).text().substring(0, 1);
    const leftTime = td.eq(0).contents().eq(0).text().substring(1).trim();

    // 右
    const rightKigou = td.eq(1).contents().eq(0).text().substring(0, 1);
    const righTime = td.eq(1).contents().eq(0).text().substring(1).trim();

    // row変数で組み立てる
    const row = {
      left: {
        time: leftTime,
        status: {
          code: getRowStatusCode(leftKigou),
          text: convertRowStatusText(leftKigou)
        }
      },
      right: {
        time: righTime,
        status: {
          code: getRowStatusCode(rightKigou),
          text: convertRowStatusText(rightKigou)
        }
      }
    }
    // console.log(row)
    // 送信用変数に追加
    timeTable.row.push(row);
  })

  console.log(timeTable)
  // Firebaseへ登録
  return sendToFirebase(portCode, timeTable);
}

/**
 * DBへ登録
 */
function sendToFirebase(portCode, sendData) {

  const tableName = `${COMPANY}/${portCode}/timeTable/`;
  console.log('送信開始' + tableName)
  return firebase.database()
    .ref(tableName)
    .set(sendData, () => {
      console.log('送信完了');
    })
};

/**
 * ログ出力用
 */
function putHtmlLog(value) {
  if (!value.html()) return;
  console.log(value.html().trim().replace(/\t/g, ''));
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

// 指定した港からスクレイピングのインデックスを返す
function getPortIndex(portCode) {
  switch (portCode) {
    case consts.TAKETOMI:
      //竹富
      return 0;
    case consts.KOHAMA:
      //小浜
      return 1
    case consts.KUROSHIMA:
      //黒島
      return 2
    case consts.OOHARA:
      //大原
      return 3
    case consts.UEHARA:
      //上原
      return 4
    case consts.HATOMA:
      //鳩間
      return 5
    case consts.KOHAMA_TAKETOMI:
      //小浜-竹富
      return 6
    case consts.KOHAMA_OOHARA:
      //小浜-大原
      return 7
    case consts.UEHARA_HATOMA:
      //上原-鳩間
      return 8
    default:
      return 0
  }
}