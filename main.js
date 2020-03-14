const firebase = require("firebase");
const config = require("./config/config.js");
const firebaseConfig = {
  databaseURL: config.firebase.databaseURL
};
firebase.initializeApp(firebaseConfig);

console.log('main init')

const aneiList = require('./list/anei_list.js');
const YkfList = require('./list/ykf_list.js');
const ykfTime = require('./list/ykf_time_and_announce.js');

// const AneiDetail = require('./detail/detail_anei.js');
const ykfDetail = require('./detail/detail_ykf.js');

const topCompany = require('./top/top_company.js');
const topPort = require('./top/top_port.js');
const yahoo = require('./weather/yahoo.js');
const tenkijp = require('./weather/tenkijp.js');
const tyhoon = require('./typhoon/tenkijp.js');

// const aneiListAndroid = require('./list/list_anei_android.js');
// const ykfListAndroid = require('./list/list_ykf_android.js');
// const weatherAndroid = require('./weather/weahter_android.js');
// const topAndroid = require('./top/top_android.js');

// const slack = require('./slack');

Promise.resolve()
  .then(() => console.log('main start'))
  .then(() => aneiList())
  .then(() => ykfTime())
  .then(() => YkfList())
  // .then(() => AneiDetail())
  .then(() => ykfDetail())
  .then(() => tyhoon())
  .then(() => yahoo())
  .then(() => topPort())
  .then(() => topCompany())
  .then(() => tenkijp())
  // .then(() => aneiListAndroid())
  // .then(() => ykfListAndroid())
  // .then(() => weatherAndroid())
  // .then(() => topAndroid())
  .then(() => firebase.database().goOffline())
  .then(() => console.log('main finish'))