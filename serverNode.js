const express = require('express');
const app = express();
const path = require('path');
let admin = require("firebase-admin");
let bodyParser = require('body-parser');
let firebase = require('firebase');

// Fetch the service account key JSON file contents
let serviceAccount = require("./calculator-a3477-firebase-adminsdk-v4ulm-cdaf4a664f.json");

// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://calculator-a3477.firebaseio.com"
});

 // Initialize Firebase
let config = {
    apiKey: "AIzaSyBcEalVGXZLsZqqgWcVSLNuqIzQk71y21U",
    authDomain: "calculator-a3477.firebaseapp.com",
    databaseURL: "https://calculator-a3477.firebaseio.com",
    projectId: "calculator-a3477",
    storageBucket: "calculator-a3477.appspot.com",
    messagingSenderId: "1042922692923"
};
firebase.initializeApp(config);
database = firebase.database();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.get('/', function (req, res){

    res.sendFile(path.join(__dirname + '/try.html'));

});

// for getting error in database if something went wrong
function errData(err){
    console.log('Error!');
    console.log(err);
}

// This responds a POST request for the homepage
app.post('/sendMessage', (req, res) => {
    
    //getting data from database
    let ref = database.ref('convo');
    ref.on('value', gotData, errData);
    function gotData(data){
        let convo = data.val();
        let keys = Object.keys(convo);
        let user_id = [];
        for(let i = 0; i < keys.length; i++){
            let k = keys[i];
            user_id[i] = convo[k].user_id;
        }
    // getting uniqueID to avoid repetition of sending message
    let uniqueUserID = Array.from(new Set(user_id));
    console.log("uniqueID: ", uniqueUserID);

    // using fb-messenger api to send message to users
    let broadcastMessage = req.body.message;
    let FBMessenger = require('fb-messenger');
    let messenger = new FBMessenger("EAAFQIPkB2ZCYBAGtSIppR978xPAgktw85w29nZC7xvX9UW599iebSjV0bmCN6JIz4GkVyQ8Hqnn5snqnvzgdiB6zgAR6ylciDQYAVvVrz3S3R4CMe1l1fKFiXcXExf0K169dC0DI3qVvl88lOVz6imaXoE3UrSyB4yxVxf3gZDZD");

    for(let i = 0; i < uniqueUserID.length; i++){
        messenger.sendTextMessage(uniqueUserID[i], broadcastMessage, function (err, body) {
            if(err) return console.error(err)
            console.log(body);
        });
        // saving broadcasted messages to users
        admin.database().ref('/message').push({message: broadcastMessage, toUserID: uniqueUserID[i]});
    }

    }

    res.send('Message has been broadcast.');
});


app.listen(3000, () => console.log('server listening on port 3000!'))
