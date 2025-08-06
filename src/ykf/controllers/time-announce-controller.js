const TimeAnnounceScraper = require('../scrapers/time-announce-scraper');
const TimeAnnounceTransformer = require('../transformers/time-announce-transformer');
const repository = require('../../repository/firebase_repository');
const firestoreRepository = require('../../repository/firestoreRepository.js');
const consts = require('../../consts.js');
const sendError = require('../../slack');

/**
 * YKF時間・アナウンス関連の統合コントローラー
 */
class TimeAnnounceController {
  /**
   * 更新時間とコメントデータを取得（既存のgetYkfUpdateTimeAndCommentと同等）
   * @returns {Promise<Object>} 更新時間とコメントデータ
   */
  static async getYkfUpdateTimeAndComment() {
    console.group('TimeAnnounceController.getYkfUpdateTimeAndComment start');

    try {
      const rawData = await TimeAnnounceScraper.scrapeTimeAndAnnounceData();
      const transformedData = TimeAnnounceTransformer.transformTimeAndAnnounceData(rawData);

      return transformedData;
    } catch (error) {
      console.error('TimeAnnounceController.getYkfUpdateTimeAndComment error:', error);
      sendError(error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }

  /**
   * 更新時間とコメントデータを保存（既存のsaveYkfUpdateTimeAndCommentと同等）
   * @param {Object} value - 保存するデータ
   * @returns {Promise<void>}
   */
  static async saveYkfUpdateTimeAndComment(value) {
    console.group('TimeAnnounceController.saveYkfUpdateTimeAndComment start');

    try {
      await repository.update(consts.YKF, value);
      await firestoreRepository.update(consts.YKF, value);
    } catch (error) {
      console.error('TimeAnnounceController.saveYkfUpdateTimeAndComment error:', error);
      sendError(error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }

  /**
   * 更新時間とコメントデータを更新（既存のupdateYkfUpdateTimeAndCommentと同等）
   * @returns {Promise<void>}
   */
  static async updateYkfUpdateTimeAndComment() {
    console.group('TimeAnnounceController.updateYkfUpdateTimeAndComment start');

    try {
      const value = await TimeAnnounceController.getYkfUpdateTimeAndComment();
      await TimeAnnounceController.saveYkfUpdateTimeAndComment(value);

      console.log('TimeAnnounceController.updateYkfUpdateTimeAndComment end');
    } catch (error) {
      console.error('TimeAnnounceController.updateYkfUpdateTimeAndComment error:', error);
      sendError(error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }
}

// 既存のインターフェースを維持するためのエクスポート
module.exports = {
  getYkfUpdateTimeAndComment: TimeAnnounceController.getYkfUpdateTimeAndComment,
  saveYkfUpdateTimeAndComment: TimeAnnounceController.saveYkfUpdateTimeAndComment,
  updateYkfUpdateTimeAndComment: TimeAnnounceController.updateYkfUpdateTimeAndComment,
};
