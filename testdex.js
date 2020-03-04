const Discord = require('discord.js');
const { token } = require('./config.json');
const client = new Discord.Client();

// Initialize firestore
const admin = require('firebase-admin');
let serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
let db = admin.firestore();


// Core Loop

client.on('message', async (msg) => {
  myCommand = String(msg);
  //Ignore processing if the message doesn't start with !
  if (myCommand.charAt(0) != "!") {
    return;
  }
  // Remove the !
  myCommand = myCommand.substr(1);
  // make all lowercase
  myCommand = myCommand.toLowerCase();

  // Test function to be updated to when DB work gets done

  if (myCommand.substring(0, 4) == 'test'){
    const dbResult = await grabFromDB4(myCommand);
    console.log(dbResult);
    dbResult2 = getTheRandomEntry(dbResult);
    msg.channel.send(dbResult2);
    return;
    }
    else return;
  }


  // End Test DB work

);

// Core Loop End

function grabFromDB4(docName) {
  var result;
  return db.collection("users").doc(docName).get()
    .then(function (doc) {
      if (doc.exists) {
        console.log("Document data:", doc.data());
        result = Object.values(doc.data());
        console.log(result);
        return result;
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
        result = "No such document!";
        return result;
      }
    }).catch (function (err) {
      console.log('Error getting documents', err);
    });
  };

  function getTheRandomEntry(theEntry) {
    var rando = Math.floor(Math.random() * (theEntry.length - 1));
    var theResult = String(theEntry[rando]);
    console.log(theResult);
    return theResult;
  }

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.login(token);
