const createBrowser = require('../../browser-factory');

/**
 * 天気.jpのスクレイピングを担当するクラス
 */
class TenkijpScraper {
  constructor() {
    this.url = 'https://tenki.jp/forecast/10/50/9410/47207/3hours.html';
  }

  /**
   * 天気.jpのスクレイピングを実行
   * @returns {Promise<Object>} 今日と明日の天気データ
   */
  async scrapeWeather() {
    console.log('TenkijpScraper.scrapeWeather start');
    const browser = await createBrowser();
    
    try {
      const page = await browser.newPage();
      await page.goto(this.url, {
        timeout: 30000,
        waitUntil: 'domcontentloaded',
      });

      const today = await this.getToday(page);
      const tomorrow = await this.getTomorrow(page);

      return { today, tomorrow };
    } catch (error) {
      console.error('TenkijpScraper.scrapeWeather error:', error);
      throw error;
    } finally {
      await browser.close();
      console.log('TenkijpScraper.scrapeWeather end');
    }
  }

  /**
   * ページからセレクターの値を配列で取得
   * @param {Page} page - Puppeteerのページオブジェクト
   * @param {string} itemSelector - CSSセレクター
   * @returns {Promise<Array<string>>} 取得したテキストの配列
   */
  async getData(page, itemSelector) {
    return await page.evaluate((selector) => {
      const list = Array.from(document.querySelectorAll(selector));
      return list.map((data) => data.textContent.trim());
    }, itemSelector);
  }

  /**
   * 今日の天気データを取得
   * @param {Page} page - Puppeteerのページオブジェクト
   * @returns {Promise<Array<Object>>} 今日の天気データ配列
   */
  async getToday(page) {
    const hour = await this.getData(page, '#forecast-point-3h-today > tbody > tr.hour > td');
    const weather = await this.getData(page, '#forecast-point-3h-today > tbody > tr.weather > td');
    const windDirection = await this.getData(page, '#forecast-point-3h-today > tbody > tr.wind-direction > td > p');
    const windSpeed = await this.getData(page, '#forecast-point-3h-today > tbody > tr.wind-speed > td');
    
    const datas = [];
    for (let i = 1; i < 6; i++) {
      datas.push({
        hour: hour[i],
        weather: weather[i],
        windBlow: windDirection[i],
        windSpeed: windSpeed[i],
      });
    }
    
    return datas;
  }

  /**
   * 明日の天気データを取得
   * @param {Page} page - Puppeteerのページオブジェクト
   * @returns {Promise<Array<Object>>} 明日の天気データ配列
   */
  async getTomorrow(page) {
    const hour = await this.getData(page, '#forecast-point-3h-tomorrow > tbody > tr.hour > td');
    const weather = await this.getData(page, '#forecast-point-3h-tomorrow > tbody > tr.weather > td');
    const windDirection = await this.getData(page, '#forecast-point-3h-tomorrow > tbody > tr.wind-blow > td > p'); // todayとtrクラス名が違う
    const windSpeed = await this.getData(page, '#forecast-point-3h-tomorrow > tbody > tr.wind-speed > td');
    
    const datas = [];
    for (let i = 1; i < 6; i++) {
      datas.push({
        hour: hour[i],
        weather: weather[i],
        windBlow: windDirection[i],
        windSpeed: windSpeed[i],
      });
    }
    
    return datas;
  }
}

module.exports = TenkijpScraper;
