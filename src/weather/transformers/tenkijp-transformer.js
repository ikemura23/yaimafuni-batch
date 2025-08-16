/**
 * 天気.jpデータの変換を担当するクラス
 */
class TenkijpTransformer {
  /**
   * スクレイピングデータを保存用データ形式に変換
   * @param {Object} data - スクレイピングで取得した生データ
   * @returns {Object} 保存用データ形式
   */
  transform(data) {
    console.log('TenkijpTransformer.transform start');
    
    try {
      // 既存のデータ形式をそのまま維持
      const transformedData = {
        today: this.validateAndTransform(data.today),
        tomorrow: this.validateAndTransform(data.tomorrow)
      };

      console.log('TenkijpTransformer.transform end');
      return transformedData;
    } catch (error) {
      console.error('TenkijpTransformer.transform error:', error);
      throw error;
    }
  }

  /**
   * 個別の天気データを検証・変換
   * @param {Array<Object>} weatherDataArray - 天気データ配列
   * @returns {Array<Object>} 検証・変換後のデータ配列
   */
  validateAndTransform(weatherDataArray) {
    if (!Array.isArray(weatherDataArray)) {
      throw new Error('Weather data must be an array');
    }

    return weatherDataArray.map((item, index) => {
      if (!item) {
        console.warn(`Missing weather data at index ${index}`);
        return null;
      }

      // 必須フィールドの存在確認
      const requiredFields = ['hour', 'weather', 'windBlow', 'windSpeed'];
      for (const field of requiredFields) {
        if (!item[field]) {
          console.warn(`Missing required field: ${field} at index ${index}`);
        }
      }

      // データの整形（既存形式を維持）
      return {
        hour: item.hour || '',
        weather: item.weather || '',
        windBlow: item.windBlow || '',
        windSpeed: item.windSpeed || ''
      };
    }).filter(item => item !== null); // nullアイテムを除外
  }
}

module.exports = TenkijpTransformer;
