// ---------------------------
// - - - - - IMPORTS - - - - -
// ---------------------------

require('dotenv').config();
const { ChannelType, PermissionsBitField } = require('discord.js');
const { getUserFromMention, findActiveGame } = require('./helper.js');
const {
  handleStart, handleRoll, handleCall, handleBro, handleStats,
} = require('./handlers.js');
const { client } = require('./client.js');

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

// Logs the bot in with a client token
const botLogin = (token) => { client.login(token); };

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
  console.log(`Joined a new guild: ${guild.name}`);
  pigPenIDs[`${guild.id}`] = [];
});

// When the bot goes online
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);

  // Fill any holes
  client.guilds.cache.forEach((g) => {
    if (!pigPenIDs[`${g.id}`]) {
      pigPenIDs[`${g.id}`] = [];
    }
  });
});

// When a message is sent
client.on('messageCreate', (msg) => {
  if (msg.author.id === client.user.id) { return; } // Never reply to your own message

  let inPen = false; // Assume we aren't in a pig-pen text channel
  pigPenIDs[`${msg.guild.id}`].forEach((p) => { // Search through known pig-pen IDs
    if (p === msg.channel.id) { inPen = true; } // Update inPen if a match is found
  });

  // v v PURELY FOR EASE OF DEVELOPMENT
  inPen = true;
  // ^ ^ REMOVE FOR RELEASE BUILD

  let response = ''; // Initialize response string
  if (msg.content[0] !== '.') { // Consider non-'game command' messages
    const [mention, command] = msg.content.split(' '); // Split content into mention and command
    const targetUser = getUserFromMention(mention); // Get user from mention

    if (!targetUser || targetUser.id !== client.user.id) { return; } // Only respond to bot mentions

    switch (command) { // Respond accordingly
      case 'help': // Return command information
        response += '**Mention Commands:** ';
        response += `\n- Prefix with "${client.user} "`;
        response += '\n- Recognized in any channel';
        response += '\n> **help** - *Get command descriptions.*';
        response += '\n> **pen** - *Create a new pig-pen text channel.*';

        response += '\n\n**Game Commands:** ';
        response += '\n- Prefix with "." ';
        response += '\n- Recognized in pig-pen channels';
        response += '\n> **play <@user>** --- *Begin a game with the mentioned user.*';
        response += '\n> **roll <int>** --- *Roll a specified number of times.*';
        response += '\n> **call** --- *End your turn and add to your score.*';
        response += '\n> **bro** --- *Roll until you win or bust.*';
        response += '\n> **stats <@user>** --- *View the mentioned user\'s statistics.*';

        msg.reply(response); // Send it
        break;

      case 'pen': // Build a 'pig-pen' text channel
        buildPen(msg.guild);
        msg.reply('I built a brand new pig-pen! Enjoy!'); // Display success
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

// Exports
module.exports = {
  client,
  botLogin,
};
