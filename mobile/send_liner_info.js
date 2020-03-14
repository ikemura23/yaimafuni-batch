const request = require('request');
const firebase = require("firebase");
const config = require("../config/config.js");
const firebaseConfig = {
    databaseURL: config.firebase.databaseURL
};
firebase.initializeApp(firebaseConfig);

request('https://yaima-funi.firebaseio.com/', function (error, response, body) {
    if (!error && response.statusCode == 200) {
        var asJson = require(`./anei_liner_info.json`)
        firebase.database().ref('anei_liner_info').set(asJson)
        console.log("success! anei");
    }
    else {
        console.log("error! anei");
        console.log(error);
    }
    firebase.database().goOffline()
})

request('https://yaima-funi.firebaseio.com/', function (error, response, body) {
    if (!error && response.statusCode == 200) {
        var asJson = require(`./ykf_liner_info.json`)
        firebase.database().ref('ykf_liner_info').set(asJson)
        console.log("success! ykf");
    }
    else {
        console.log("error! ykf");
        console.log(error);
    }
    firebase.database().goOffline()
})
