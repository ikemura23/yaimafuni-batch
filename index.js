exports.handler = async function (event, context) {
  try {
    const firebase = require("firebase");
    const config = require("./src/config/config.js");
    const firebaseConfig = {
      databaseURL: config.firebase.databaseURL,
    };
    firebase.initializeApp(firebaseConfig);

    console.log("main init");

    const updateAnneiList = require("./src/list/updateAnneiList");
    const updateAnneiDetail = require("./src/detail/updateAnneiDetail");

    const YkfList = require("./src/list/ykf/ykf_list.js");
    const ykfTime = require("./src/list/ykf/ykf_time_and_announce.js");

    const ykfDetail = require("./src/detail/ykf/detail_ykf.js");

    const topCompany = require("./src/top/top_company.js");
    const topPort = require("./src/top/top_port.js");
    const yahoo = require("./src/weather/yahoo.js");
    const tenkijp = require("./src/weather/tenkijp.js");
    const tyhoon = require("./src/typhoon/tenkijp.js");

    // １時間おきの天気
    const updateHourlyWeather = require("./src/weather/hourly/updateHourlyWeather");

    // const slack = require('./slack');

    (async () => {
      console.group("main start");
      await updateAnneiList();
      await updateAnneiDetail();
      await YkfList();
      await ykfTime();
      await ykfDetail();
      await tyhoon();
      await yahoo();
      await topPort();
      await topCompany();
      await tenkijp();
      await updateHourlyWeather();
      await firebase.database().goOffline();
      console.groupEnd();
      console.log("main finish");
    })();
  } catch (err) {
    console.log("Error happended: ", err);
  }
};
