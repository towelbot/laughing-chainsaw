// v1 includes the ability to !test in channel and get a randomized entry from that category/address collection
// v2 will include "dice roller" -- #added
// v2 is attempting to add !addtest as a function to update the address array associated with name:test in collection category #added
// v2 is attempting to add !addtest as a function to update the address array associated with name:test in collection category #added
// v2 is attempting to add !addtest as a function to update the address array associated with name:test in collection category #added

const Discord = require('discord.js');

const fs = require('fs');

const { token } = require('./config.json');

const client = new Discord.Client();

const MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
var dbo;
var dbResult ="testFailed";

// import everything and store it on the `rpgDiceRoller` scope
const rpgDiceRoller = require('rpg-dice-roller/lib/umd/bundle.js');

// create a DiceRoller
const roller = new rpgDiceRoller.DiceRoller();

// Core Loop

client.on('message', async (msg) => {
  myCommand = String(msg);
  //Ignore processing if the message doesn't start with !
  if (myCommand.charAt(0) != "!") {
    return;
  }
  // Remove the !
  myCommand = myCommand.substr(1);

  if (myCommand.substring(0, 4) == 'test'){
    grabFromDB(myCommand);
    await sleep(100);
    console.log(dbResult);
    msg.channel.send(dbResult);
    return;
  }

  if (myCommand.substring(0, 7) == 'addtest'){
    addOldToTestInDB(myCommand);
    await sleep(500);
    console.log(String(dbResult));
    return;
  }

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

// Making the DB Pull work
// Complicated I don't understand promises yet
async function grabFromDB(theTestWord) {
  grabFromMongoClient(theTestWord);
  await sleep(500);
  console.log(dbResult + " End of Script");
};

function grabFromMongoClient(aTestWord) {
  MongoClient.connect(url, { useUnifiedTopology: true }, function(err, db) {
    if (err) throw err;
    dbo = db.db("mydb");

    dbo.collection("categories").find({ "name" : aTestWord }, { projection: { _id: 0, address : 1 } }).toArray(function(err, result) {
      if (err) throw err;
      // console.log(result[0].address);  // Show the results of the projection, should be an array of items associated with aTestWord

      // Change result to be an array of "address" my placeholder name for items associated with a category
      result = result[0].address;
      // console.log(result.length);  // Show how many items are in the array

      // Get a random integer with the cieling being the length of the array
      var rando = Math.floor(Math.random() * (result.length));
      // console.log(rando); // Show What's the random number

      // Store dbResult (a variable constructed at start) as a random entry in the address (category) array from the database
      dbResult = result[rando];
      // console.log(dbResult + " In Client"); // Show what dbResult is stored in, in this function (for sleep diagnostics)

    });
    db.close();
  });
}
// End of Making DB Pull Work

// adding to test db entry

async function addOldToTestInDB(theCommand) {
  //add is present and fit to be removed, removes add
  theCommand = theCommand.substring(3);
  // Parse and save the index and content values
  var file = theCommand.substr(0,theCommand.indexOf(' '));
  var content = theCommand.substr(theCommand.indexOf(' ')+1);

  MongoClient.connect(url, { useUnifiedTopology: true }, function(err, db) {
    if (err) throw err;
    dbo = db.db("mydb");
    console.log("Adding " + content + " to " + file);
    dbo.collection("categories").findOneAndUpdate(
      {
        "name" : file
      },
      {
        $addToSet: { address: content }
      },
      function(err, result) {
        dbResult = result.address;
      });

      db.close();
    });

}

// end adding to test db entry



function rollDice(theDice) {
  // strip roll
  theDice = theDice.substring(5);
  // We should have a simple xdy format from the user
  console.log(theDice);
  // First test: Construct diceRoller and return the thirdparty function for a roll
  return String(roller.roll(theDice));
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


// Start txt library functions:
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
// End Text Library functions

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

client.on('ready', () => {
  console.log('Bot is now connected');

});

client.login(token);
