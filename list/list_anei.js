const client = require('cheerio-httpcli');
const firebase = require("firebase");
const consts = require('../consts.js');
const sendError = require('../slack');
client.setBrowser('chrome');
const COMPANY = consts.ANEI;
const TABLE_NAME = COMPANY;
const URL = 'http://www.aneikankou.co.jp';
// client.debug = true; // cheerio-httpcliのデバッグ出力切り替え

module.exports = function () {
  console.log('開始:' + COMPANY + ' 一覧');
  return new Promise(function (resolve) {
    client.fetch(URL)
      .then(function (result) {
        var $ = result.$;
        // if ($.html.length == 0) {
        //   throw new Error(COMPANY + "一覧 HTMLの取得に失敗しました");
        // }
        let sendData = {
          comment: $('div.content_wrap').find('p.all-note').text().trim(), // 全体コメント
          updateTime: $('div.service').find('h3').find('span').text().trim(), // 更新日時
          ports: []
        };

        // 一覧ステータス
        $('#situation div ul.route li').each(function (idx) {
          var arreaTag = $(this).find('div').eq(0);

          // 港名
          var port_name = arreaTag.find('span.name').text();

          // 港id
          var port_code = getPortCode(port_name);

          // ステータス名
          var statusText = arreaTag.find('span').eq(1).text();

          // クラス名
          var statusCode = getStatusCode(arreaTag);

          // チップス
          var chips = $(this).find('div').eq(1);
          // 港別コメント
          var chips_comment = chips.find("div").find("p").text().trim();

          var port = {
            portCode: port_code,
            portName: port_name,
            status: {
              code: statusCode,
              text: statusText
            },
            comment: filter(chips_comment)
          }
          // sendData.ports.push(port);
          sendData[port_code] = port;

        });
        // console.log('スクレイピング完了:' + COMPANY);
        return sendData;
      })
      .then(function (data) {
        // console.log('DB登録開始');
        return firebase.database().ref(TABLE_NAME).update(data);
      })
      .catch((error) => sendError(error.stack))
      .finally(function () {
        console.log('完了 ' + COMPANY + ' 一覧');
        resolve()
      });
  });
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
 * タグのcssクラス名からステータスコードを取得
 * @param {港単体タグ} arreaTag 
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
 * 重要そうなコメントだけ表示するため精査する
 * @param string comment 
 */
function filter(comment) {
  switch (comment) {
    case "全便平常運航":
      return "";
    case "通常運航。":
      return "";
    case "竹富航路、通常運航です。":
      return "";
    case "竹富航路、通常運航です":
      return "";
    case "竹富島航路、通常運航。":
      return "";
    case "小浜航路、通常運航です。":
      return "";
    case "小浜航路、通常運航です":
      return "";
    case "小浜島航路、通常運航。":
      return "";
    case "黒島航路、通常運航です。":
      return "";
    case "黒島航路、通常運航です":
      return "";
    case "黒島航路、通常運航。":
      return "";
    case "西表島上原航路、通常運航です。":
      return "";
    case "西表島上原航路、通常運航です":
      return "";
    case "西表島上原航路、通常運航。":
      return "";
    case "西表島上原航路、欠航。":
      return "";
    case "鳩間航路、通常運航です。":
      return "";
    case "鳩間航路、通常運航です":
      return "";
    case "鳩間航路、通常運航。":
      return "";
    case "鳩間島航路、通常運航。":
      return "";
    case "鳩間航路、欠航。":
      return "";
    case "鳩間島航路、欠航。":
      return "";
    case "西表島大原航路、通常運航です。":
      return "";
    case "西表島大原航路、通常運航です":
      return "";
    case "西表島大原航路、通常運航。":
      return "";
    case "波照間島航路、通常運航。":
      return "";
    case "波照間島航路、通常運航":
      return "";
    case "波照間島航路、運航。":
      return "";
    case "波照間島航路、運航":
      return "";
    case "波照間島航路、欠航。":
      return "";

    default:
      return comment;
  }
}