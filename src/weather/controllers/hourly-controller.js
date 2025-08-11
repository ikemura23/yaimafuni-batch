const HourlyScraper = require('../scrapers/hourly-scraper');
const HourlyTransformer = require('../transformers/hourly-transformer');
const repository = require('../../repository/firebase_repository');
const sendError = require('../../slack');

/**
 * 時間別天気の統合処理を担当するクラス
 */
class HourlyController {
  constructor() {
    this.scraper = new HourlyScraper();
    this.transformer = new HourlyTransformer();
  }

  /**
   * 時間別天気の更新処理を実行
   * @returns {Promise<void>}
   */
  async updateHourlyWeather() {
    console.group('HourlyController.updateHourlyWeather start');
    
    try {
      // 1. API呼び出し
      console.log('Starting hourly weather API call...');
      const apiResponse = await this.scraper.fetchWeather();

      // 2. データ変換
      console.log('Transforming hourly weather data...');
      const transformedData = this.transformer.transform(apiResponse);

      // 3. データ保存
      console.log('Saving hourly weather data...');
      await this.saveData(transformedData);

      console.log('HourlyController.updateHourlyWeather completed successfully');
    } catch (error) {
      console.error('HourlyController.updateHourlyWeather error:', error);
      await sendError(error.stack, '時間別天気の更新でエラー発生!');
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
      const tableName = 'hourly_weather/v1/';
      await repository.set(tableName, data);
      console.log('Hourly weather data saved successfully');
    } catch (error) {
      console.error('Error saving hourly weather data:', error);
      throw error;
    }
  }
}

module.exports = HourlyController;
