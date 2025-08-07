const StatusMapper = require('../../common/status-mapper');

/**
 * YKF詳細のデータ変換処理
 */
class DetailTransformer {
  /**
   * スクレイピングデータを変換する（詳細データは変換が最小限）
   * @param {Object} scrapedData - スクレイピングしたデータ
   * @returns {Object} 変換後のデータ
   */
  static transformDetailData(scrapedData) {
    console.group('DetailTransformer.transformDetailData start');

    try {
      // 詳細データは既に適切な形式になっているため、最小限の変換のみ
      return scrapedData;
    } catch (error) {
      console.error('DetailTransformer.transformDetailData error:', error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }

  /**
   * 記号からステータスを取得（後方互換性のため残す）
   * @param {string} statusRawText - 生のステータステキスト
   * @returns {string} ステータスコード
   * @deprecated StatusMapper.getStatusCode() を使用してください
   */
  static getRowStatusCode(statusRawText) {
    console.group('DetailTransformer.getRowStatusCode start');

    try {
      const result = StatusMapper.getStatusCode(statusRawText, 'ykf');
      return result;
    } catch (error) {
      console.error('DetailTransformer.getRowStatusCode error:', error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }

  /**
   * 記号からステータス文字を取得（後方互換性のため残す）
   * @param {string} statusRawText - 生のステータステキスト
   * @returns {string} ステータステキスト
   * @deprecated StatusMapper.getStatusText() を使用してください
   */
  static getRowStatusText(statusRawText) {
    console.group('DetailTransformer.getRowStatusText start');

    try {
      const result = StatusMapper.getStatusText(statusRawText, 'ykf');
      return result;
    } catch (error) {
      console.error('DetailTransformer.getRowStatusText error:', error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }
}

module.exports = DetailTransformer;
