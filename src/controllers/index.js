/**
 * コントローラー管理クラス
 * anneiとykfのコントローラーを統合管理し、テスト容易性と保守性を向上させる
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

      console.log('ControllerManager.updateAll completed successfully');
    } catch (error) {
      console.error('ControllerManager.updateAll error:', error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }

  /**
   * Annei一覧更新（テスト用）
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
   * Annei詳細更新（テスト用）
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
   * YKF一覧更新（テスト用）
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
   * YKF詳細更新（テスト用）
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
   * YKF時間・アナウンス更新（テスト用）
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
}

module.exports = ControllerManager;
