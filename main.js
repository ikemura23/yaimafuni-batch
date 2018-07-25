const firebase = require("firebase");
const config = require("./config/config.js");
const firebaseConfig = {
  databaseURL: config.firebase.databaseURL
};
firebase.initializeApp(firebaseConfig);

console.log('main init')

const AneiList = require('./list_anei.js');
const YkfList = require('./list_ykf.js');

const AneiDetail = require('./detail_anei.js');
const YkfDetail = require('./detail_ykf.js');

const topCompany = require('./top_company.js');
const topPort = require('./top_port.js');
const weather = require('./weather/weather.js');
const tenkijp = require('./weather/tenkijp.js');

const aneiListAndroid = require('./list_anei_android.js');
const ykfListAndroid = require('./list_ykf_android.js');
const weatherAndroid = require('./weather/weahter_android.js');
const topAndroid = require('./top_android.js');

// const slack = require('./slack');

Promise.resolve()
  .then(() => console.log('main start'))
  .then(() => AneiList())
  .then(() => YkfList())
  .then(() => AneiDetail())
  .then(() => YkfDetail())
  .then(() => weather())
  .then(() => topPort())
  .then(() => topCompany())
  .then(() => tenkijp())
  .then(() => aneiListAndroid())
  .then(() => ykfListAndroid())
  .then(() => weatherAndroid())
  .then(() => topAndroid())
  .then(() => firebase.database().goOffline())
  .then(() => console.log('main finish'))