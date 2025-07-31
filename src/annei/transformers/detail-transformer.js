const StatusMapper = require('../../common/status-mapper');

/**
 * Annei詳細データの変換処理
 */
class DetailTransformer {
  /**
   * 詳細データを変換
   * @param {Object} rawData - 生のスクレイピングデータ
   * @returns {Object} 変換後のデータ
   */
  static transformDetailData(rawData) {
    console.group('DetailTransformer.transformDetailData start');

    try {
      const transformedData = {};

      for (const [portKey, portData] of Object.entries(rawData)) {
        transformedData[portKey] = {
          ...portData,
          // 行データのステータスを正規化
          row: portData.row
            ? portData.row.map((row) => ({
                ...row,
                status: this.normalizeRowStatus(row.status),
              }))
            : [],
        };
      }

      return transformedData;
    } catch (error) {
      console.error('DetailTransformer.transformDetailData error:', error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }

  /**
   * 行のステータスを正規化
   * @param {Object} status - ステータスオブジェクト
   * @returns {Object} 正規化されたステータスオブジェクト
   */
  static normalizeRowStatus(status) {
    if (!status) {
      return { code: '', text: '' };
    }

    // 既に正しい形式の場合はそのまま返す
    if (status.code && status.text) {
      return status;
    }

    // 記号からステータスに変換する場合
    if (typeof status === 'string') {
      return StatusMapper.getStatus(status, 'anei');
    }

    // デフォルト値
    return { code: '', text: '' };
  }

  /**
   * ステータスコードを取得（非推奨 - StatusMapperを使用してください）
   * @deprecated StatusMapper.getStatusCode() を使用してください
   * @param {string} statusText - ステータステキスト
   * @returns {string} ステータスコード
   */
  static getRowStatusCode(statusText) {
    console.warn('DetailTransformer.getRowStatusCode is deprecated. Use StatusMapper.getStatusCode() instead.');
    return StatusMapper.getStatusCode(statusText, 'anei');
  }

  /**
   * ステータス文字を取得（非推奨 - StatusMapperを使用してください）
   * @deprecated StatusMapper.getStatusText() を使用してください
   * @param {string} statusText - ステータステキスト
   * @returns {string} ステータス文字
   */
  static getRowStatusText(statusText) {
    console.warn('DetailTransformer.getRowStatusText is deprecated. Use StatusMapper.getStatusText() instead.');
    return StatusMapper.getStatusText(statusText, 'anei');
  }
}

module.exports = DetailTransformer;
