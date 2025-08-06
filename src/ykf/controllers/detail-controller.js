// YKF 詳細
const DetailScraper = require('../scrapers/detail-scraper');
const DetailTransformer = require('../transformers/detail-transformer');
const repository = require('../../repository/firebase_repository');
const firestoreRepository = require('../../repository/firestoreRepository.js');
const consts = require('../../consts.js');
const sendError = require('../../slack');

/**
 * YKF詳細関連の統合コントローラー
 */
class DetailController {
  /**
   * 詳細データを取得（既存のgetYkfDetailと同等）
   * @returns {Promise<Object>} 詳細データ
   */
  static async getYkfDetail() {
    console.group('DetailController.getYkfDetail start');

    try {
      const rawData = await DetailScraper.scrapeDetailData();
      const transformedData = DetailTransformer.transformDetailData(rawData);

      return transformedData;
    } catch (error) {
      console.error('DetailController.getYkfDetail error:', error);
      sendError(error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }

  /**
   * 詳細データを保存（既存のsaveYkfDetailと同等）
   * @param {Object} value - 保存するデータ
   * @returns {Promise<void>}
   */
  static async saveYkfDetail(value) {
    console.group('DetailController.saveYkfDetail start');

    try {
      const tableName = `${consts.YKF}_timeTable/`;
      await repository.update(tableName, value);
      await firestoreRepository.update(tableName, value);
    } catch (error) {
      console.error('DetailController.saveYkfDetail error:', error);
      sendError(error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }

  /**
   * 詳細データを更新（既存のupdateYkfDetailと同等）
   * @returns {Promise<void>}
   */
  static async updateYkfDetail() {
    console.group('DetailController.updateYkfDetail start');

    try {
      const value = await DetailController.getYkfDetail();

      if (value != null) {
        await DetailController.saveYkfDetail(value);
      } else {
        console.log('dataが null のため送信しない');
      }

      console.log('DetailController.updateYkfDetail end');
    } catch (error) {
      console.error('DetailController.updateYkfDetail error:', error);
      sendError(error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }
}

// 既存のインターフェースを維持するためのエクスポート
module.exports = {
  getYkfDetail: DetailController.getYkfDetail,
  saveYkfDetail: DetailController.saveYkfDetail,
  updateYkfDetail: DetailController.updateYkfDetail,
};
