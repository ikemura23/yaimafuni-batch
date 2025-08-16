/**
 * 時間別天気のAPI呼び出しを担当するクラス
 */
class HourlyScraper {
  constructor() {
    this.apiUrl = 'https://api.open-meteo.com/v1/jma?latitude=24.34&longitude=124.16&hourly=weathercode,windspeed_10m,winddirection_10m&current_weather=true&windspeed_unit=ms&timezone=Asia%2FTokyo';
  }

  /**
   * Open-Meteo APIから天気情報を取得
   * @returns {Promise<Object>} APIレスポンスのJSONオブジェクト
   */
  async fetchWeather() {
    console.log('HourlyScraper.fetchWeather start');
    
    try {
      const response = await fetch(this.apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseJson = await response.json();
      const parsedObj = JSON.parse(JSON.stringify(responseJson)); // JSON.stringifyがないとパースエラーになる
      
      console.log('HourlyScraper.fetchWeather end');
      return parsedObj;
    } catch (error) {
      console.error('HourlyScraper.fetchWeather error:', error);
      throw error;
    }
  }
}

module.exports = HourlyScraper;
