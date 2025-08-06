/**
 * YKF時間・アナウンスのデータ変換処理
 */
class TimeAnnounceTransformer {
  /**
   * スクレイピングデータから送信用データに変換する
   * @param {Object} scrapedData - スクレイピングしたデータ
   * @param {string} scrapedData.updateTime - 更新日時
   * @param {string} scrapedData.announce - アナウンス
   * @param {string} scrapedData.announce2 - アナウンス2
   * @returns {Object} 送信用データ
   */
  static transformTimeAndAnnounceData(scrapedData) {
    console.group('TimeAnnounceTransformer.transformTimeAndAnnounceData start');

    try {
      const { updateTime, announce, announce2 } = scrapedData;

      // 送信用の変数
      const data = {
        comment: announce2 ? `${announce}\n${announce2}` : announce,
        updateTime: updateTime,
      };

      return data;
    } catch (error) {
      console.error('TimeAnnounceTransformer.transformTimeAndAnnounceData error:', error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }
}

module.exports = TimeAnnounceTransformer;
