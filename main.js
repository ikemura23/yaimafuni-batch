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

// todo 詳細もPromise化せねば
const AneiDetail = require('./detail_anei.js');
const YkfDetail = require('./detail_ykf.js');

const topCompany = require('./top_company');
const weather = require('./weather.js');

Promise.resolve()
  .then(() => console.log('main start'))
  .then(() => AneiList())
  .then(() => YkfList())
  .then(() => DreamList())
  .then(() => weather())
  .then(() => topCompany())
  .then(() => AneiDetail())
  .then(() => YkfDetail())
  .then(() => firebase.database().goOffline())
  .then(() => console.log('main finish'))