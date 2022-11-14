// ---------------------------
// - - - - - IMPORTS - - - - -
// ---------------------------

const { client } = require('./client.js'); // Import client
const { activeGames } = require('./game.js'); // Import pigs.js

// -----------------------------
// - - - - - FUNCTIONS - - - - -
// -----------------------------

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

// Returns the active game a player is in
const findActiveGame = (playerID) => {
  let foundGame = null;

  for (let i = 0; i < activeGames.length; i++) {
    if (activeGames[i][`${playerID}`]) {
      foundGame = activeGames[i];
      break;
    }
  }

  return foundGame;
};

// Exports
module.exports = {
  getUserFromID,
  getUserFromMention,
  findActiveGame,
};
