const DetailScraper = require('../scrapers/detail-scraper');
const DetailTransformer = require('../transformers/detail-transformer');
const repository = require('../../repository/firebase_repository');
const consts = require('../../consts.js');
const sendError = require('../../slack');

/**
 * Annei詳細関連の統合コントローラー
 */
class DetailController {
  /**
   * 詳細データを取得（既存のgetAnneiDetailと同等）
   * @returns {Promise<Object>} 詳細データ
   */
  static async getAnneiDetail() {
    console.group('DetailController.getAnneiDetail start');

    try {
      const rawData = await DetailScraper.scrapeDetailData();
      const transformedData = DetailTransformer.transformDetailData(rawData);

      return transformedData;
    } catch (error) {
      console.error('DetailController.getAnneiDetail error:', error);
      sendError(error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }

  /**
   * 詳細データを保存（既存のsaveAnneiDetailと同等）
   * @param {Object} value - 保存するデータ
   * @returns {Promise<void>}
   */
  static async saveAnneiDetail(value) {
    console.group('DetailController.saveAnneiDetail start');

    try {
      const tableName = `${consts.ANEI}_timeTable/`;

      await repository.set(tableName, value);

      console.log('DetailController.saveAnneiDetail end');
    } catch (error) {
      console.error('DetailController.saveAnneiDetail error:', error);
      sendError(error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }

  /**
   * 詳細データを更新（既存のupdateAnneiDetailと同等）
   * @returns {Promise<void>}
   */
  static async updateAnneiDetail() {
    console.group('DetailController.updateAnneiDetail start');

    try {
      // 取得
      const value = await DetailController.getAnneiDetail();

      // 保存
      await DetailController.saveAnneiDetail(value);

      console.log('DetailController.updateAnneiDetail end');
    } catch (error) {
      console.error('DetailController.updateAnneiDetail error:', error);
      sendError(error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }
}

// 既存のインターフェースを維持するためのエクスポート
module.exports = {
  getAnneiDetail: DetailController.getAnneiDetail,
  saveAnneiDetail: DetailController.saveAnneiDetail,
  updateAnneiDetail: DetailController.updateAnneiDetail,
};
