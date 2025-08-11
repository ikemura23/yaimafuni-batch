const YahooController = require('./yahoo-controller');
const TenkijpController = require('./tenkijp-controller');
const HourlyController = require('./hourly-controller');

/**
 * Weatherコントローラーの統合管理クラス
 * 各天気サービスのコントローラーを統合管理し、テスト容易性と保守性を向上させる
 */
class WeatherControllerManager {
  constructor() {
    // 各天気サービスのコントローラーを初期化
    this.yahoo = new YahooController();
    this.tenkijp = new TenkijpController();
    this.hourly = new HourlyController();
  }

  /**
   * すべてのweatherコントローラーを実行
   * @returns {Promise<void>}
   */
  async updateAll() {
    console.group('WeatherControllerManager.updateAll start');

    try {
      // Yahoo天気処理
      console.log('Starting Yahoo weather controller...');
      await this.yahoo.updateYahooWeather();

      // 天気.jp処理
      console.log('Starting Tenkijp weather controller...');
      await this.tenkijp.updateTenkijpWeather();

      // 時間別天気処理
      console.log('Starting Hourly weather controller...');
      await this.hourly.updateHourlyWeather();

      console.log('WeatherControllerManager.updateAll completed successfully');
    } catch (error) {
      console.error('WeatherControllerManager.updateAll error:', error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }

  /**
   * Yahoo天気更新（デバッグ・単体テスト用）
   * @returns {Promise<void>}
   */
  async updateYahooWeather() {
    console.group('WeatherControllerManager.updateYahooWeather start');

    try {
      await this.yahoo.updateYahooWeather();
      console.log('WeatherControllerManager.updateYahooWeather completed successfully');
    } catch (error) {
      console.error('WeatherControllerManager.updateYahooWeather error:', error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }

  /**
   * 天気.jp更新（デバッグ・単体テスト用）
   * @returns {Promise<void>}
   */
  async updateTenkijpWeather() {
    console.group('WeatherControllerManager.updateTenkijpWeather start');

    try {
      await this.tenkijp.updateTenkijpWeather();
      console.log('WeatherControllerManager.updateTenkijpWeather completed successfully');
    } catch (error) {
      console.error('WeatherControllerManager.updateTenkijpWeather error:', error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }

  /**
   * 時間別天気更新（デバッグ・単体テスト用）
   * @returns {Promise<void>}
   */
  async updateHourlyWeather() {
    console.group('WeatherControllerManager.updateHourlyWeather start');

    try {
      await this.hourly.updateHourlyWeather();
      console.log('WeatherControllerManager.updateHourlyWeather completed successfully');
    } catch (error) {
      console.error('WeatherControllerManager.updateHourlyWeather error:', error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }
}

module.exports = WeatherControllerManager;
