// ---------------------------
// - - - - - IMPORTS - - - - -
// ---------------------------

const { ChannelType, PermissionsBitField } = require('discord.js');
const config = require('../config.js');
const { findActiveGame } = require('./game.js');
const {
  handleStart, handleRoll, handleCall, handleBro, handleStats, help, rules,
} = require('./commands.js');
const {
  client, genPigName, getUserFromMention, getServer, addServer,
} = require('./helper.js');

// ----------------------------------
// - - - - - INITIALIZATION - - - - -
// ----------------------------------

const pigPenIDs = {};

// ------------------------------------
// - - - - - HELPER FUNCTIONS - - - - -
// ------------------------------------

// Creates a new 'pig-pen' text channel
const buildPen = async (guild) => {
  // Create a new text channel
  const newPen = await guild.channels.create({
    name: 'pig-pen',
    type: ChannelType.GuildText,
    permissionOverwrites: [{
      id: guild.id,
      deny: [PermissionsBitField.Flags.ManageChannels],
    }],
  });

  pigPenIDs[`${guild.id}`].push(newPen.id); // Add to guild's pen IDs
};

// ------------------------------------
// - - - - - CLIENT FUNCTIONS - - - - -
// ------------------------------------

// When a channel gets deleted
client.on('channelDelete', (channel) => {
  pigPenIDs[`${channel.guild.id}`].forEach((p) => {
    if (p === channel.id) {
      const index = pigPenIDs[`${channel.guild.id}`].indexOf(channel.id);
      pigPenIDs[`${channel.guild.id}`].splice(index, 1);
    }
  });
});

// When the bot joins a server
client.on('guildCreate', (guild) => {
  console.log(`Joined a new guild: ${guild.name}`); // Log to console

  const sDoc = getServer(guild.id);
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
  }

  sDoc.save(); // Save the Server
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

  // v v PURELY FOR EASE OF DEVELOPMENT
  inPen = true;
  // ^ ^ REMOVE FOR RELEASE BUILD

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
        buildPen(msg.guild);
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
    const [command, param] = trimmedMsg.split(' '); // Split into command and parameter
    const activeGame = findActiveGame(msg.author.id); // Find active game

    switch (command) { // Respond accordingly
      case 'stats': // Get a user's statistics
        handleStats(msg, param);
        break;

      case 'play': // Begin a game with another user
        handleStart(msg, param);
        break;

      case 'roll': // Roll a specified number of times
        handleRoll(msg, activeGame, param);
        break;

      case 'call': // Ends the author's turn
        handleCall(msg, activeGame);
        break;

      case 'bro': // Roll until you either win or bust
        handleBro(msg, activeGame);
        break;

      default: // Unrecognized game command
        msg.reply('...Oink?'); // Display confusion
        break;
    }
  }
});

// Logs the bot in with a client token
const botLogin = () => { client.login(config.token); };

// Exports
module.exports = {
  botLogin,
};
