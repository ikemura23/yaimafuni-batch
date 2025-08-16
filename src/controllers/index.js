/**
 * コントローラー管理クラス
 * annei、ykf、weatherのコントローラーを統合管理し、テスト容易性と保守性を向上させる
 */
class ControllerManager {
  constructor() {
    // anneiコントローラーの統合
    this.annei = {
      list: require('../annei/controllers/list-controller.js').updateAnneiList,
      detail: require('../annei/controllers/detail-controller.js').updateAnneiDetail,
      time: require('../annei/controllers/time-announce-controller.js').updateAnneiUpdateTimeAndComment,
    };

    // ykfコントローラーの統合
    this.ykf = {
      list: require('../ykf/controllers/list-controller.js').updateYkfList,
      detail: require('../ykf/controllers/detail-controller.js').updateYkfDetail,
      time: require('../ykf/controllers/time-announce-controller.js').updateYkfUpdateTimeAndComment,
    };

    // weatherコントローラーの統合
    const YahooController = require('../weather/controllers/yahoo-controller.js');
    const TenkijpController = require('../weather/controllers/tenkijp-controller.js');
    const HourlyController = require('../weather/controllers/hourly-controller.js');
    
    const yahooController = new YahooController();
    const tenkijpController = new TenkijpController();
    const hourlyController = new HourlyController();
    
    this.weather = {
      yahoo: () => yahooController.updateYahooWeather(),
      tenkijp: () => tenkijpController.updateTenkijpWeather(),
      hourly: () => hourlyController.updateHourlyWeather(),
    };
  }

