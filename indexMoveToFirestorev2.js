// v1 for move to firestore. Remove Mongo, and clean up header with comments
// 3/3/2020: I was able to create a working test to add junk data to firestore
// cont'd: and was able to recall a random value from the keypair
// cont'd: Will need to remove diagnostic console logging eventually
// v1 commented and saved. Committed to git, and will create a v2
// v2 should have successfull "adds" and "gets" for both Talbot and test.
// cont'd: more talbot testing needed.
// cont'd: V2 is done. More work will be done in v3

// Three lines of discord.js requirements, the token is matched to a specific discord development channel
const Discord = require('discord.js');
const { token } = require('./config.json');
const client = new Discord.Client();
// for Filesystem access, may go away in the future if databasing works
const fs = require('fs');

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
  // Test function to be updated to when DB work gets done

/////// Test DB Work //////////////
  if (myCommand.substring(0, 4) == 'test' || myCommand.substring(0, 6) == 'talbot'){
    myCommand = myCommand.toLowerCase();
    const dbResult = await grabFromDB4(myCommand);
    console.log(dbResult);
    if (dbResult == 'No such document!') {
      msg.channel.send(dbResult); // Change to console log later
      return;
    }
    dbResult2 = getTheRandomEntry(dbResult);
    msg.channel.send(dbResult2);
    return;
  }

  if (myCommand.substring(0, 7) == 'addtest' || myCommand.substring(0, 9) == 'addtalbot'){
    // myCommand = myCommand.substr(3);
    addTestFound(myCommand);
    // console.log(myCommand + " has been added to test");
  }

  if (myCommand.substring(0, 11) == 'setjunkdata'){
    myCommand = myCommand.substr(3);
    setJunkData(myCommand);
    return;
  }
  if (myCommand.substring(0, 11) == 'getjunkdata'){
    myCommand = myCommand.substr(3);
    const dbResult = await grabFromDB4(myCommand);
    console.log(dbResult);
    dbResult2 = getTheRandomEntry(dbResult);
    msg.channel.send(dbResult2);
    return;
  }
  // End Test DB work


  fs.readFile("theIndex.txt", function (err, data) {
    if (err) throw err;
    //Check to see if the command is to add
    if (myCommand.substring(0, 3) == 'add'){
      // Add section to filter add requests to room admins only
      addFound(myCommand);
    }
    if (myCommand.substring(0, 4) == 'roll'){
      // Add section to filter add requests to room admins only
      msg.channel.send(rollDice(myCommand));
    }
    if (data.includes(myCommand)){
      msg.channel.send(randomLibraryString(myCommand));
    } else {
      return;
    }
  })
});

// Core Loop End

//////////////////////
// Dice Rolling Function
//////////////////////
function rollDice(theDice) {
  // strip roll
  theDice = theDice.substring(5);
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

  async function addTestFound(theCommand) {
    //add is present and fit to be removed, removes add
    myCommand = myCommand.substring(3);
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
    dbResult2 = "key" + String(getTheDbArrayLength(dbResult) + 1);
    // Create database reference object
    const stuffRef = db.collection('users');
    // clean up the set line. This should add, or create, database entry
    let setJd = stuffRef.doc(docName).set({
      [dbResult2] : content
    } , {merge: true});
  };

  //////////////////////
  // Start txt library functions:
  //////////////////////
  function randomLibraryString(commandName) {
    // commandName = commandName.substr(1);
    var theName = "./library/" + commandName + ".txt";
    var text = fs.readFileSync(theName);
    var text = String(text);
    var textByLine = text.split("\n");
    var rando = Math.floor(Math.random() * (textByLine.length - 1));
    return String(textByLine[rando]);
  };

  function addFound(theCommand) {
    //add is present and fit to be removed, removes add
    myCommand = myCommand.substring(3);
    // Store the index again
    const theData2 = fs.readFileSync('theIndex.txt', 'utf8')
    // Add section exiting if myCommand is space or blank
    if (myCommand.charAt(0) == " " || myCommand.charAt(0) == "") {
      msg.channel.send("Correct Syntax is: '!add$something $somethingelse' EG: '!addtalbot Is Awesome!'");
      return;
    }
    console.log("I've saved your add command as: " + myCommand);
    // Parse and save the index and content values
    var file = myCommand.substr(0,myCommand.indexOf(' '));
    var content = myCommand.substr(myCommand.indexOf(' ')+1) + "\n";
    content = String(content);
    // Check theIndex.txt for the index name
    if(theData2.indexOf(file) >= 0){
      console.log("It is! Adding " + content + " to " + file);
      theAddFunction(file, content);
    } else {
      console.log("It isn't! creating " + content + " with " + file);
      addToEmpty(file, content);
    }
  };

  function theAddFunction(aFile, aContent) {
    var theName = "./library/" + aFile + ".txt";
    fs.appendFile(theName, aContent, function (err) {
      if (err) throw err;
      console.log('Saved!');
    });
  }

  function addToEmpty(aFile, aContent) {
    var appendFile = aFile + "\n";
    fs.appendFile("theIndex.txt", appendFile, function (err) {
      if (err) throw err;
      console.log(appendFile + " Saved to the index");
    });
    var theName = "./library/" + aFile + ".txt";
    fs.writeFile(theName, aContent, function (err) {
      if (err) throw err;
      console.log(aContent + " added to " + theName);
    });
  }
  //////////////////////
  // End Text Library functions
  //////////////////////

// adding to test db entry

// Test Junk Data entries. Remind me to remove this if you see it.
function setJunkData(theCommand) {
  const stuffRef = db.collection('users');
  // msg.channel.send("Creating Junk for " + theCommand + "!");
  let setJd = stuffRef.doc(theCommand).set({
    6: 'San Francisco', 7: 'CA', 8: 'USA',
    9: false, 10: 860000
  }, {merge: true});
}

function getJunkData(theCommand) {
  grabFromDB4(theCommand);
}
