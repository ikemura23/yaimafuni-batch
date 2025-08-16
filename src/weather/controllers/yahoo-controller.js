const YahooScraper = require('../scrapers/yahoo-scraper');
const YahooTransformer = require('../transformers/yahoo-transformer');
const repository = require('../../repository/firebase_repository');
const sendError = require('../../slack');

/**
 * Yahoo天気の統合処理を担当するクラス
 */
class YahooController {
  constructor() {
    this.scraper = new YahooScraper();
    this.transformer = new YahooTransformer();
  }

  /**
   * Yahoo天気の更新処理を実行
   * @returns {Promise<void>}
   */
  async updateYahooWeather() {
    console.group('YahooController.updateYahooWeather start');
    
    try {
      // 1. スクレイピング実行
      console.log('Starting Yahoo weather scraping...');
      const scrapedData = await this.scraper.scrapeWeather();

      // 2. データ変換
      console.log('Transforming Yahoo weather data...');
      const transformedData = this.transformer.transform(scrapedData);

      // 3. データ保存
      console.log('Saving Yahoo weather data...');
      await this.saveData(transformedData);

      console.log('YahooController.updateYahooWeather completed successfully');
    } catch (error) {
      console.error('YahooController.updateYahooWeather error:', error);
      await sendError(error.stack, 'Yahoo天気の更新でエラー発生!');
      throw error;
    } finally {
      console.groupEnd();
    }
  }

  /**
   * データをFirebaseに保存
   * @param {Object} data - 保存するデータ
   * @returns {Promise<void>}
   */
  async saveData(data) {
    try {
      await Promise.all([
        repository.set('weather/yahoo/today', data.today),
        repository.set('weather/yahoo/tomorrow', data.tomorrow)
      ]);
      console.log('Yahoo weather data saved successfully');
    } catch (error) {
      console.error('Error saving Yahoo weather data:', error);
      throw error;
    }
  }
}

module.exports = YahooController;
