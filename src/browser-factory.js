const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");

async function create() {
  const LAUNCH_OPTION = {
    executablePath: process.env.IS_LOCAL
      ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
      : await chromium.executablePath(),
    headless: process.env.IS_LOCAL ? true : chromium.headless,
    ignoreHTTPSErrors: true,
    defaultViewport: chromium.defaultViewport,
    args: process.env.IS_LOCAL
      ? [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--hide-scrollbars",
          "--disable-web-security",
        ]
      : [...chromium.args, "--hide-scrollbars", "--disable-web-security"],
  };
  return await puppeteer.launch(LAUNCH_OPTION);
}

module.exports = {
  create,
};
