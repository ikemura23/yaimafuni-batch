const firebase = require("firebase");
const config = require("./config.json");
const firebaseConfig = {
  databaseURL: config.firebase.databaseURL
};
firebase.initializeApp(firebaseConfig);

console.log('main init')

const AneiList = require('./list_anei.js');
const YkfList = require('./list_ykf.js');
const DreamList = require('./list_dream.js');

const AneiDetail = require('./detail_anei.js');
const YkfDetail = require('./detail_ykf.js');

// const topCompany = require('./top_company.js');
const topPort = require('./top_port.js');
const weather = require('./weather.js');
const tenkijp = require('./tenkijp.js');

const aneiListAndroid = require('./list_anei_android.js');
const ykfListAndroid = require('./list_ykf_android.js');
const dreamListAndroid = require('./list_dream_android.js');

// const slack = require('./slack');

Promise.resolve()
  .then(() => console.log('main start'))
  // .then(() => AneiList())
  // .then(() => YkfList())
  // .then(() => DreamList())
  // .then(() => AneiDetail())
  // .then(() => YkfDetail())
  // .then(() => weather())
  // .then(() => topPort())
  // .then(() => tenkijp())
  // .then(() => aneiListAndroid())
  .then(() => ykfListAndroid())
  .then(() => dreamListAndroid())
  .then(() => firebase.database().goOffline())
  .then(() => console.log('main finish'))