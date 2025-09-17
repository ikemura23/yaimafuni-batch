const createBrowser = require('../../browser-factory');

/**
 * Yahoo天気のスクレイピングを担当するクラス
 */
class YahooScraper {
  constructor() {
    this.url = 'https://weather.yahoo.co.jp/weather/jp/47/9410.html';
  }

  /**
   * Yahoo天気のスクレイピングを実行
   * @returns {Promise<Object>} 今日と明日の天気データ
   */
  async scrapeWeather() {
    console.log('YahooScraper.scrapeWeather start');
    const browser = await createBrowser();

    try {
      const page = await browser.newPage();
      await page.goto(this.url, { waitUntil: 'networkidle2' });

      const today = await this.getToday(page);
      const tomorrow = await this.getTomorrow(page);

      return { today, tomorrow };
    } catch (error) {
      console.error('YahooScraper.scrapeWeather error:', error);
      throw error;
    } finally {
      await browser.close();
      console.log('YahooScraper.scrapeWeather end');
    }
  }

  /**
   * ページからセレクターの値を取得
   * @param {Page} page - Puppeteerのページオブジェクト
   * @param {string} itemSelector - CSSセレクター
   * @returns {Promise<string>} 取得したテキスト
   */
  async getData(page, itemSelector) {
    return await page.$eval(itemSelector, (item) => {
      return item.textContent;
    });
  }

  /**
   * 今日の天気データを取得
   * @param {Page} page - Puppeteerのページオブジェクト
   * @returns {Promise<Object>} 今日の天気データ
   */
  async getToday(page) {
    const date = await this.getData(page, 'div.forecastCity > table > tbody > tr > td:nth-child(1) > div > p.date');
    const weather = await this.getData(
      page,
      '#main > div.forecastCity > table > tbody > tr > td:nth-child(1) > div > p.pict'
    );
    const wind = await this.getData(
      page,
      '#main > div.forecastCity > table > tbody > tr > td:nth-child(1) > div > dl > dd:nth-child(2)'
    );
    const wave = await this.getData(
      page,
      '#main > div.forecastCity > table > tbody > tr > td:nth-child(1) > div > dl > dd:nth-child(4)'
    );
    const temperatureHight = await this.getData(
      page,
      '#main > div.forecastCity > table > tbody > tr > td:nth-child(1) > div > ul > li.high'
    );
    const temperatureLow = await this.getData(
      page,
      '#main > div.forecastCity > table > tbody > tr > td:nth-child(1) > div > ul > li.low'
    );

    return {
      date: date.replace(/\r?\n/g, '').trim(),
      weather: weather.replace(/\r?\n/g, '').trim(),
      temperature: {
        hight: temperatureHight.replace(/\r?\n/g, '').trim(),
        low: temperatureLow.replace(/\r?\n/g, '').trim(),
      },
      wave: wave.replace(/\r?\n/g, '').trim(),
      wind: wind.replace(/\r?\n/g, '').trim(),
    };
  }

  /**
   * 明日の天気データを取得
   * @param {Page} page - Puppeteerのページオブジェクト
   * @returns {Promise<Object>} 明日の天気データ
   */
  async getTomorrow(page) {
    const date = await this.getData(
      page,
      '#main > div.forecastCity > table > tbody > tr > td:nth-child(2) > div > p.date'
    );
    const weather = await this.getData(
      page,
      '#main > div.forecastCity > table > tbody > tr > td:nth-child(2) > div > p.pict'
    );
    const wind = await this.getData(
      page,
      '#main > div.forecastCity > table > tbody > tr > td:nth-child(2) > div > dl > dd:nth-child(2)'
    );
    const wave = await this.getData(
      page,
      '#main > div.forecastCity > table > tbody > tr > td:nth-child(2) > div > dl > dd:nth-child(4)'
    );
    const temperatureHight = await this.getData(
      page,
      '#main > div.forecastCity > table > tbody > tr > td:nth-child(2) > div > ul > li.high'
    );
    const temperatureLow = await this.getData(
      page,
      '#main > div.forecastCity > table > tbody > tr > td:nth-child(2) > div > ul > li.low'
    );

    return {
      date: date.replace(/\r?\n/g, '').trim(),
      weather: weather.replace(/\r?\n/g, '').trim(),
      temperature: {
        hight: temperatureHight.replace(/\r?\n/g, '').trim(),
        low: temperatureLow.replace(/\r?\n/g, '').trim(),
      },
      wave: wave.replace(/\r?\n/g, '').trim(),
      wind: wind.replace(/\r?\n/g, '').trim(),
    };
  }
}

module.exports = YahooScraper;
