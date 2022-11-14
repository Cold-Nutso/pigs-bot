// --------------------------
// - - - - - FIELDS - - - - -
// --------------------------

// const pigNames = ['Mr. Pig', 'Piggie Smalls', 'Piggle Rick', 'Swiney Todd', 'The Pig Lebowski'
// 'Model 01-NK', 'Boarimir', 'Piggy Azalea', 'Cyril Piggis'];

const activeGames = [];
const gameArchives = [];

const playerStats = {};

const sides = 6;
const goal = 100;
const bust = 1;

// -----------------------------
// - - - - - FUNCTIONS - - - - -
// -----------------------------

// Returns a random integer 1 - sides, inclusive
const rollDie = (s) => 1 + Math.floor((s * Math.random()));

// Adds a player to the stat list
const addPlayer = (name) => {
  playerStats[`${name}`] = {
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

  return playerStats[`${name}`];
};

// Starts a game between two players
const startGame = (playerName, opponentName) => {
  // Add players to list if new
  if (!playerStats[`${playerName}`]) { addPlayer(playerName); }
  if (!playerStats[`${opponentName}`]) { addPlayer(opponentName); }

  // Increment all-time games stats
  playerStats[`${playerName}`].games++;
  playerStats[`${opponentName}`].games++;

  // Create new active game object
  const newGame = {};
  newGame[`${playerName}`] = {
    score: 0,
    turn: [],
    profit: 0,
    history: [],
  };
  newGame[`${opponentName}`] = {
    score: 0,
    turn: [],
    profit: 0,
    history: [],
  };
  // Whoever was challenged should go first
  newGame.activePlayer = opponentName;
  newGame.waitingPlayer = playerName;

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
const endTurn = (g, playerName) => {
  const game = g;
  const player = game[`${playerName}`]; // Initialize player

  playerStats[`${playerName}`].profit += player.profit; // Add to all-time profit stat
  playerStats[`${playerName}`].turns++; // Increment all-time turns stat

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
    game.waitingPlayer = playerName;
    game.activePlayer = otherGuy;
  }

  return player.score;
};

// Guides a player through their turn
const takeTurn = (game, playerName, desiredRolls) => {
  const player = game[`${playerName}`]; // Initialize player

  for (let i = 0; i < desiredRolls; i++) {
    // Roll and add it to current turn
    const roll = rollDie(sides);
    player.turn.push(roll);

    playerStats[`${playerName}`].rolls.total++; // Increment all-time total rolls stat
    playerStats[`${playerName}`].rolls[`${roll}`]++; // Increment all-time integer rolls stat

    // End turn if busted
    if (roll === bust) {
      playerStats[`${playerName}`].busts++; // Increment all-time busts stat
      player.profit = 0;
      endTurn(game, playerName);
      return 0;
    }

    // For some reason this doesn't properly add if you make it a variable
    player.profit += roll;
  }

  return player.profit;
};

// Bro for it
const broForIt = (game, playerName) => {
  const player = game[`${playerName}`]; // Initialize player
  playerStats[`${playerName}`].bros++; // Increment all-time total bros stat

  while (true) {
    // Roll and add it to current turn
    const roll = rollDie(sides);
    player.turn.push(roll);

    playerStats[`${playerName}`].rolls.total++; // Increment all-time total rolls stat
    playerStats[`${playerName}`].rolls[`${roll}`]++; // Increment all-time integer rolls stat

    // End turn if busted
    if (roll === bust) {
      playerStats[`${playerName}`].busts++; // Increment all-time busts stat
      player.profit = 0;
      endTurn(game, playerName);
      return 0;
    }

    // Add roll to profit
    player.profit += roll;
    if (player.score + player.profit >= goal) {
      return endTurn(game, playerName);
    }
  }
};

// ---------------------------
// - - - - - EXPORTS - - - - -
// ---------------------------

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
