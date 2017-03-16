const Slack = require('slack-node');
const config = require("./config.json");

/**
 * Slackに投稿
 */
function post(error) {
  console.log(error);

  const webhookUri = config.slack.webHookUrl;
  slack = new Slack();
  slack.setWebhook(webhookUri);
  slack.webhook({
    channel: "#notification",
    username: "yaimafuni-backend",
    icon_emoji: ":ghost:",
    text: error.stack,
  }, function(err, response) {
    if (err) console.log(err);
    // console.log(response);
  });
}

module.exports = post;