
const request = require('request');
const firebase = require("firebase");
const config = require("../config.json");
const firebaseConfig = {
    databaseURL: config.firebase.databaseURL
};
firebase.initializeApp(firebaseConfig);

const dbRef = firebase.database().ref("anei_liner_info");

request('https://yaima-funi.firebaseio.com/', function (error, response, body) {
    if (!error && response.statusCode == 200) {
        var asJson = require("./anei_liner_detail.json")
        dbRef.set(asJson)
        console.log("success!");
    }
    else {
        console.log("error!");
        console.log(error);
    }
    firebase.database().goOffline()
})