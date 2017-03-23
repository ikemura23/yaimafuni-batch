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

const topCompany = require('./top_company');
const weather = require('./weather.js');
const topPort = require('./top_port');

const slack = require('./slack');

Promise.resolve()
  .then(() => console.log('main start'))
  .then(() => slack('バックエンド 起動'))
  .then(() => AneiList())
  .then(() => YkfList())
  .then(() => DreamList())
  .then(() => weather())
  .then(() => AneiDetail())
  .then(() => YkfDetail())
  .then(() => topCompany())
  .then(() => topPort())
  .then(() => firebase.database().goOffline())
  .then(() => console.log('main finish'))