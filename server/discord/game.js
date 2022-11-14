// ----------------------------------
// - - - - - INITIALIZATION - - - - -
// ----------------------------------

// const pigNames = ['Mr. Pig', 'Piggie Smalls', 'Piggle Rick', 'Swiney Todd', 'The Pig Lebowski'
// 'Model 01-NK', 'Boarimir', 'Piggy Azalea', 'Cyril Piggis'];

// These will be Redis variables I think?
const activeGames = [];
const gameArchives = [];
const playerStats = {};

// Basic game rules, might be editable later
const sides = 6;
const goal = 100;
const bust = 1;

// -----------------------------
// - - - - - FUNCTIONS - - - - -
// -----------------------------

// Returns a random integer 1 - sides, inclusive
const rollDie = (s) => 1 + Math.floor((s * Math.random()));

// Adds a player to the stat list
const addPlayer = (id) => {
  playerStats[`${id}`] = {
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

  return playerStats[`${id}`];
};

// Starts a game between two players
const startGame = (playerID, opponentID) => {
  // Add players to list if new
  if (!playerStats[`${playerID}`]) { addPlayer(playerID); }
  if (!playerStats[`${opponentID}`]) { addPlayer(opponentID); }

  // Create new active game object
  const newGame = {};
  newGame[`${playerID}`] = {
    score: 0,
    turn: [],
    profit: 0,
    history: [],
  };
  newGame[`${opponentID}`] = {
    score: 0,
    turn: [],
    profit: 0,
    history: [],
  };
  // Whoever was challenged should go first
  newGame.activePlayer = opponentID;
  newGame.waitingPlayer = playerID;

  // Add to active games array
  activeGames.push(newGame);
};

// Ends a game between two players
const endGame = (game) => {
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

  // Increment all-time games finished stat
  playerStats[`${newArchive.winner}`].games++;
  playerStats[`${newArchive.loser}`].games++;

  playerStats[`${newArchive.winner}`].wins++; // Increment all-time wins stat
  playerStats[`${newArchive.loser}`].losses++; // Increment all-time losses stat

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
const endTurn = (g, playerID) => {
  const game = g;
  const player = game[`${playerID}`]; // Initialize player

  playerStats[`${playerID}`].profit += player.profit; // Add to all-time profit stat
  playerStats[`${playerID}`].turns++; // Increment all-time turns stat

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
    game.waitingPlayer = playerID;
    game.activePlayer = otherGuy;
  }

  return player.score;
};

// Guides a player through their turn
const takeTurn = (game, playerID, desiredRolls) => {
  const player = game[`${playerID}`]; // Initialize player

  for (let i = 0; i < desiredRolls; i++) {
    // Roll and add it to current turn
    const roll = rollDie(sides);
    player.turn.push(roll);

    playerStats[`${playerID}`].rolls.total++; // Increment all-time total rolls stat
    playerStats[`${playerID}`].rolls[`${roll}`]++; // Increment all-time integer rolls stat

    // End turn if busted
    if (roll === bust) {
      playerStats[`${playerID}`].busts++; // Increment all-time busts stat
      player.profit = 0;
      endTurn(game, playerID);
      return 0;
    }

    // For some reason this doesn't properly add if you make it a variable
    player.profit += roll;
  }

  return player.profit;
};

// Bro for it
const broForIt = (game, playerID) => {
  const player = game[`${playerID}`]; // Initialize player
  playerStats[`${playerID}`].bros++; // Increment all-time total bros stat

  while (true) {
    // Roll and add it to current turn
    const roll = rollDie(sides);
    player.turn.push(roll);

    playerStats[`${playerID}`].rolls.total++; // Increment all-time total rolls stat
    playerStats[`${playerID}`].rolls[`${roll}`]++; // Increment all-time integer rolls stat

    // End turn if busted
    if (roll === bust) {
      playerStats[`${playerID}`].busts++; // Increment all-time busts stat
      player.profit = 0;
      endTurn(game, playerID);
      return 0;
    }

    // Add roll to profit
    player.profit += roll;
    if (player.score + player.profit >= goal) {
      return endTurn(game, playerID);
    }
  }
};

// Exports
module.exports = {
  playerStats,
  activeGames,
  gameArchives,
  takeTurn,
  endTurn,
  broForIt,
  startGame,
  addPlayer,
};
