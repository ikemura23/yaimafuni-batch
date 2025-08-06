const ListScraper = require('../scrapers/list-scraper');
const ListTransformer = require('../transformers/list-transformer');
const repository = require('../../repository/firebase_repository');
const firestoreRepository = require('../../repository/firestoreRepository.js');
const consts = require('../../consts.js');
const sendError = require('../../slack');

/**
 * YKF一覧関連の統合コントローラー
 */
class ListController {
  /**
   * 一覧データを取得（既存のgetYkfListと同等）
   * @returns {Promise<Object>} 一覧データ
   */
  static async getYkfList() {
    console.group('ListController.getYkfList start');

    try {
      const rawData = await ListScraper.scrapeListData();
      const transformedData = ListTransformer.transformListData(rawData);

      return transformedData;
    } catch (error) {
      console.error('ListController.getYkfList error:', error);
      sendError(error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }

  /**
   * 一覧データを保存（既存のsaveYkfListと同等）
   * @param {Object} value - 保存するデータ
   * @returns {Promise<void>}
   */
  static async saveYkfList(value) {
    console.group('ListController.saveYkfList start');

    try {
      await repository.set(consts.YKF, value);
      await firestoreRepository.set(consts.YKF, value);
    } catch (error) {
      console.error('ListController.saveYkfList error:', error);
      sendError(error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }

  /**
   * 一覧データを更新（既存のupdateYkfListと同等）
   * @param {Object} updateTimeAndComment - 更新時間とコメントデータ
   * @returns {Promise<void>}
   */
  static async updateYkfList(updateTimeAndComment = null) {
    console.group('ListController.updateYkfList start');

    try {
      // 更新時間とコメントが渡されていない場合は取得
      let timeAndComment = updateTimeAndComment;
      if (!timeAndComment) {
        // 時間・アナウンス関連のコントローラーから取得
        const TimeAnnounceController = require('./time-announce-controller');
        timeAndComment = await TimeAnnounceController.getYkfUpdateTimeAndComment();
      }

      const value = await ListController.getYkfList();

      const saveData = {
        updateTime: timeAndComment.updateTime,
        comment: timeAndComment.comment,
        ...value,
      };

      await ListController.saveYkfList(saveData);

      console.log('ListController.updateYkfList end');
    } catch (error) {
      console.error('ListController.updateYkfList error:', error);
      sendError(error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }
}

// 既存のインターフェースを維持するためのエクスポート
module.exports = {
  getYkfList: ListController.getYkfList,
  saveYkfList: ListController.saveYkfList,
  updateYkfList: ListController.updateYkfList,
};
