const client = require('cheerio-httpcli');
const fs = require('fs');
const firebase = require("firebase");

const COMPANY = 'ykf';
const TABLE = COMPANY + '_status';
const URL = 'http://www.yaeyama.co.jp/';
const JSON_PATH = 'json/list-ykf.json';

// client.debug = true; // cheerio-httpcliのデバッグ出力切り替え



function run() {
    console.log('スクレイピング開始:' + COMPANY);
    return new Promise(function(resolve) {
        client.fetch(URL)
            .then(function(result) {
                const $ = result.$;
                if (!$) return null;

                // const saveTag = { html: $('#unkou_bg_top').html().trim().replace(/\t/g, '') };
                // console.log(html);
                //読み込み開始
                // try {
                //   let json = { html: '' };

                //   try {
                //     fs.exists(JSON_PATH, function() {
                //       json = JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8') || "null");
                //     });
                //   } catch (error) {
                //     console.log(JSON_PATH + "読み込み時にエラー発生");
                //     console.log(error);
                //   };

                //   if (json.html == saveTag.html) {
                //     // 前回と値が変わってない
                //     console.log("前回と値が変わってない");
                //     //   return null;
                //   } else {
                //     // 何かしら値が変わっているので続行
                //     console.log("前回から値の変更あり");
                //     fs.writeFile(JSON_PATH, JSON.stringify(saveTag, null, ""))
                //   }
                // } catch (error) {
                //   console.log("json読み書きでエラー発生");
                //   console.log(error);
                // }

                const sendData = {
                    comment: '',
                    updateTime: $('div.unkou_time_top').html().trim() // 更新日時
                }

                // 港別に取得してパース処理
                $('#unkou_bg_top > div.unkou_joukyou > div').each(function() {

                    // 港名
                    let portName = $(this).find('div').eq(0).text();
                    console.log('----------------');
                    console.log(portName + ' 開始');
                    // 港コード
                    let portCode = getPortCode(portName);

                    // ステータス取得
                    const unkou_item_display_txt = $(this).find('div.unkou_item_display_in > div.unkou_item_display_txt');
                    const kigou = unkou_item_display_txt.find('span').eq(0).text().trim(); // ○ , △ , ×
                    const statusText = unkou_item_display_txt.text().replace(kigou, '').trim(); // ○通常運行 -> 通常運行
                    const bikou = $(this).find('div.no_disp.unkou_item_display_bikou').text().trim(); //備考 あったりなかったりする
                    const statusCode = getStatusCode(kigou);

                    //   console.log(portName);
                    //   console.log(portCode);
                    //   console.log(kigou);
                    //   console.log(statusText);
                    //   console.log(bikou);
                    //   console.log(statusCode);
                    //   console.log(comment);

                    // 運行情報を作成
                    const port = {
                        code: portCode,
                        name: portName,
                        comment: bikou,
                        html: $(this).html().trim().replace(/\t/g, ''), // デバッグ用　後で消す
                        status: {
                            code: statusCode,
                            text: statusText
                        }
                    }
                    sendData[portCode] = port;
                    console.log(portName + ' 完了');
                });
                return sendData;
            })
            .then(function(data) {
                if (!data) return;
                console.log('DB登録開始');
                return firebase.database().ref(TABLE).set(data, function() {
                    console.log('DB登録完了');
                    // firebase.database().goOffline(); //プロセスが終わらない対策
                })
            })
            .catch(function(error) {
                console.log('エラー発生');
                console.log(error);
            })
            .finally(function() {
                console.log('処理完了 ' + COMPANY);
                firebase.database().goOffline(); //プロセスが終わらない対策
                resolve()
            });
    });
}

// 港名から港コードを返す
function getPortCode(port_name) {
    // 港id
    if (port_name === "竹富航路") {
        return "taketomi";
    } else if (port_name === "小浜航路") {
        return "kohama";
    } else if (port_name === "小浜－竹富航路") {
        return "kohama-taketomi";
    } else if (port_name === "黒島航路") {
        return "kuroshima";
    } else if (port_name === "小浜－大原航路") {
        return "kohama-oohara";
    } else if (port_name === "西表島大原航路") {
        return "oohara";
    } else if (port_name === "西表島上原航路") {
        return "uehara";
    } else if (port_name === "鳩間航路") {
        return "hatoma";
    }
}

// クラス名を取得
function getStatusCode(kigou) {
    if (kigou == '△') {
        return "cation";
    } else if (kigou == '×') {
        return "cancel";
    } else if (kigou == '○') {
        return "normal";
    } else {
        return "cation";
    }
}

module.exports = run;