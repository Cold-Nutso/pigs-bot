// ---------------------------
// - - - - - IMPORTS - - - - -
// ---------------------------

const { rollDie, getPlayer, getServer } = require('./helper.js');

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
const startGame = async (turnOrder, guildID) => {
  const newGame = {}; // Create new active game object
  newGame.turnOrder = turnOrder; // Set turn order
  turnOrder.forEach((id) => { // Add id's as properties
    newGame[`${id}`] = {
      score: 0, turn: [], profit: 0, history: [],
    };
  });

  const activePlayer = turnOrder[0];
  newGame.activePlayer = activePlayer; // Set who goes first

  const sDoc = await getServer(guildID); // Grab the Server doc
  sDoc.activeGames.push(newGame); // Add pig-pen id
  await sDoc.save(); // Save Server doc
};

// Ends a game between two players
const endGame = async (sDoc, gObj) => {
  const gameObj = gObj; // Has to be done
  const serverDoc = sDoc; // Has to be done

  const archive = { losers: [] }; // Create new finished game object
  archive.endDate = new Date(); // Set end date

  // Update data
  await serverDoc.turnOrder.forEach(async (id) => {
    // Transfer score and history data
    archive[`${id}`] = {
      score: gameObj[`${id}`].score,
      history: gameObj[`${id}`].history,
    };

    const pDoc = await getPlayer(id); // Get Player doc
    pDoc.games += 1; // Increment all-time games finished

    // Check if loser
    if (id !== gameObj.winner) {
      pDoc.losses += 1; // Increment all-time losses
      archive.losers.push(id); // Add id to losers
    } else {
      pDoc.wins += 1; // Increment all-time wins
    }

    await pDoc.save(); // Save Player doc
  });

  serverDoc.finishedGames.push(archive); // Add archive to finished games

  // Remove game from active games
  const i = serverDoc.activeGames.indexOf(gameObj);
  if (i > -1) { serverDoc.activeGames.splice(i, 1); }
};

// Ends a player's turn
// Returns the score
const endTurn = (sDoc, gObj, pDoc) => {
  const serverDoc = sDoc; // Has to be done
  const gameObj = gObj; // Has to be done
  const playerDoc = pDoc; // Has to be done
  const gamePlayer = gameObj[`${pDoc.discordID}`];

  playerDoc.profit += gamePlayer.profit; // Increment all-time profit
  playerDoc.turns += 1; // Increment all-time turns

  gamePlayer.score += gamePlayer.profit; // Add profit to in-game score
  gamePlayer.profit = 0; // Reset turn profit to zero
  gamePlayer.history.push(gamePlayer.turn); // Add turn to turn history
  gamePlayer.turn = []; // Clear current turn array

  // Set winner if necessary
  if (gamePlayer.score >= goal) {
    gameObj.winner = pDoc.discordID; // Set winner
    endGame(gameObj, serverDoc); // End the game
  } else { // Swap turns
    let turnIndex = gameObj.turnOrder.indexOf(pDoc.discordID); // Get turn index
    turnIndex += 1; // Increment to next player
    if (turnIndex >= gameObj.turnOrder.length) { turnIndex = 0; } // Set back to 0 if needed
    gameObj.activePlayer = gameObj.turnOrder[turnIndex]; // Set active player
  }

  return gamePlayer.score;
};

// Guides a player through their turn
const takeTurn = (sDoc, gObj, pDoc, desiredRolls) => {
  const serverDoc = sDoc; // Has to be done
  const gameObj = gObj; // Has to be done
  const playerDoc = pDoc; // Has to be done
  const gamePlayer = gameObj[`${pDoc.discordID}`];

  for (let i = 0; i < desiredRolls; i++) {
    // Roll and add it to current turn
    const roll = rollDie(sides);
    gamePlayer.turn.push(roll);

    playerDoc.rolls[0] += 1; // Increment all-time rolls
    playerDoc.rolls[roll] += 1; // Increment all-time specific rolls

    // End turn if busted
    if (roll === bust) {
      playerDoc.busts += 1; // Increment all-time busts
      gamePlayer.profit = 0; // Reset profit to 0
      endTurn(serverDoc, gameObj, playerDoc); // End the turn
      return 0;
    }

    // For some reason this doesn't properly add if you make it a variable
    gamePlayer.profit += roll;
  }

  return gamePlayer.profit;
};

// Bro for it
const broForIt = (sDoc, gObj, pDoc) => {
  const serverDoc = sDoc; // Has to be done
  const gameObj = gObj; // Has to be done
  const playerDoc = pDoc; // Has to be done
  const gamePlayer = gameObj[`${pDoc.discordID}`];

  playerDoc.bros += 1; // Increment all-time bros

  while (true) {
    // Roll and add it to current turn
    const roll = rollDie(sides);
    gamePlayer.turn.push(roll);

    playerDoc.rolls[0] += 1; // Increment all-time total rolls
    playerDoc.rolls[roll] += 1; // Increment all-time specific rolls

    // End turn if busted
    if (roll === bust) {
      playerDoc.busts += 1; // Increment all-time busts
      gamePlayer.profit = 0; // Reset profit to 0
      endTurn(serverDoc, gameObj, playerDoc); // End the turn
      return 0;
    }

    gamePlayer.profit += roll; // Add roll to in-game profit

    if (gamePlayer.score + gamePlayer.profit >= goal) { // Check for potential win
      return endTurn(serverDoc, gameObj, playerDoc); // End the turn
    }
  }
};

// Exports
module.exports = {
  takeTurn,
  endTurn,
  broForIt,
  startGame,
};
