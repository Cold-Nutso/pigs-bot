// ---------------------------
// - - - - - IMPORTS - - - - -
// ---------------------------

const { rollDie, getPlayer } = require('./helper.js');

// ----------------------------------
// - - - - - INITIALIZATION - - - - -
// ----------------------------------

// Basic game rules, might be editable later
const sides = 6;
const goal = 100;
const bust = 1;

// -----------------------------
// - - - - - FUNCTIONS - - - - -
// -----------------------------

// Starts a game
const startGame = async (serverDoc, turnOrder) => {
  // Eslint gets mad if you manipulate parameters
  const sDoc = serverDoc;
  const newGame = {}; // Create new active game object

  newGame.turnOrder = turnOrder; // Set turn order

  turnOrder.forEach((id) => { // Add id's as properties
    newGame[`${id}`] = {
      score: 0, turn: [], profit: 0, history: [],
    };
  });

  const activePlayer = turnOrder[0]; // Grab initial index
  newGame.activePlayer = activePlayer; // Set id to active player

  sDoc.activeGames.push(newGame); // Add pig-pen id

  await sDoc.save();
};

// Ends a game between two players
const endGame = async (serverDoc, activeGameObj) => {
  // Eslint gets mad if you manipulate parameters
  const sDoc = serverDoc;
  const gObj = activeGameObj;

  const archive = { losers: [] }; // Create new finished game object
  archive.endDate = new Date(); // Set end date

  // Update data
  gObj.turnOrder.forEach(async (id) => {
    const pDoc = await getPlayer(id);

    // Transfer score and history data
    archive[`${id}`] = {
      score: gObj[`${id}`].score,
      history: gObj[`${id}`].history,
    };

    pDoc.games += 1; // Increment all-time games finished

    // Check if loser
    if (gObj[`${id}`].score < goal) {
      pDoc.losses += 1; // Increment all-time losses
      archive.losers.push(id); // Add id to losers
    } else {
      archive.winner = id;
      pDoc.wins += 1; // Increment all-time wins
    }

    await pDoc.save(); // Save Player doc
  });

  sDoc.finishedGames.push(archive); // Add archive to finished games

  // Remove game from active games
  const i = sDoc.activeGames.indexOf(gObj);
  if (i > -1) { sDoc.activeGames.splice(i, 1); }
};

// Ends a player's turn
const endTurn = async (serverDoc, activeGameObj, playerDoc) => {
  // Eslint gets mad if you manipulate parameters
  const sDoc = serverDoc;
  const gObj = activeGameObj;
  const pDoc = playerDoc;
  const gamePlayer = gObj[`${pDoc.discordID}`];

  pDoc.profit += gamePlayer.profit; // Increment all-time profit
  pDoc.turns += 1; // Increment all-time turns

  gamePlayer.score += gamePlayer.profit; // Add profit to in-game score
  gamePlayer.profit = 0; // Reset turn profit to zero
  gamePlayer.history.push(gamePlayer.turn); // Add turn to turn history
  gamePlayer.turn = []; // Clear current turn array

  // Set winner if necessary
  if (gamePlayer.score >= goal) {
    // Update the active game object in the database
    sDoc.activeGames[sDoc.activeGames.indexOf(gObj)] = gObj;

    await endGame(sDoc, gObj, pDoc); // End the game
  } else { // Swap turns
    let turnIndex = gObj.turnOrder.indexOf(pDoc.discordID); // Get turn index
    turnIndex += 1; // Increment to next player
    if (turnIndex >= gObj.turnOrder.length) { turnIndex = 0; } // Set back to 0 if needed
    gObj.activePlayer = gObj.turnOrder[turnIndex]; // Set active player
  }

  // Update the active game object in the database
  sDoc.activeGames[sDoc.activeGames.indexOf(gObj)] = gObj;

  return gamePlayer.score; // Return current score
};

// Guides a player through their turn
const takeTurn = async (serverDoc, activeGameObj, playerDoc, desiredRolls) => {
  // Eslint gets mad if you manipulate parameters
  const sDoc = serverDoc;
  const gObj = activeGameObj;
  const pDoc = playerDoc;
  const gPlayer = gObj[`${pDoc.discordID}`];

  // Loop for desired roll amount
  for (let i = 0; i < desiredRolls; i++) {
    const roll = rollDie(sides); // Roll die
    gPlayer.turn.push(roll); // Add roll to current turn

    pDoc.rolls[0] += 1; // Increment all-time rolls
    pDoc.rolls[roll] += 1; // Increment all-time specific rolls

    // End turn if busted
    if (roll === bust) {
      pDoc.busts += 1; // Increment all-time busts
      gPlayer.profit = 0; // Reset profit to 0
      endTurn(sDoc, gObj, pDoc); // End the turn
      return 0; // Return current profit
    }

    gPlayer.profit += roll; // Add roll to current profit
  }

  // Update the active game object in the database
  sDoc.activeGames[sDoc.activeGames.indexOf(gObj)] = gObj;

  return gPlayer.profit; // Return current profit
};

// Rolls until player wins or busts
const broForIt = async (serverDoc, activeGameObj, playerDoc) => {
  // Eslint gets mad if you manipulate parameters
  const sDoc = serverDoc;
  const gObj = activeGameObj;
  const pDoc = playerDoc;
  const gPlayer = gObj[`${pDoc.discordID}`];

  pDoc.bros += 1; // Increment all-time bros

  // Eslint get mad dislikes "while (true)""
  for (;;) {
    const roll = rollDie(sides); // Roll die
    gPlayer.turn.push(roll); // Add roll to current turn

    pDoc.rolls[0] += 1; // Increment all-time total rolls
    pDoc.rolls[roll] += 1; // Increment all-time specific rolls

    // End turn if busted
    if (roll === bust) {
      pDoc.busts += 1; // Increment all-time busts
      gPlayer.profit = 0; // Reset profit to 0
      endTurn(sDoc, activeGameObj, pDoc); // End the turn
      return 0; // Return current profit
    }

    gPlayer.profit += roll; // Add roll to current profit

    if (gPlayer.score + gPlayer.profit >= goal) { // Check for potential win
      return endTurn(sDoc, gObj, pDoc); // End the turn
    }
  }
};

// Exports
module.exports = {
  takeTurn,
  endTurn,
  broForIt,
  startGame,
  goal,
};