  /**
   * すべてのコントローラーを実行
   * @returns {Promise<void>}
   */
  async updateAll() {
    console.group('ControllerManager.updateAll start');

    try {
      // Annei処理
      console.log('Starting Annei controllers...');
      await this.annei.list();
      await this.annei.detail();

      // YKF処理
      console.log('Starting YKF controllers...');
      await this.ykf.list();
      await this.ykf.time();
      await this.ykf.detail();

      // Weather処理
      console.log('Starting Weather controllers...');
      await this.weather.yahoo();
      await this.weather.tenkijp();
      await this.weather.hourly();

      console.log('ControllerManager.updateAll completed successfully');
    } catch (error) {
      console.error('ControllerManager.updateAll error:', error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }

  /**
   * Annei一覧更新（デバッグ・単体テスト用）
   *
   * 使用例:
   * ```javascript
   * // 単体テスト
   * const manager = new ControllerManager();
   * await manager.updateAnneiList();
   *
   * // デバッグ（特定のコントローラーでエラーが発生した場合）
   * try {
   *   await manager.updateAnneiList();
   * } catch (error) {
   *   console.error('Annei一覧更新でエラー:', error);
   * }
   * ```
   * @returns {Promise<void>}
   */
  async updateAnneiList() {
    console.group('ControllerManager.updateAnneiList start');

    try {
      await this.annei.list();
      console.log('ControllerManager.updateAnneiList completed successfully');
    } catch (error) {
      console.error('ControllerManager.updateAnneiList error:', error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }

  /**
   * Annei詳細更新（デバッグ・単体テスト用）
   *
   * 使用例:
   * ```javascript
   * // 単体テスト
   * const manager = new ControllerManager();
   * await manager.updateAnneiDetail();
   *
   * // デバッグ（詳細データの取得・保存を個別に確認）
   * try {
   *   await manager.updateAnneiDetail();
   * } catch (error) {
   *   console.error('Annei詳細更新でエラー:', error);
   * }
   * ```
   * @returns {Promise<void>}
   */
  async updateAnneiDetail() {
    console.group('ControllerManager.updateAnneiDetail start');

    try {
      await this.annei.detail();
      console.log('ControllerManager.updateAnneiDetail completed successfully');
    } catch (error) {
      console.error('ControllerManager.updateAnneiDetail error:', error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }

  /**
   * YKF一覧更新（デバッグ・単体テスト用）
   *
   * 使用例:
   * ```javascript
   * // 単体テスト
   * const manager = new ControllerManager();
   * await manager.updateYkfList();
   *
   * // デバッグ（YKF一覧の取得・保存を個別に確認）
   * try {
   *   await manager.updateYkfList();
   * } catch (error) {
   *   console.error('YKF一覧更新でエラー:', error);
   * }
   * ```
   * @returns {Promise<void>}
   */
  async updateYkfList() {
    console.group('ControllerManager.updateYkfList start');

    try {
      await this.ykf.list();
      console.log('ControllerManager.updateYkfList completed successfully');
    } catch (error) {
      console.error('ControllerManager.updateYkfList error:', error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }

  /**
   * YKF詳細更新（デバッグ・単体テスト用）
   *
   * 使用例:
   * ```javascript
   * // 単体テスト
   * const manager = new ControllerManager();
   * await manager.updateYkfDetail();
   *
   * // デバッグ（YKF詳細データの取得・保存を個別に確認）
   * try {
   *   await manager.updateYkfDetail();
   * } catch (error) {
   *   console.error('YKF詳細更新でエラー:', error);
   * }
   * ```
   * @returns {Promise<void>}
   */
  async updateYkfDetail() {
    console.group('ControllerManager.updateYkfDetail start');

    try {
      await this.ykf.detail();
      console.log('ControllerManager.updateYkfDetail completed successfully');
    } catch (error) {
      console.error('ControllerManager.updateYkfDetail error:', error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }

  /**
   * YKF時間・アナウンス更新（デバッグ・単体テスト用）
   *
   * 使用例:
   * ```javascript
   * // 単体テスト
   * const manager = new ControllerManager();
   * await manager.updateYkfTime();
   *
   * // デバッグ（YKF時間・アナウンスの取得・保存を個別に確認）
   * try {
   *   await manager.updateYkfTime();
   * } catch (error) {
   *   console.error('YKF時間・アナウンス更新でエラー:', error);
   * }
   * ```
   * @returns {Promise<void>}
   */
  async updateYkfTime() {
    console.group('ControllerManager.updateYkfTime start');

    try {
      await this.ykf.time();
      console.log('ControllerManager.updateYkfTime completed successfully');
    } catch (error) {
      console.error('ControllerManager.updateYkfTime error:', error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }

  /**
   * Weather全更新（デバッグ・単体テスト用）
   *
   * 使用例:
   * ```javascript
   * // 単体テスト
   * const manager = new ControllerManager();
   * await manager.updateWeatherAll();
   *
   * // デバッグ（Weather全処理の取得・保存を個別に確認）
   * try {
   *   await manager.updateWeatherAll();
   * } catch (error) {
   *   console.error('Weather全更新でエラー:', error);
   * }
   * ```
   * @returns {Promise<void>}
   */
  async updateWeatherAll() {
    console.group('ControllerManager.updateWeatherAll start');

    try {
      await this.weather.yahoo();
      await this.weather.tenkijp();
      await this.weather.hourly();
      console.log('ControllerManager.updateWeatherAll completed successfully');
    } catch (error) {
      console.error('ControllerManager.updateWeatherAll error:', error);
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
    console.group('ControllerManager.updateYahooWeather start');

    try {
      await this.weather.yahoo();
      console.log('ControllerManager.updateYahooWeather completed successfully');
    } catch (error) {
      console.error('ControllerManager.updateYahooWeather error:', error);
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
    console.group('ControllerManager.updateTenkijpWeather start');

    try {
      await this.weather.tenkijp();
      console.log('ControllerManager.updateTenkijpWeather completed successfully');
    } catch (error) {
      console.error('ControllerManager.updateTenkijpWeather error:', error);
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
    console.group('ControllerManager.updateHourlyWeather start');

    try {
      await this.weather.hourly();
      console.log('ControllerManager.updateHourlyWeather completed successfully');
    } catch (error) {
      console.error('ControllerManager.updateHourlyWeather error:', error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }
}

module.exports = ControllerManager;
