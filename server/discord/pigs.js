// ---------------------------
// - - - - - IMPORTS - - - - -
// ---------------------------

const config = require('../config.js');
const {
  handleStart, handleRoll, handleCall, handleBro, stats, help, rules, buildPen, botTurn,
} = require('./commands.js');
const {
  client, genPigName, getUserFromMention, getServer, addServer, findActiveGameObj,
} = require('./helper.js');

// ----------------------------------
// - - - - - INITIALIZATION - - - - -
// ----------------------------------

// ------------------------------------
// - - - - - HELPER FUNCTIONS - - - - -
// ------------------------------------

// ------------------------------------
// - - - - - CLIENT FUNCTIONS - - - - -
// ------------------------------------

// When a channel gets deleted
client.on('channelDelete', async (channel) => {
  const sDoc = await getServer(channel.guild.id); // Grab the Server doc
  const i = sDoc.pigPenIDs.indexOf(channel.id); // Look for matching pig-pen id
  if (i > -1) { sDoc.pigPenIDs.splice(i, 1); } // If found, remove from array
  await sDoc.save(); // Save Server doc
});

// When the bot joins a server
client.on('guildCreate', async (guild) => {
  console.log(`Joined a new guild: ${guild.name}`); // Log to console

  const sDoc = await getServer(guild.id);
  if (sDoc === null) {
    addServer(guild);
    // Snort! Nice to meet you all!
  } else {
    // Add any existing pig-pen text channels
    sDoc.pigPenIDs = []; // Reset the array
    guild.channels.cache.forEach((c) => {
      if (c.name === 'pig-pen') { sDoc.pigPenIDs.push(c.id); }
    });

    // Get a new pig name
    const newName = genPigName();
    guild.members.cache.get(client.user.id).setNickname(newName);
    if (newName === sDoc.pigName) {
      // Good to be back!
    } else {
      // ${gDoc.pigName} told me about you guys!
      sDoc.pigName = newName;
    }

    sDoc.save();
  }
});

// When the bot goes online
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// When a message is sent
client.on('messageCreate', async (msg) => {
  if (msg.author.id === client.user.id) { return; } // Never reply to your own message

  let inPen = false; // Assume we aren't in a pig-pen text channel
  // Check to make sure
  const sDoc = await getServer(msg.guild.id);
  sDoc.pigPenIDs.forEach((p) => {
    if (p === msg.channel.id) { inPen = true; }
  });

  if (msg.content[0] !== '.') { // Consider non-'game command' messages
    const [mention, command] = msg.content.split(' '); // Split content into mention and command
    const targetUser = getUserFromMention(mention); // Get user from mention

    if (!targetUser || targetUser.id !== client.user.id) { return; } // Only respond to bot mentions

    switch (command) { // Respond accordingly
      case 'help':
        help(msg.channel); // Return command information
        break;

      case 'rules':
        rules(msg.channel); // Return game rules
        break;

      case 'pen': // Build a 'pig-pen' text channel
        await buildPen(msg.guild);
        msg.reply('I built a brand new pig-pen! Enjoy!'); // Display success
        break;

      case 'new':
        addServer(msg.guild);
        break;

      default: // Unrecognized mention command
        msg.reply('...Oink?'); // Display confusion
        break;
    }
  } else if (inPen) { // Consider messages sent within a pig-pen
    const trimmedMsg = msg.content.slice(1); // Trim off the '.' at the beginning
    const msgSplit = trimmedMsg.split(' ');
    const command = msgSplit[0];
    const param = msgSplit.slice(1);

    const activeGame = findActiveGameObj(sDoc, msg.author.id); // Find active game

    switch (command) { // Respond accordingly
      case 'stats': // Get a user's statistics
        await stats(msg, param[0]);
        break;

      case 'play': // Begin a game with another user
        await handleStart(msg, sDoc, activeGame, param);
        break;

      case 'roll': // Roll a specified number of times
        await handleRoll(msg, sDoc, activeGame, param[0]);
        break;

      case 'call': // Ends the author's turn
        await handleCall(msg, sDoc, activeGame);
        break;

      case 'bro': // Roll until you either win or bust
        await handleBro(msg, sDoc, activeGame);
        break;

      default: // Unrecognized game command
        msg.reply('...Oink?'); // Display confusion
        break;
    }

    if (activeGame !== null) { 
      await sDoc.save(); 
    } // Update Server info

    // Bot takes a turn if necessary
    const botGame = await findActiveGameObj(sDoc, client.user.id);
    if (botGame !== null && botGame.activePlayer === client.user.id) {
      await botTurn(msg.channel, botGame, sDoc);
      await sDoc.save();
    }
  }
});

// Logs the bot in with a client token
const botLogin = () => { client.login(config.token); };

// Exports
module.exports = {
  botLogin,
};
