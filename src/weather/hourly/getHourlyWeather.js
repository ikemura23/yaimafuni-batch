/**
 * Weather Forecast API https://open-meteo.com/en/docs
 * から天気情報を取得して、オブジェクト型に整形して返す
 *
 * @returns {Object} 日時、天気コード、風速、風向き
 *
 */
const getHourlyWeather = async () => {
  console.group("getHourlyWeather start");
  try {
    const responseJson = await getWeatherForecastApi();
    const parsedObj = JSON.parse(JSON.stringify(responseJson)); // JSON.stringifyがないとパースエラーになる

    const data = mapToData(
      parsedObj.hourly.time,
      parsedObj.hourly.weathercode,
      parsedObj.hourly.windspeed_10m,
      parsedObj.hourly.winddirection_10m
    );
    const dateGroupList = groupBy(data, "date");
    return dateGroupList;
  } catch (e) {
    console.error(e);
  } finally {
    console.log("getHourlyWeather end");
    console.groupEnd();
  }
};

/**
 * Weather Forecast API から天気情報を取得する
 * @returns jsonをシリアライズしたオブジェクト
 */
const getWeatherForecastApi = async () => {
  const API_URL =
    "https://api.open-meteo.com/v1/jma?latitude=24.34&longitude=124.16&hourly=weathercode,windspeed_10m,winddirection_10m&current_weather=true&windspeed_unit=ms&timezone=Asia%2FTokyo";

  return await (await fetch(API_URL)).json();
};

/**
 * APIレスポンス Jsonからオブジェクト型に変換する
 * @param {Array} timeList 日時
 * @param {Array} weatherCodeList 天気コード
 * @param {Array} windSpeedList 風速
 * @param {Array} windDirectionList 風向き
 * @returns {Object} 必要な値(日時、天気コード、風速、風向き)のみの値
 */
function mapToData(
  timeList,
  weatherCodeList,
  windSpeedList,
  windDirectionList
) {
  const result = [];

  timeList.forEach((time, i) => {
    result[i] = {
      date: time.substring(0, 10), // YYYY-MM-DD までを取得して、後にgorupByのキーに使う
      dateTime: time,
      weatherCode: weatherCodeList[i],
      cardinalDirection: calculateCardinalDirection(windDirectionList[i]),
      windSpeed: windSpeedList[i],
    };
  });
  return result;
}

/**
 * 風向の数値の値から、方角を計算して返す
 * @param {String} windDirection 風向の値、0〜360の間になる
 * @returns {string} 方角
 */
function calculateCardinalDirection(windDirection) {
  const cardinalDirection = [
    "北",
    "北北東",
    "北東",
    "東北東",
    "東",
    "東南東",
    "南東",
    "南南東",
    "南",
    "南南西",
    "南西",
    "西南西",
    "西",
    "西北西",
    "北西",
    "北北西",
    "北",
  ];
  const directionIndex = Math.round(windDirection / 22.5);
  return cardinalDirection[directionIndex];
}

/**
 * 指定された値(key)でグルーピングして返す
 * @param {Object} xs
 * @param {string} key グルーピングする値
 * @returns {Array<Object>} グルーピングされたList
 */
const groupBy = function (xs, key) {
  return xs.reduce(function (rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

module.exports = getHourlyWeather;
