const firebase = require("firebase");
const config = require("./config.json");
const firebaseConfig = {
    databaseURL: config.firebase.databaseURL
};
firebase.initializeApp(firebaseConfig);

console.log('start')

const AneiList = require('./list_anei.js');
const YkfList = require('./list_ykf.js');
const DreamList = require('./list_dream.js');

// require('./detail_anei.js');
// require('./detail_ykf.js');
// require('./weather.js');

Promise.resolve()
    .then(function() {
        return AneiList();
    })
    .then(function() {
        return DreamList();
    })
    .then(function() {
        return YkfList();
    })
    .then(function() {
        console.log('end')
    });