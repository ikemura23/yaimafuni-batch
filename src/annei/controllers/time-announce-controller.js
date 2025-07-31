const TimeAnnounceScraper = require('../scrapers/time-announce-scraper');
const TimeAnnounceTransformer = require('../transformers/time-announce-transformer');
const sendError = require('../../slack');

/**
 * Annei時間・アナウンス関連の統合コントローラー
 */
class TimeAnnounceController {
  /**
   * 更新時間とコメントを取得（既存のgetAnneiUpdateTimeAndCommentと同等）
   * @returns {Promise<Object>} 更新時間とコメントデータ
   */
  static async getAnneiUpdateTimeAndComment() {
    console.group('TimeAnnounceController.getAnneiUpdateTimeAndComment start');

    try {
      const rawData = await TimeAnnounceScraper.scrapeTimeAndAnnounceData();
      const transformedData =
        TimeAnnounceTransformer.transformTimeAndAnnounceData(rawData);

      return transformedData;
    } catch (error) {
      console.error(
        'TimeAnnounceController.getAnneiUpdateTimeAndComment error:',
        error,
      );
      sendError(error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }
}

// 既存のインターフェースを維持するためのエクスポート
module.exports = {
  getAnneiUpdateTimeAndComment:
    TimeAnnounceController.getAnneiUpdateTimeAndComment,
};
