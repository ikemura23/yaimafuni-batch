const Slack = require('slack-node');
const config = require("./config.json");

/**
 * 引数をSlack#notificasionに投稿
 */
module.exports = function post(msg) {
  console.log('Post to Slack: ' + msg);

  // const webhookUri = config.slack.webHookUrl;
  // slack = new Slack();
  // slack.setWebhook(webhookUri);
  // slack.webhook({
  //   channel: "#notification",
  //   username: "yaimafuni-backend",
  //   icon_emoji: ":ghost:",
  //   text: getNowFormatDateTime() + '\n' + msg,
  // }, function(err, response) {
  //   if (err) console.log(err);
  //   // console.log(response);
  // });
}

/**
 * 日時からyyyyMMdd_HHmmss形式の文字列を返す
 */
function getNowFormatDateTime() {
  const date = new Date();
  let res = "";
  try {
    res = date.getFullYear() + '/' +
      padZero(date.getMonth() + 1) + '/' +
      padZero(date.getDate()) +
      " " + padZero(date.getHours()) + ':' +
      padZero(date.getMinutes()) + ':' +
      padZero(date.getSeconds());
  } catch (error) {}
  return res;
}

/**
 * 先頭にゼロを付加
 * @param 数字 num 
 */
function padZero(num) {
  let result = null;
  if (num < 10) {
    result = "0" + num;
  } else {
    result = "" + num;
  }
  return result;
}