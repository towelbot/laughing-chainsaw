// v1 for move to firestore. Remove Mongo, and clean up header with comments
// 3/3/2020: I was able to create a working test to add junk data to firestore
// cont'd: and was able to recall a random value from the keypair
// cont'd: Will need to remove diagnostic console logging eventually
// v1 commented and saved. Committed to git, and will create a v2
// v2 should have successfull "adds" and "gets" for both Talbot and test.
// cont'd: more talbot testing needed.
// cont'd: V2 is done. More work will be done in v3
// 3/4/2020: v3 needs: 1. Fix when document doesn't exist first key.
// cont'd: 2. Move library over to db (may not be related to this file)
// cont'd: 3. Remove diagnostic onsole logging, there's a loooooooot.
// 03/28/2020: V3 successfull in moving everything to firestore.
// cont'd V4 will clean up diagnostic feedback, and setting junk data

// Three lines of discord.js requirements, the token is matched to a specific discord development channel
const Discord = require('discord.js');
const { token } = require('./config.json');
const client = new Discord.Client();

// import everything and store it on the `rpgDiceRoller` scope
const rpgDiceRoller = require('rpg-dice-roller/lib/umd/bundle.js');
// create a DiceRoller
const roller = new rpgDiceRoller.DiceRoller();

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

  //Check to see if the command is to add
  if (myCommand.substring(0, 3) == 'add'){
    // Add section to filter add requests to room admins only
    addTestFound(myCommand);
    return;
  }
  if (myCommand.substring(0, 4) == 'roll'){
    // Add section to filter add requests to room admins only
    msg.channel.send(rollDice(myCommand));
  }
  else {
    myCommand = myCommand.toLowerCase();
    const dbResult = await grabFromDB4(myCommand);

    if (dbResult == 'No such document!') {
      console.log(myCommand + " = " + dbResult);
      return;
    }
    dbResult2 = getTheRandomEntry(dbResult);
    msg.channel.send(dbResult2);
    return;
  }
});


// Core Loop End

//////////////////////
// Dice Rolling Function
//////////////////////
function rollDice(theDice) {
  // strip roll
  theDice = theDice.substring(4);
  // We should have a simple xdy format from the user
  console.log(theDice);
  // First test: Construct diceRoller and return the thirdparty function for a roll
  return String(roller.roll(theDice));
}

//////////////////////
// Essential small functions
/////////////////////
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getTheRandomEntry(theEntry) {
  var rando = Math.floor(Math.random() * (theEntry.length - 1));
  var theResult = String(theEntry[rando]);
  console.log(theResult);
  return theResult;
}

function getTheDbArrayLength(theEntry) {
  return theEntry.length;
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.login(token);
//////////////////////
// End Essential small functions
/////////////////////

// Here there be DB functions
function grabFromDB4(docName) {
  var result;
  return db.collection("users").doc(docName).get()
  .then(function (doc) {
    if (doc.exists) {
      // console.log("Document data:", doc.data());  // Logging
      result = Object.values(doc.data());
      // console.log(result);  // Logging
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

async function addTestFound(theCommand) {
  //add is present and fit to be removed, removes add
  myCommand = theCommand.substring(3);
  // Add section exiting if myCommand is space or blank
  if (myCommand.charAt(0) == " " || myCommand.charAt(0) == "") {
    msg.channel.send("Correct Syntax is: '!add$something $somethingelse' EG: '!addtalbot Is Awesome!'");
    return;
  }
  // Parse and save the index and content values
  var docName = myCommand.substr(0,myCommand.indexOf(' '));
  var content = myCommand.substr(myCommand.indexOf(' ')+1);
  content = String(content);
  console.log(content + " has been added to " + docName);
  // Get the document
  const dbResult = await grabFromDB4(docName);
  // Take the length of the document, add 1, and create a string "key" + 1
  if (dbResult == "No such document!") {
    dbResult2 = "key1";
  } else {
    dbResult2 = "key" + String(getTheDbArrayLength(dbResult) + 1);
  }
  // Create database reference object
  const stuffRef = db.collection('users');
  // clean up the set line. This should add, or create, database entry
  let setJd = stuffRef.doc(docName).set({
    [dbResult2] : content
  } , {merge: true});
};
