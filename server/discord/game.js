// ---------------------------
// - - - - - IMPORTS - - - - -
// ---------------------------

const { rollDie, getPlayer } = require('./helper.js');

// ----------------------------------
// - - - - - INITIALIZATION - - - - -
// ----------------------------------

// These will be Redis variables I think?
const activeGames = [];
const gameArchives = [];

// Basic game rules, might be editable later
const sides = 6;
const goal = 100;
const bust = 1;

// -----------------------------
// - - - - - FUNCTIONS - - - - -
// -----------------------------

// Starts a game between two players
const startGame = (pDoc, oDoc) => {
  // Create new active game object
  const newGame = {};
  newGame[`${pDoc.discordID}`] = {
    score: 0,
    turn: [],
    profit: 0,
    history: [],
  };
  newGame[`${oDoc.discordID}`] = {
    score: 0,
    turn: [],
    profit: 0,
    history: [],
  };
  // Whoever was challenged should go first
  newGame.activePlayer = oDoc.discordID;
  newGame.waitingPlayer = pDoc.discordID;

  // Add to active games array
  activeGames.push(newGame);
};

// Ends a game between two players
const endGame = async (game) => {
  // Create game archive object
  const newArchive = {
    date: {
      second: 0,
      minute: 0,
      hour: 0,
      day: 0,
      month: 0,
      year: 0,
    },
    winner: 'TBD',
    loser: 'TBD',
  };

  // Get the completion date
  const now = new Date(); // Grab current date
  newArchive.date.year = now.getFullYear();
  newArchive.date.month = now.getMonth() + 1; // Months start at 0
  newArchive.date.day = now.getDate();
  newArchive.date.hour = now.getHours();
  newArchive.date.minute = now.getMinutes();
  newArchive.date.second = now.getSeconds();

  // Appropriately set winner and loser
  if (game[`${game.activePlayer}`].score >= goal) {
    newArchive.winner = game.activePlayer;
    newArchive.loser = game.waitingPlayer;
  } else {
    newArchive.winner = game.waitingPlayer;
    newArchive.loser = game.activePlayer;
  }

  // Update loser stats
  const loser = await getPlayer(newArchive.loser);
  loser.games += 1;
  loser.losses += 1;
  await loser.save();

  // Update winner stats
  const winner = await getPlayer(newArchive.winner);
  winner.games += 1;
  winner.wins += 1;
  await winner.save();

  // Transfer score and history data of players
  newArchive[`${newArchive.winner}`] = {
    score: game[`${newArchive.winner}`].score,
    history: game[`${newArchive.winner}`].history,
  };
  newArchive[`${newArchive.loser}`] = {
    score: game[`${newArchive.loser}`].score,
    history: game[`${newArchive.loser}`].history,
  };

  // Add game to archive
  gameArchives.push(newArchive);

  // Remove game from active games
  const index = activeGames.indexOf(game);
  activeGames.splice(index, 1);
};

// Ends a player's turn
// Returns a boolean based on win status
const endTurn = (g, pDoc) => {
  const playerDoc = pDoc;
  const game = g;
  const player = game[`${playerDoc.discordID}`]; // Initialize player

  playerDoc.profit += player.profit; // Increment all-time profit
  playerDoc.turns += 1; // Increment all-time turns

  player.score += player.profit; // Add profit to total score
  player.profit = 0; // Reset profit to zero
  player.history.push(player.turn); // Add turn to turn history
  player.turn = []; // Clear current turn array

  // Set winner if necessary
  if (player.score >= goal) {
    endGame(game);
  } else {
    // Swap current player
    const otherGuy = game.waitingPlayer;
    game.waitingPlayer = playerDoc.discordID;
    game.activePlayer = otherGuy;
  }

  return player.score;
};

// Guides a player through their turn
const takeTurn = (game, pDoc, desiredRolls) => {
  const playerDoc = pDoc;
  const player = game[`${playerDoc.discordID}`];

  for (let i = 0; i < desiredRolls; i++) {
    // Roll and add it to current turn
    const roll = rollDie(sides);
    player.turn.push(roll);

    playerDoc.rolls.total += 1; // Increment all-time rolls
    playerDoc.rolls[`${roll}`] += 1; // Increment all-time specific rolls

    // End turn if busted
    if (roll === bust) {
      playerDoc.busts += 1; // Increment all-time busts

      player.profit = 0;

      endTurn(game, pDoc);
      return 0;
    }

    // For some reason this doesn't properly add if you make it a variable
    player.profit += roll;
  }

  return player.profit;
};

// Bro for it
const broForIt = (game, pDoc) => {
  const playerDoc = pDoc;
  const player = game[`${playerDoc.discordID}`];

  playerDoc.bros += 1; // Increment all-time bros

  while (true) {
    // Roll and add it to current turn
    const roll = rollDie(sides);
    player.turn.push(roll);

    playerDoc.rolls.total += 1; // Increment all-time rolls
    playerDoc.rolls[`${roll}`] += 1; // Increment all-time specific rolls

    // End turn if busted
    if (roll === bust) {
      playerDoc.busts += 1; // Increment all-time busts

      player.profit = 0;
      endTurn(game, playerDoc);
      return 0;
    }

    // Add roll to profit
    player.profit += roll;
    if (player.score + player.profit >= goal) {
      return endTurn(game, playerDoc);
    }
  }
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
  activeGames,
  gameArchives,
  takeTurn,
  endTurn,
  broForIt,
  startGame,
  findActiveGame,
};
