// Build notes: This is like version 1.0
// Features:
// txt based categories : !name
// Adding to categories, empty or created : !addname
// Dice Rolling. : !roll 3d6
// Still needs: room admin priveleges for !adding, and maybe !rolling

// Currently requires discord.js and rpgDiceRoller

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

// Core Loop

client.on('message', (msg) => {
  myCommand = String(msg);
  //Ignore processing if the message doesn't start with !
  if (myCommand.charAt(0) != "!") {
    return;
  }
  // Remove the !
  myCommand = myCommand.substr(1);
  fs.readFile("theIndex.txt", function (err, data) {
    if (err) throw err;
    //Check to see if the command is to add
    if (myCommand.substring(0, 3) == 'add'){
      // Add section to filter add requests to room admins only
      addFound(myCommand);
    }
    if (myCommand.substring(0, 4) == 'roll'){
      // Add section to filter roll requests to room admins only
      msg.channel.send(rollDice(myCommand));
    }
    if (data.includes(myCommand)){
      msg.channel.send(randomLibraryString(myCommand));
    }
  })
});

// Core Loop End

function rollDice(theDice) {
  // strip roll
  theDice = theDice.substring(5);
  // We should have a simple xdy format from the user
  console.log(theDice);
  // First test: Construct diceRoller and return the thirdparty function for a roll
  return String(roller.roll(theDice));
}

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

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

client.on('ready', () => {
  console.log('Bot is now connected');

});

client.login(token);
