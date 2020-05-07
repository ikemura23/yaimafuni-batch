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

const aneiDetail = require('./detail/detail_anei.js');
const ykfDetail = require('./detail/detail_ykf.js');

const topCompany = require('./top/top_company.js');
const topPort = require('./top/top_port.js');
const yahoo = require('./weather/yahoo.js');
const tenkijp = require('./weather/tenkijp.js');
const tyhoon = require('./typhoon/tenkijp.js');

// const slack = require('./slack');

Promise.resolve()
  .then(() => console.log('main start'))
  .then(() => aneiList())
  .then(() => YkfList())
  .then(() => ykfTime())
  .then(() => aneiDetail())
  .then(() => ykfDetail())
  .then(() => tyhoon())
  .then(() => yahoo())
  .then(() => topPort())
  .then(() => topCompany())
  .then(() => tenkijp())
  .then(() => firebase.database().goOffline())
  .then(() => console.log('main finish'))