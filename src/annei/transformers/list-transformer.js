const PortMapper = require('../../common/port-mapper');
const StatusMapper = require('../../common/status-mapper');

/**
 * Annei一覧データの変換処理
 */
class ListTransformer {
  /**
   * 一覧データを変換
   * @param {Object} rawData - 生のスクレイピングデータ
   * @returns {Object} 変換後のデータ
   */
  static transformListData(rawData) {
    console.group('ListTransformer.transformListData start');

    try {
      const transformedData = {};

      for (const [portKey, portData] of Object.entries(rawData)) {
        transformedData[portKey] = {
          ...portData,
          // 港名から港コードへの変換（既に設定されている場合はそのまま使用）
          portCode: portData.portCode || PortMapper.getPortCode(portData.portName, 'anei'),
          // ステータスの正規化（必要に応じて）
          status: this.normalizeStatus(portData.status),
        };
      }

      return transformedData;
    } catch (error) {
      console.error('ListTransformer.transformListData error:', error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }

  /**
   * ステータスを正規化
   * @param {Object} status - ステータスオブジェクト
   * @returns {Object} 正規化されたステータスオブジェクト
   */
  static normalizeStatus(status) {
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
   * 港名から港コードを取得（非推奨 - PortMapperを使用してください）
   * @deprecated PortMapper.getPortCode() を使用してください
   * @param {string} portName - 港名
   * @returns {string} 港コード
   */
  static getPortCode(portName) {
    console.warn('ListTransformer.getPortCode is deprecated. Use PortMapper.getPortCode() instead.');
    return PortMapper.getPortCode(portName, 'anei');
  }

  /**
   * ステータス記号からステータスコードを取得（非推奨 - StatusMapperを使用してください）
   * @deprecated StatusMapper.getStatusCode() を使用してください
   * @param {string} symbol - ステータス記号
   * @returns {string} ステータスコード
   */
  static getStatusCode(symbol) {
    console.warn('ListTransformer.getStatusCode is deprecated. Use StatusMapper.getStatusCode() instead.');
    return StatusMapper.getStatusCode(symbol, 'anei');
  }
}

module.exports = ListTransformer;
