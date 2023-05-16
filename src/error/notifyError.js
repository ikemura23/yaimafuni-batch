// https://github.com/zulip/zulip-js
const zulipInit = require('zulip-js');
const config = {
  username: "yaimafuni_notify2-bot@yamaneko-system.zulipchat.com",
  apiKey: "rSb4qiVzY1dus1XMvnoFF3Br3XoGEqFV", //process.env.ZULIP_API_KEY,
  realm: "https://yamaneko-system.zulipchat.com",
};

(async () => {
  const zulip = await zulipInit(config);
  // The zulip object now initialized with config
  console.log(await zulip.streams.subscriptions.retrieve());
})();