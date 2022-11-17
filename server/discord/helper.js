// ---------------------------
// - - - - - IMPORTS - - - - -
// ---------------------------

const { Client, IntentsBitField } = require('discord.js');
const models = require('../models');

const { Player, Server } = models;

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

const pigNames = ['Mr. Pig', 'Piggie Smalls', 'Piggle Rick', 'Swiney Todd', 'The Pig Lebowski', 'Model 01-NK', 'Boarimir', 'Piggy Azalea', 'Cyril Piggis', 'Pigglytuff'];

// -----------------------------
// - - - - - FUNCTIONS - - - - -
// -----------------------------

// Returns a random pig name
const genPigName = () => pigNames[Math.floor(Math.random() * pigNames.length)];

// Returns a random integer 1 - sides, inclusive
const rollDie = (s) => 1 + Math.floor((s * Math.random()));

// Gets a discord user from an id
const getUserFromID = (id) => {
  if (!id) { return null; }
  return client.users.cache.get(id);
};

// Gets a discord user from a mention
const getUserFromMention = (mention) => {
  if (!mention) return null;

  if (mention.startsWith('<@') && mention.endsWith('>')) {
    let mSliced = mention.slice(2, -1);

    if (mention.startsWith('!')) { mSliced = mSliced.slice(1); }

    return client.users.cache.get(mSliced);
  }

  return null;
};

// Gets a Player based on their discord id
// Adds a new Player if one isn't found
const getPlayer = async (id) => {
  // Find player doc from database by discordID property
  const doc = await Player.findByDiscordID(id);
  if (doc != null) { return doc; } // Return it

  // Otherwise, set up default data object
  const defaultData = {
    name: getUserFromID(id).username,
    discordID: id,
    games: 0,
    wins: 0,
    losses: 0,
    rolls: {
      total: 0,
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
    },
    turns: 0,
    profit: 0,
    busts: 0,
    bros: 0,
  };

  const newPlayer = new Player(defaultData); // Create a new Player model
  await newPlayer.save(); // Save it to the database
  return newPlayer; // Return the new player
};

// Gets a Server based on its guild id
const getServer = async (id) => {
  // Find player doc from database by discordID property
  const doc = await Server.findByGuildID(id);
  return doc; // Return it
};

// Adds a new Server to the database
const addServer = async (guild) => {
  // Grab a random pig name
  const newName = genPigName();
  await guild.members.cache.get(client.user.id).setNickname(newName);

  // Set up default data object
  const defaultData = {
    name: guild.name,
    guildID: guild.id,
    pigName: newName,
    pigPenIDs: [],
    playerIDs: [],
    activeGames: [],
    finishedGames: [],
  };

  // Add any existing pig-pen text channels
  guild.channels.cache.forEach((c) => {
    if (c.name === 'pig-pen') { defaultData.pigPenIDs.push(c.id); }
  });

  const newServer = new Server(defaultData); // Create a new Server model
  await newServer.save(); // Save it to the database
  return newServer; // Return the new Server
};

// Exports
module.exports = {
  client,
  genPigName,
  rollDie,
  getUserFromID,
  getUserFromMention,
  getPlayer,
  getServer,
  addServer,
};
