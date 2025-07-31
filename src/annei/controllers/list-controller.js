const ListScraper = require('../scrapers/list-scraper');
const ListTransformer = require('../transformers/list-transformer');
const repository = require('../../repository/firebase_repository');
const firestoreRepository = require('../../repository/firestoreRepository.js');
const consts = require('../../consts.js');
const sendError = require('../../slack');

/**
 * Annei一覧関連の統合コントローラー
 */
class ListController {
  /**
   * 一覧データを取得（既存のgetAnneiListと同等）
   * @returns {Promise<Object>} 一覧データ
   */
  static async getAnneiList() {
    console.group('ListController.getAnneiList start');

    try {
      const rawData = await ListScraper.scrapeListData();
      const transformedData = ListTransformer.transformListData(rawData);

      return transformedData;
    } catch (error) {
      console.error('ListController.getAnneiList error:', error);
      sendError(error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }

  /**
   * 一覧データを保存（既存のsaveAnneiListと同等）
   * @param {Object} value - 保存するデータ
   * @returns {Promise<void>}
   */
  static async saveAnneiList(value) {
    console.group('ListController.saveAnneiList start');

    try {
      await repository.set(consts.ANEI, value);
      await firestoreRepository.set(consts.ANEI, value);
    } catch (error) {
      console.error('ListController.saveAnneiList error:', error);
      sendError(error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }

  /**
   * 一覧データを更新（既存のupdateAnneiListと同等）
   * @param {Object} updateTimeAndComment - 更新時間とコメントデータ
   * @returns {Promise<void>}
   */
  static async updateAnneiList(updateTimeAndComment = null) {
    console.group('ListController.updateAnneiList start');

    try {
      // 更新時間とコメントが渡されていない場合は取得
      let timeAndComment = updateTimeAndComment;
      if (!timeAndComment) {
        // 時間・アナウンス関連のコントローラーから取得
        const TimeAnnounceController = require('./time-announce-controller');
        timeAndComment = await TimeAnnounceController.getAnneiUpdateTimeAndComment();
      }

      const value = await ListController.getAnneiList();

      const saveData = {
        updateTime: timeAndComment.updateTime,
        comment: timeAndComment.comment,
        hateruma: value.hateruma,
        hatoma: value.hatoma,
        kohama: value.kohama,
        kuroshima: value.kuroshima,
        oohara: value.oohara,
        taketomi: value.taketomi,
        uehara: value.uehara,
      };

      await ListController.saveAnneiList(saveData);

      console.log('ListController.updateAnneiList end');
    } catch (error) {
      console.error('ListController.updateAnneiList error:', error);
      sendError(error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }
}

// 既存のインターフェースを維持するためのエクスポート
module.exports = {
  getAnneiList: ListController.getAnneiList,
  saveAnneiList: ListController.saveAnneiList,
  updateAnneiList: ListController.updateAnneiList,
};
