const firebase = require("firebase");
const config = require("./config/config.js");
const firebaseConfig = {
  databaseURL: config.firebase.databaseURL,
};
firebase.initializeApp(firebaseConfig);

console.log("main init");

const updateAnneiList = require("./src/list/updateAnneiList");
const updateAnneiDetail = require("./src/detail/updateAnneiDetail");

const YkfList = require("./list/ykf_list.js");
const ykfTime = require("./list/ykf_time_and_announce.js");

const ykfDetail = require("./detail/detail_ykf.js");

const topCompany = require("./top/top_company.js");
const topPort = require("./top/top_port.js");
const yahoo = require("./weather/yahoo.js");
const tenkijp = require("./weather/tenkijp.js");
const tyhoon = require("./typhoon/tenkijp.js");

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
  await firebase.database().goOffline();
  console.groupEnd()
  console.log("main finish");
})();
