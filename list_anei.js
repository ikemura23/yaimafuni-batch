const client = require('cheerio-httpcli');
const fs = require('fs');
const firebase = require("firebase");

const COMPANY = 'anei';
const TABLE = COMPANY + '_status';
const URL = 'http://www.aneikankou.co.jp';
// client.debug = true; // cheerio-httpcliのデバッグ出力切り替え

console.log('スクレイピング開始:' + COMPANY);
client.fetch(URL)
    .then(function(result) {
        var $ = result.$;

        //読み込み開始
        // const ul = {
        //     html: $('#situation div ul.route').html().trim().replace(/\t/g, '')
        // };
        // const json = JSON.parse(fs.readFileSync('json/list-anei.json', 'utf-8'));
        // if (json.html == ul.html) {
        //   // 前回と値が変わってない
        //   console.log("前回と値が変わってないので終了");
        //   return;
        // } else {
        //   // 何かしら値が変わっている
        //   console.log("前回から値の変更あり");
        //   fs.writeFile('json/list-anei.json', JSON.stringify(ul, null, ""))
        // }

        let sendData = {
            comment: $('div.content_wrap').find('p.all-note').text().trim(), // 全体コメント
            updateTime: $('div.service').find('h3').find('span').text().trim() // 更新日時
        };

        // 一覧ステータス
        $('#situation div ul.route li').each(function(idx) {
            var arreaTag = $(this).find('div').eq(0);

            // 港名
            var port_name = arreaTag.find('span.name').text();
            // console.log(port_name);

            // 港id
            var port_code = getPortCode(port_name);
            // console.log(port_code);

            // ステータス名
            var statusText = arreaTag.find('span').eq(1).text();
            // console.log(status_text);

            // クラス名
            var statusCode = getStatusCode(arreaTag);
            // console.log(tag_status_span);

            // チップス
            var chips = $(this).find('div').eq(1);
            // 港別コメント
            var chips_comment = chips.find("div").find("p").text().trim();
            // console.log(chips_comment);

            var port = {
                code: port_code,
                name: port_name,
                status: {
                    code: statusCode,
                    text: statusText
                },
                comment: chips_comment,
                html: arreaTag.html().trim().replace(/\t/g, '')
            }
            sendData[port_code] = port;

        });
        console.log('スクレイピング完了:' + COMPANY);
        return sendData;
    })
    .then(function(data) {
        console.log('DB登録開始');
        return firebase.database().ref(TABLE).set(data)
            .then(function() {
                console.log('DB登録完了');
                firebase.database().goOffline(); //プロセスが終わらない対策
            })
            .catch(function(error) {
                console.log('DB登録エラー発生!!');
                console.log(error);
            });
    })
    .catch(function(error) {
        console.log('エラー発生');
        console.log(error);
    })
    .finally(function() {
        console.log('処理完了');
    });

// 港名から港コードを返す
function getPortCode(portName) {
    // 港id
    if (portName.toString().includes("竹富")) {
        return "taketomi";
    } else if (portName.toString().includes("小浜")) {
        return "kohama";
    } else if (portName.toString().includes("黒島")) {
        return "kuroshima";
    } else if (portName.toString().includes("大原")) {
        return "oohara";
    } else if (portName.toString().includes("上原")) {
        return "uehara";
    } else if (portName.toString().includes("鳩間")) {
        return "hatoma";
    } else if (portName.toString().includes("波照間")) {
        return "hateruma";
    }
}

/**
 * タグのcssクラス名からステータスコードを取得
 * @param {港単体タグ} arrea 
 */
function getStatusCode(arreaTag) {
    if (arreaTag.find('span').eq(1).hasClass("flag triangle")) {
        return "cation";
    } else if (arreaTag.find('span').eq(1).hasClass("flag out")) {
        return "cancel";
    } else if (arreaTag.find('span').eq(1).hasClass("flag circle")) {
        return "normal";
    } else {
        return "cation";
    }
}