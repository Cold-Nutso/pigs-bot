// Discord bot guide:
// https://buddy.works/tutorials/how-to-build-a-discord-bot-in-node-js-for-beginners

// ---------------------------
// - - - - - IMPORTS - - - - -
// ---------------------------

const { Client, IntentsBitField } = require('discord.js');

// ----------------------------------
// - - - - - INITIALIZATION - - - - -
// ----------------------------------

const myIntents = new IntentsBitField(); // Create intents
myIntents.add(
  IntentsBitField.Flags.Guilds,
  IntentsBitField.Flags.GuildMembers,
  IntentsBitField.Flags.GuildMessages,
  IntentsBitField.Flags.MessageContent,
);
const client = new Client({ intents: myIntents }); // Create new client

// Exports
module.exports = {
  client,
};
