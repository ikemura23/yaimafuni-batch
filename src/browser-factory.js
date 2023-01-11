const puppeteer = require("puppeteer");

async function create() {
  const LAUNCH_OPTION = {
    headless: true,
    // channel: "chrome", // Mac
    // executablePath: "chromium-browser", // Raspberry Pi
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  };
//   const browser = await puppeteer.launch(LAUNCH_OPTION);
  return await puppeteer.launch(LAUNCH_OPTION);
};

module.exports = {
    create
};