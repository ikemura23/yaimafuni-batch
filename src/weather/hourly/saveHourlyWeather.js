const repository = require("../../repository/firebase_repository");

const saveHouryWeather = async (saveValue) => {
    console.group("saveHouryWeather start");
    const tableName = "hourly_weather/v1/"
  
    await repository.set(tableName, saveValue);
    
    console.group("saveHouryWeather end");
    console.groupEnd();
};

module.exports = saveHouryWeather;
