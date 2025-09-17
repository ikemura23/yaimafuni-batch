/**
 * Yahoo天気データの変換を担当するクラス
 */
class YahooTransformer {
  /**
   * スクレイピングデータを保存用データ形式に変換
   * @param {Object} data - スクレイピングで取得した生データ
   * @returns {Object} 保存用データ形式
   */
  transform(data) {
    console.log('YahooTransformer.transform start');

    try {
      // 既存のデータ形式をそのまま維持
      // 必要に応じてデータの検証や整形を行う
      const transformedData = {
        today: this.validateAndTransform(data.today),
        tomorrow: this.validateAndTransform(data.tomorrow),
      };

      console.log('YahooTransformer.transform end');
      return transformedData;
    } catch (error) {
      console.error('YahooTransformer.transform error:', error);
      throw error;
    }
  }

  /**
   * 個別の天気データを検証・変換
   * @param {Object} weatherData - 天気データ
   * @returns {Object} 検証・変換後のデータ
   */
  validateAndTransform(weatherData) {
    if (!weatherData) {
      throw new Error('Weather data is required');
    }

    // 必須フィールドの存在確認
    const requiredFields = ['date', 'weather', 'temperature', 'wave', 'wind'];
    for (const field of requiredFields) {
      if (!weatherData[field]) {
        console.warn(`Missing required field: ${field}`);
      }
    }

    // データの整形（既存形式を維持）
    return {
      date: weatherData.date || '',
      weather: weatherData.weather || '',
      temperature: {
        hight: weatherData.temperature?.hight || '',
        low: weatherData.temperature?.low || '',
      },
      wave: weatherData.wave || '',
      wind: weatherData.wind || '',
    };
  }
}

module.exports = YahooTransformer;
