const client = require('cheerio-httpcli');
const firebase = require("firebase");
const config = require("./config.json");
const firebaseConfig = {
  databaseURL: config.firebase.databaseURL
};
firebase.initializeApp(firebaseConfig);
const consts = require('./consts.js');
const sendError = require('./slack');

const COMPANY = 'anei';
const TABLE = COMPANY + '/detail';
const URL = 'http://www.aneikankou.co.jp';
const sendData = new Map();
let ports = new Map();
run()
function run() {
  console.log('開始:' + COMPANY + '-詳細');

  // return client.fetch(URL)
  //   .then(function(result) {
  //     return new Promise(function(resolve, reject) {
  //       resolve(result.$);
  //     })
  //   })

  Promise.resolve()
    .then(() => getStatusFromFirebase())
    .then(() => getHtmlContents())
    .then(($) => setDetailData($))    
    .then(function() {
      return sendFirebase(consts.TAKETOMI);
    })
    .then(function() {
      return sendFirebase(consts.KOHAMA);
    })
    .then(function() {
      return sendFirebase(consts.KUROSHIMA);
    })
    .then(function() {
      return sendFirebase(consts.OOHARA);
    })
    .then(function() {
      return sendFirebase(consts.UEHARA);
    })
    .then(function() {
      return sendFirebase(consts.HATOMA);
    })
    .then(function() {
      return sendFirebase(consts.HATERUMA);
    })
    // .catch((error) => sendError(error.stack))
    .then(function() {
      console.log('完了:' + COMPANY + '-詳細');
        firebase.database().goOffline(); //プロセスが終わらない対策
    })
}

/**
 * HTMLコンテンツを取得
 */
function getHtmlContents() {
  return client.fetch(URL)
    .then(function (result) {
      return new Promise(function (resolve) {
        resolve(result.$);
      })
    })
}

/**
 * HTMLから詳細データを作成
 * @param {HTMLコンテンツ} $ 
 */
function setDetailData($) {

  $('#situation div ul.route li').each(function (idx) {
    var arreaTag = $(this).find('div').eq(0);

    // 港名
    var portName = arreaTag.find('span.name').text();
    // console.log(port_name);

    // 港id
    var portCode = getPortCode(portName);
    // console.log(port_code);

    // // ステータス名
    // var statusText = arreaTag.find('span').eq(1).text();
    // // console.log(status_text);

    // // クラス名
    // var statusCode = getStatusCode(arreaTag);
    // // console.log(tag_status_span);

    // // チップス
    // var chips = $(this).find('div').eq(1);
    // // 港別コメント
    // var comment = chips.find("div").find("p").text().trim();

    // 詳細ステータスは自分で作らず、firebaseの一覧から取得して作成する
    const portStatus = getPortStatus(portCode);
    const detailData = {
      portName: portName,
      portCode: portCode,
      comment: portStatus.comment,
      status: portStatus.status,
      timeTable: null
    }

    // 詳細テーブル用の変数
    let timeTable = {
      header: {
        left: '',
        right: ''
      },
      row: []
    };

    $(this).find('table > tr').each(function (idx) {

      if ($(this).has('th').text().length > 0) {
        //ヘッダー
        //<tr><th colspan="2">石垣発</th><th colspan="2">小浜発</th></tr>
        // console.log('ヘッダー');

        timeTable.header.left = $(this).find('th').eq(0).text().trim();
        timeTable.header.right = $(this).find('th').eq(1).text().trim();
      } else {
        // 時間別ステータス 
        // <tr><td class="time">08：15</td><td class="check circle">通常運航</td><td class="time">-</td><td class="check ">-</td></tr>
        // console.log('ボディ');

        let row = {
          left: {
            time: $(this).find('td').eq(0).text().trim(),
            status: {
              code: getRowStatusCode($(this).find('td').eq(1)),
              text: $(this).find('td').eq(1).text().trim()
            }
          },
          right: {
            time: $(this).find('td').eq(2).text().trim(),
            status: {
              code: getRowStatusCode($(this).find('td').eq(3)),
              text: $(this).find('td').eq(3).text().trim()
            }
          }
        }
        timeTable.row.push(row);
      }
      detailData.timeTable = timeTable;
      // putHtmlLog($(this));
    });

    sendData.set(portCode, detailData);
  });
  // console.log(sendData);
    console.log('スクレイピング完了');
  return new Promise(function (resolve) {
    resolve()
  })
};

function getPortStatus(targetPortCode) {
  let portStatus;
  ports.forEach(function(val, key) {
    if (val.portCode == targetPortCode) {
      portStatus = val;
      return false;
    }
  })
  // console.log(targetPortData)
  return portStatus;
}

function putHtmlLog(value) {
  console.log(value.html().trim().replace(/\t/g, ''));
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

/**
 * タグからステータスコードを判別して返す
 * @param {時刻表のStatusタグ} statusTag 
 */
function getRowStatusCode(statusTag) {
  // ステータスが「-」の場合は空白を返す
  if (statusTag.text().trim() == '-') return '';

  const statusClass = statusTag.attr('class');
  switch (statusClass) {
    case 'check triangle':
      return consts.CATION;
    case 'check out':
      return consts.CANCEL;
    case 'check circle':
      return consts.NORMAL;
    case 'check ':
      return "";
    default:
      return "";
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
function sendFirebase(targetPort) {
  // console.log(timeTable);
  const tableName = TABLE + '/' + targetPort;
    console.log('DB登録開始:' + tableName);
  return new Promise(function (resolve, reject) {
    firebase.database()
      .ref(tableName)
      .set(sendData.get(targetPort), function () {
        console.log('DB登録完了');
        resolve();
      })
  });
};

/**
 * 一覧のステータスを取得して変数に格納しておく
 */
function getStatusFromFirebase() {
  tableName = 'anei/list/ports'
  return firebase.database()
    .ref(tableName)
    .once('value')
    .then(function (snapshot) {
      // console.log(snapshot.val());
      snapshot.val().forEach(function (e, i) {
        ports.set(e.portCode, e);
      });
      // console.log(ports);
    })
}

module.exports = run;