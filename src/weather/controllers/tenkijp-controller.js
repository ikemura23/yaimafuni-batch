const TenkijpScraper = require('../scrapers/tenkijp-scraper');
const TenkijpTransformer = require('../transformers/tenkijp-transformer');
const repository = require('../../repository/firebase_repository');
const sendError = require('../../slack');

/**
 * 天気.jpの統合処理を担当するクラス
 */
class TenkijpController {
  constructor() {
    this.scraper = new TenkijpScraper();
    this.transformer = new TenkijpTransformer();
  }

  /**
   * 天気.jpの更新処理を実行
   * @returns {Promise<void>}
   */
  async updateTenkijpWeather() {
    console.group('TenkijpController.updateTenkijpWeather start');

    try {
      // 1. スクレイピング実行
      console.log('Starting Tenkijp weather scraping...');
      const scrapedData = await this.scraper.scrapeWeather();

      // 2. データ変換
      console.log('Transforming Tenkijp weather data...');
      const transformedData = this.transformer.transform(scrapedData);

      // 3. データ保存
      console.log('Saving Tenkijp weather data...');
      await this.saveData(transformedData);

      console.log('TenkijpController.updateTenkijpWeather completed successfully');
    } catch (error) {
      console.error('TenkijpController.updateTenkijpWeather error:', error);
      await sendError(error.stack, '天気.jpの更新でエラー発生!');
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
        repository.set('weather/tenkijp/today/table', data.today),
        repository.set('weather/tenkijp/tomorrow/table', data.tomorrow),
      ]);
      console.log('Tenkijp weather data saved successfully');
    } catch (error) {
      console.error('Error saving Tenkijp weather data:', error);
      throw error;
    }
  }
}

module.exports = TenkijpController;
