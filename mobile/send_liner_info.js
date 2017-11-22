
const request = require('request');
const firebase = require("firebase");
const config = require("../config.json");
const firebaseConfig = {
    databaseURL: config.firebase.databaseURL
};
firebase.initializeApp(firebaseConfig);

const table = "anei_liner_info"

const dbRef = firebase.database().ref(table);

request('https://yaima-funi.firebaseio.com/', function (error, response, body) {
    if (!error && response.statusCode == 200) {
        var asJson = require(`./${table}.json`)
        dbRef.set(asJson)
        console.log("success!");
    }
    else {
        console.log("error!");
        console.log(error);
    }
    firebase.database().goOffline()
})