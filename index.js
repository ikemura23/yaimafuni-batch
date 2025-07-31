exports.handler = async function () {
  let admin;
  try {
    admin = require('firebase-admin');
    const config = require('./src/config/config.js');

    // Initialize Firebase Admin if not already initialized
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(require('./serviceAccountKey.json')),
        databaseURL: config.firebase.databaseURL,
      });
    }

    console.log('main init');

    const updateAnneiList = require('./src/annei/controllers/list-controller.js').updateAnneiList;
    const updateAnneiDetail = require('./src/annei/controllers/detail-controller.js').updateAnneiDetail;

    const YkfList = require('./src/ykf/controllers/list-controller.js');
    const ykfTime = require('./src/ykf/controllers/time-announce-controller.js');

    const ykfDetail = require('./src/ykf/controllers/detail-controller.js');

    const topCompany = require('./src/top/top_company.js');
    const topPort = require('./src/top/top_port.js');
    const yahoo = require('./src/weather/yahoo.js');
    const tenkijp = require('./src/weather/tenkijp.js');
    const tyhoon = require('./src/typhoon/tenkijp.js');

    // １時間おきの天気
    const updateHourlyWeather = require('./src/weather/hourly/updateHourlyWeather');

    // const slack = require('./slack');

    console.group('main start');
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
    console.groupEnd();
    console.log('main finish');
  } catch (err) {
    console.log('Error happended: ', err);
  } finally {
    // Firebase接続を適切に終了
    if (admin && admin.apps.length > 0) {
      await admin.app().delete();
    }
  }
};
