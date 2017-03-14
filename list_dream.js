const client = require('cheerio-httpcli');
const fs = require('fs');
const firebase = require("firebase");

const COMPANY = 'dream';
const TABLE = COMPANY + '_status';
const URL = 'http://ishigaki-dream.co.jp/';
// client.debug = true; // cheerio-httpcliのデバッグ出力切り替え

function run() {
  console.log('開始:' + COMPANY + ' 一覧');
  return new Promise(function(resolve) {
    client.fetch(URL)
      .then(function(result) {
        const $ = result.$;
        if (!$) return null;

        const html = $('#post-12 > div > div.operationArea.clearfix > div > ul');
        if (!html) {
          throw DOMException('初めのタグ取得に失敗したぞー');
        }

        // キャッシュ用HTML
        // const saveData = { html: html.html().trim() };
        // //読み込み開始
        // const json = JSON.parse(fs.readFileSync('json/list-dream.json', 'utf-8'));
        // if (json.html == saveData.html) {
        //   // 前回と値が変わってない
        //   console.log("前回と値が変わってない");
        //   //   return null;
        // } else {
        //   // 何かしら値が変わっているので続行
        //   console.log("前回から値の変更あり");
        //   fs.writeFile('json/list-dream.json', JSON.stringify(saveData, null, ""))
        // }

        let sendData = {
          comment: html.find('#ticker_area').text().trim(), // 全体コメント
          updateTime: getUpdateTime(html.find('li.last').text()) // 更新日時
        }

        // 港別に取得してパース処理
        html.find('li').each(function(idx) {
          // console.log('----------------');
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
          //   if (portCode.length == 0) {
          //     return true;
          //   }

          // ステータス
          const statusText = $(this).find('span').text();
          const statusCode = getStatusCode($(this).find('span').attr('class'));

          // 港別のコメント
          const portComment = $(this).children('div').eq(1).text();

          //   console.log($(this).html());
          //   console.log(portName);
          //   console.log(portCode);
          //   console.log(statusText);
          //   console.log(statusCode);
          //   console.log(portComment);

          // 運行情報を作成
          const port = {
            code: portCode,
            name: portName,
            comment: portComment,
            status: {
              code: statusCode,
              text: statusText
            },
            html: $(this).html() //デバッグ用、後で消す
          }
          sendData[portCode] = port;
          // console.log(portName + ' 完了');
        });
        // console.log('スクレイピング完了');
        // console.log(sendData);
        return sendData;
      })
      .then(function(data) {
        if (!data) return;
        // console.log('DB登録開始 ' + COMPANY);
        return firebase.database().ref(TABLE).set(data);
      })
      .catch(function(error) {
        console.log('エラー発生');
        console.log(error);
      })
      .finally(function() {
        console.log('完了 ' + COMPANY + ' 一覧');

        // firebase.database().goOffline(); //プロセスが終わらない対策
        resolve()
      });
  });
}

/**
 * 最後のliタグから更新日時を取得する
 * @param {最後のliタグ内容} before 
 */
function getUpdateTime(rawText) {
  const before = "更新（時刻表はこちら）";
  const regExp = new RegExp(before, "g");
  return rawText.replace(regExp, "").trim();;
}

// 港名から港コードを返す
function getPortCode(portName) {
  // 港id
  switch (portName) {
    case "竹富島":
      return "taketomi";
    case "小浜島":
      return "kohama";
    case "黒島":
      return "kuroshima";
    case "西表島・大原":
      return "oohara";
    case "鳩間島経由西表島・上原":
      return "uehara_hatoma";
    case "プレミアムドリーム":
      return "premium_dream";
    case "スーパードリーム":
      return "super_dream";
    default:
      return '';
  }
}

// クラス名を取得
function getStatusCode(className) {
  switch (className) {
    case 'pcan':
      return "cation";
    case 'can':
      return "cancel";
    case '':
      return "normal";
    default:
      return "cation";
  }
}

module.exports = run;