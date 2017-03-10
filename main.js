const firebase = require("firebase");
const config = require("./config.json");
const firebaseConfig = {
  databaseURL: config.firebase.databaseURL
};
firebase.initializeApp(firebaseConfig);

console.log('start')

require('./list_anei.js');
require('./list_ykf.js');
require('./list_dream.js');

require('./detail_anei.js');
require('./detail_ykf.js');
require('./weather.js');

// const promise = new Promise(function(resolve, reject) {
//     require('./list-anei.js');
//     resolve();
//   })
//   .then(function() {
//     return new Promise(function(resolve, reject) {
//       require('./list-ykf.js');
//       resolve();
//     })
//   })
//   .then(function() {
//     return new Promise(function(resolve, reject) {
//       require('./list-dream.js');
//       resolve();
//     })
//   })
//   .then(function() {
//     console.log('end')
//   });