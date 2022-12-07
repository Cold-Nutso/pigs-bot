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

const pigNames = ['Mr. Pig', 'Piggie Smalls', 'Piggle Rick', 'Swiney Todd', 'The Pig Lebowski', 'Model 01-NK', 'Boarimir', 'Piggy Azalea', 'Cyril Piggis', 'Pigglytuff', 'Niels Boar'];

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

// Gets a Player based on their discord id
// Adds a new Player if one isn't found
const getPlayer = async (playerID) => {
  // Find player doc from database by discordID property
  const pDoc = await Player.findByDiscordID(playerID);
  if (pDoc != null) { return pDoc; } // Return it

  // Otherwise, set up default data object
  const defaultData = {
    name: getUserFromID(playerID).username,
    discordID: playerID,
    games: 0,
    wins: 0,
    losses: 0,
    rolls: [0, 0, 0, 0, 0, 0, 0],
    turns: 0,
    profit: 0,
    busts: 0,
    bros: 0,
  };

  const newPlayer = new Player(defaultData); // Create a new Player model
  await newPlayer.save(); // Save it to the database

  return newPlayer; // Return the new player
};

// If the player is in an active game, return it
const findActiveGameObj = (sDoc, playerID) => {
  for (let i = 0; i < sDoc.activeGames.length; i++) {
    const game = sDoc.activeGames[i];
    for (let n = 0; n < game.turnOrder.length; n++) {
      if (game.turnOrder[n] === playerID) {
        return game;
      }
    }
  }

  return null;
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
  findActiveGameObj,
  addServer,
};
