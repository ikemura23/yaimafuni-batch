const PortMapper = require('../../common/port-mapper');
const StatusMapper = require('../../common/status-mapper');

/**
 * YKF一覧のデータ変換処理
 */
class ListTransformer {
  /**
   * 生データから送信用の値を作成する
   * @param {Array} contentList - スクレイピングした生データ
   * @returns {Object} 送信用データ
   */
  static transformListData(contentList) {
    console.group('ListTransformer.transformListData start');

    try {
      const returnData = {};

      for (const data of contentList) {
        const portName = data.port;
        const portCode = PortMapper.getPortCode(portName, 'ykf');
        const statusText = data.status; // 記号文字、◯や△や☓など

        if (portCode) {
          const portData = {
            comment: '',
            portCode: portCode,
            portName: portName,
            status: StatusMapper.getStatus(statusText, 'ykf'),
          };
          returnData[portCode] = portData;
        }
      }

      return returnData;
    } catch (error) {
      console.error('ListTransformer.transformListData error:', error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }

  /**
   * 港名から港コードを返す（後方互換性のため残す）
   * @param {string} portName - 港名
   * @returns {string} 港コード
   * @deprecated PortMapper.getPortCode() を使用してください
   */
  static getPortCode(portName) {
    console.group('ListTransformer.getPortCode start');

    try {
      const result = PortMapper.getPortCode(portName, 'ykf');
      return result;
    } catch (error) {
      console.error('ListTransformer.getPortCode error:', error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }

  /**
   * 記号から運行ステータスを判別（後方互換性のため残す）
   * @param {string} kigou - 記号
   * @returns {Object} ステータスオブジェクト
   * @deprecated StatusMapper.getStatus() を使用してください
   */
  static getStatusCode(kigou) {
    console.group('ListTransformer.getStatusCode start');

    try {
      const result = StatusMapper.getStatus(kigou, 'ykf');
      return result;
    } catch (error) {
      console.error('ListTransformer.getStatusCode error:', error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }
}

module.exports = ListTransformer;
