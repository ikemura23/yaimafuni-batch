const getHourlyWeather = require('./getHourlyWeather');
const saveHourlyWeather = require('./saveHourlyWeather');

const updateHourlyWeather = async () => {
  console.group('updateHourlyWeather start');

  // 取得
  const value = await getHourlyWeather();
  // 保存
  await saveHourlyWeather(value);

  console.group('updateHourlyWeather end');
  console.groupEnd();
};

module.exports = updateHourlyWeather;
