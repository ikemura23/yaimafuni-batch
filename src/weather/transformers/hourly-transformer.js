/**
 * 時間別天気データの変換を担当するクラス
 */
class HourlyTransformer {
  /**
   * APIレスポンスを保存用データ形式に変換
   * @param {Object} apiResponse - APIレスポンスのJSONオブジェクト
   * @returns {Object} 保存用データ形式（日付でグルーピング）
   */
  transform(apiResponse) {
    console.log('HourlyTransformer.transform start');

    try {
      const data = this.mapToData(
        apiResponse.hourly.time,
        apiResponse.hourly.weathercode,
        apiResponse.hourly.windspeed_10m,
        apiResponse.hourly.winddirection_10m
      );

      const dateGroupList = this.groupBy(data, 'date');

      console.log('HourlyTransformer.transform end');
      return dateGroupList;
    } catch (error) {
      console.error('HourlyTransformer.transform error:', error);
      throw error;
    }
  }

  /**
   * APIレスポンスからオブジェクト型に変換
   * @param {Array} timeList - 日時配列
   * @param {Array} weatherCodeList - 天気コード配列
   * @param {Array} windSpeedList - 風速配列
   * @param {Array} windDirectionList - 風向き配列
   * @returns {Array<Object>} 変換後のデータ配列
   */
  mapToData(timeList, weatherCodeList, windSpeedList, windDirectionList) {
    const result = [];

    timeList.forEach((time, i) => {
      result[i] = {
        date: time.substring(0, 10), // YYYY-MM-DD までを取得して、後にgroupByのキーに使う
        dateTime: time,
        weatherCode: weatherCodeList[i],
        cardinalDirection: this.calculateCardinalDirection(windDirectionList[i]),
        windSpeed: windSpeedList[i],
      };
    });

    return result;
  }

  /**
   * 風向の数値から方角を計算
   * @param {number} windDirection - 風向の値（0〜360）
   * @returns {string} 方角
   */
  calculateCardinalDirection(windDirection) {
    const cardinalDirection = [
      '北',
      '北北東',
      '北東',
      '東北東',
      '東',
      '東南東',
      '南東',
      '南南東',
      '南',
      '南南西',
      '南西',
      '西南西',
      '西',
      '西北西',
      '北西',
      '北北西',
      '北',
    ];

    const directionIndex = Math.round(windDirection / 22.5);
    return cardinalDirection[directionIndex];
  }

  /**
   * 指定されたキーでグルーピング
   * @param {Array} xs - データ配列
   * @param {string} key - グルーピングするキー
   * @returns {Object} グルーピングされたオブジェクト
   */
  groupBy(xs, key) {
    return xs.reduce((rv, x) => {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  }
}

module.exports = HourlyTransformer;
