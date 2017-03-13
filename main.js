const firebase = require("firebase");
const config = require("./config.json");
const firebaseConfig = {
  databaseURL: config.firebase.databaseURL
};
firebase.initializeApp(firebaseConfig);

console.log('main start')

const AneiList = require('./list_anei.js');
const YkfList = require('./list_ykf.js');
const DreamList = require('./list_dream.js');

// todo 詳細もPromise化せねば
// require('./detail_anei.js');
// require('./detail_ykf.js');
// require('./weather.js');

const topCompany = require('./top_company');
const weather = require('./weather.js');

Promise.resolve()
  .then(() => AneiList())
  .then(() => YkfList())
  .then(() => DreamList())
  .then(() => weather())
  .then(() => topCompany())
  .then(() => firebase.database().goOffline())
  .then(() => console.log('main finish!'))