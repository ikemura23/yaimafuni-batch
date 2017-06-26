const client = require('cheerio-httpcli');
const firebase = require("firebase");
const consts = require('./consts.js');
const sendError = require('./slack');

const COMPANY = consts.DREAM;
const TABLE = COMPANY + '/';
const URL = 'http://ishigaki-dream.co.jp/';
// client.debug = true; // cheerio-httpcliのデバッグ出力切り替え

/**
 * 外部呼び出しメイン処理
 */
module.exports = () => {
  return Promise.resolve()
    .then(() => console.log(`開始 ${COMPANY} 一覧`))
    .then(() => getHtmlContents())
    .then($ => parseContents($))
    .then(data => divideUeharaHatoma(data))
    .then(data => sendToFirebase(data))
    .then(() => console.log(`完了 ${COMPANY} 一覧`))
    .catch((error) => sendError(error.stack))
    // .catch((error) => console.error(error.stack))
}

/**
 * HTMLコンテンツを取得
 */
function getHtmlContents() {
  return client.fetch(URL)
    .then(function (result) {
      return new Promise(resolve => {
        resolve(result.$);
      })
    })
}

/**
 * HTMLからパースする
 * @param {CheerioStaticEx} $ 取得したHTMLタグ
 */
function parseContents($) {
  if (!$) return null;

  const html = $('#post-12 > div > div.operationArea.clearfix > div > ul');
  if (!html) {
    throw DOMException('初めのタグ取得に失敗したぞー');
  }

  let sendData = {
    comment: html.find('#ticker_area').text().trim(), // 全体コメント
    updateTime: getUpdateTime(html.find('li.last').text()), // 更新日時
    ports: []
  }

  // 港別に取得してパース処理
  html.find('li').each(function (idx) {
    if (idx > 6) {
      return true; //最後のliタグは更新日時と時刻表リンクなのでループ抜ける
    }

    // 港名
    let portName;
    if ($(this).has('a').text().length > 0) {
      portName = $(this).find('a').text();
    } else {
      // contentsについて http://qiita.com/sl2/items/0a6d877d1f9f6ea63999
      portName = $(this).children('div').eq(0).contents().eq(0).text();
    }

    // 港コード
    const portCode = getPortCode(portName);
    if (!portCode) return;

    // ステータス
    const statusText = $(this).find('span').text();
    const statusCode = getStatusCode($(this).find('span').attr('class'));

    // 港別のコメント
    const portComment = $(this).children('div').eq(1).text();

    // 運行情報を作成
    const port = {
      portCode: portCode,
      portName: portName,
      comment: portComment,
      status: {
        code: statusCode,
        text: statusText
      }
    }
    // sendData.ports.push(port);
    sendData[portCode] = port;
  });
  return Promise.resolve(sendData);
}

/**
 * firebaseへ送信
 * @param {オブジェクトリテラル} data パースして作成したデータ
 */
function sendToFirebase(data) {
  if (!data) return;
  return firebase.database().ref(TABLE).update(data);
}

/**
 * 最後のliタグから更新日時を取得する
 * @param {最後のliタグ内容} rawText 最後のli内容
 */
function getUpdateTime(rawText) {
  const before = "更新（時刻表はこちら）";
  const regExp = new RegExp(before, "g");
  return rawText.replace(regExp, "").trim();;
}

/**
 * 引数の港名から港コードを返す
 * @param {string} portName 
 */
function getPortCode(portName) {
  // 港id
  switch (portName) {
    case "竹富島":
      return consts.TAKETOMI;
    case "小浜島":
      return consts.KOHAMA;
    case "黒島":
      return consts.KUROSHIMA;
    case "西表島・大原":
      return consts.OOHARA;
    case "鳩間島経由西表島・上原":
      return consts.UEHARA_HATOMA;
    case "プレミアムドリーム":
      return consts.PREMIUM_DREAM;
    case "スーパードリーム":
      return consts.SUPER_DREAM;
    default:
      return '';
  }
}

/**
 * 引数のクラス名から運行ステータスを返す
 * @param {string} className 
 */
function getStatusCode(className) {
  switch (className) {
    case 'pcan':
      return consts.CATION;
    case 'can':
      return consts.CANCEL;
    case 'sus':
      return consts.SUSPEND; // 運休
    case 'sub':
      return consts.NORMAL; // 臨時便にて運航
    case '':
      return consts.NORMAL;
    default:
      return consts.CATION;
  }
}

/**
 * dreamのみ上原と鳩間が一つになっているので、他の会社に合わせて分離する
 * @param {オブジェクトリテラル} data パース済みデータ
 */
function divideUeharaHatoma(data) {
  if (data.uehara_hatoma) {
    data['uehara'] = data.uehara_hatoma;
    data.uehara.portCode = 'uehara';
    data['hatoma'] = data.uehara_hatoma;
    data.hatoma.portCode = 'hatoma';
  }
  return Promise.resolve(data);
}