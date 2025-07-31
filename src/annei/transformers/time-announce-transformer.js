/**
 * Annei時間・アナウンスデータの変換処理
 */
class TimeAnnounceTransformer {
  /**
   * 時間・アナウンスデータを変換
   * @param {Object} rawData - 生のスクレイピングデータ
   * @returns {Object} 変換後のデータ
   */
  static transformTimeAndAnnounceData(rawData) {
    console.group('TimeAnnounceTransformer.transformTimeAndAnnounceData start');
    
    try {
      // 現在のAnneiの時間・アナウンスデータは単純な構造なので、
      // 特別な変換処理は不要。必要に応じて追加の処理を実装
      
      const transformedData = {
        updateTime: rawData.updateTime || '',
        comment: rawData.comment || '',
      };
      
      return transformedData;
    } catch (error) {
      console.error('TimeAnnounceTransformer.transformTimeAndAnnounceData error:', error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }
}

module.exports = TimeAnnounceTransformer; 