const client = require('cheerio-httpcli');
const firebase = require("firebase");
const PORT = require('./consts.js');
const sendError = require('./slack');

const COMPANY = 'ykf';
const TABLE = COMPANY + '/';
const URL = 'http://www.yaeyama.co.jp/';

let $;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const sendData = {
  comment: '',
  updateTime: '',
  ports: []
}

function log(val) {
  console.log(val);
}

// client.debug = true; // cheerio-httpcliのデバッグ出力切り替え
module.exports = () => {
  return Promise.resolve()
    .then(() => console.log(`開始: ${COMPANY} 一覧`))
    .then(() => getHtmlContents())
    .then(() => getUpdateDate())
    .then(() => getStatusList())
    .then(() => sendToServer())
    .then(() => console.log(`完了: ${COMPANY} 一覧`))
    .catch(process.on('unhandledRejection', console.dir))
}

/**
 * HTMLを取得
 */
function getHtmlContents() {
  return client.fetch(URL)
    .then(function (result) {
      return new Promise(function (resolve) {
        $ = result.$;
        // console.log($.html())
        resolve();
      })
    })
}

/**
 * 更新日を取得
 */
function getUpdateDate() {
  sendData.updateTime = $('#operation_status').contents().eq(0).text().trim();
  log(sendData.updateTime);
  return new Promise(function (resolve) {
    resolve();
  })
}

/**
 * 一覧ステータスの取得
 */
function getStatusList() {
  // console.log($('#operation_status div.status div').text())
  return new Promise(function (resolve) {
    $('#operation_status div.status div').each(function () {
      const portName = $(this).contents().eq(0).text().trim();  // 港名(竹富, 西表大原, 小浜-竹富 ...)
      const portCode = getPortCode(portName); // 港コード (taketomi, kohama ...)
      const origStatus = $(this).contents().eq(2).text().trim();  // ステータス文字  〇 ×
      const status = getStatusCode(origStatus); // ステータスコード (normal, cancel ...)
      
      if (portCode == undefined) return;

      console.log(`${portName} ${portCode} ${origStatus} ${status.code} ${status.text}`)

      const port = {
        portCode: portCode,
        portName: portName,
        comment: '',
        status: {
          code: status.code,
          text: status.text
        }
      }
      sendData[portCode] = port;
    })
    resolve();
  })
}

/**
 * サーバーへ送信
 */
function sendToServer() {
  console.log('DB登録開始' + ':' + sendData);
  return firebase.database().ref(TABLE).update(sendData, function () {
    console.log('DB登録完了');
  })
}

// function run() {
//   console.log('開始:' + COMPANY + ' 一覧');
//   return new Promise(function (resolve) {
//     client.fetch(URL)
//       .then(function (result) {
//         const $ = result.$;
//         if (!$) return null;

//         const sendData = {
//           comment: '',
//           updateTime: $('div.unkou_time_top').html().trim(), // 更新日時
//           ports: []
//         }

//         // 港別に取得してパース処理
//         $('#unkou_bg_top > div.unkou_joukyou > div').each(function () {

//           // 港名
//           let portName = $(this).find('div').eq(0).text();

//           // 港コード
//           let portCode = getPortCode(portName);

//           // ステータス取得
//           const unkou_item_display_txt = $(this).find('div.unkou_item_display_in > div.unkou_item_display_txt');
//           const kigou = unkou_item_display_txt.find('span').eq(0).text().trim(); // ○ , △ , ×
//           const statusText = unkou_item_display_txt.text().replace(kigou, '').trim(); // ○通常運行 -> 通常運行
//           const bikou = $(this).find('div.no_disp.unkou_item_display_bikou').text().trim(); //備考 あったりなかったりする
//           const statusCode = getStatusCode(kigou);

//           // 運行情報を作成
//           const port = {
//             portCode: portCode,
//             portName: portName,
//             comment: bikou,
//             status: {
//               code: statusCode,
//               text: statusText
//             }
//           }
//           // sendData.ports.push(port);
//           sendData[portCode] = port;
//           //   console.log(portName + ' 完了');
//         });
//         return sendData;
//       })
//       .then(function (data) {
//         if (!data) return;
//         // console.log('DB登録開始' + ':' + COMPANY);
//         return firebase.database().ref(TABLE).update(data, function () {
//           // console.log('DB登録完了' + ':' + COMPANY);
//         })
//       })
//       .catch((error) => sendError(error.stack))
//       .finally(function () {
//         console.log('完了' + ':' + COMPANY + ' 一覧');
//         resolve()
//       });
//   });
// }

// 港名から港コードを返す
function getPortCode(portName) {
  // 港id
  if (portName === "竹富") {
    return PORT.TAKETOMI;
  } else if (portName === "小浜") {
    return PORT.KOHAMA;
  } else if (portName === "小浜-竹富") {
    return PORT.KOHAMA_TAKETOMI;
  } else if (portName === "黒島") {
    return PORT.KUROSHIMA;
  } else if (portName === "小浜-大原") {
    return PORT.KOHAMA_OOHARA;
  } else if (portName === "西表大原") {
    return PORT.OOHARA;
  } else if (portName === "西表上原") {
    return PORT.UEHARA;
  } else if (portName === "上原-鳩間") {
    return PORT.UEHARA_HATOMA;
  } else if (portName === "鳩間") {
    return PORT.HATOMA;
  }
}

// 記号から運行ステータスを判別
function getStatusCode(kigou) {
  const statu = {
    code: '', 　text: ''
  }
  if (kigou == '△') {
    statu.code = "cation";
    statu.text = "注意";
  } else if (kigou == '×') {
    statu.code = "cancel";
    statu.text = "欠航";
  } else if (kigou == '〇') {
    statu.code = "normal";
    statu.text = "運行";
  } else {
    statu.code = "cation";
    statu.text = "注意";
  }
  return statu;
}