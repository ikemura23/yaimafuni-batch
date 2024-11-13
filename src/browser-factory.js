const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");

module.exports = async () => {
  const LAUNCH_OPTION = {
    executablePath:
      process.env.CHROMIUM_EXECUTABLE_PATH ?? (await chromium.executablePath()),
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
};
