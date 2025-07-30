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
    // 詳細データは既に適切な形式になっているため、最小限の変換のみ
    return scrapedData;
  }

  /**
   * 記号からステータスを取得（後方互換性のため残す）
   * @param {string} statusRawText - 生のステータステキスト
   * @returns {string} ステータスコード
   * @deprecated StatusMapper.getStatusCode() を使用してください
   */
  static getRowStatusCode(statusRawText) {
    return StatusMapper.getStatusCode(statusRawText, 'ykf');
  }

  /**
   * 記号からステータス文字を取得（後方互換性のため残す）
   * @param {string} statusRawText - 生のステータステキスト
   * @returns {string} ステータステキスト
   * @deprecated StatusMapper.getStatusText() を使用してください
   */
  static getRowStatusText(statusRawText) {
    return StatusMapper.getStatusText(statusRawText, 'ykf');
  }
}

module.exports = DetailTransformer;
