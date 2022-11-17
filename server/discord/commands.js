// ---------------------------
// - - - - - IMPORTS - - - - -
// ---------------------------

const { EmbedBuilder } = require('discord.js');
const {
  client, getUserFromID, getUserFromMention, getPlayer,
} = require('./helper.js');
const {
  takeTurn, endTurn, startGame, broForIt, findActiveGame,
} = require('./game.js');

// ----------------------------------
// - - - - - INITIALIZATION - - - - -
// ----------------------------------

const diceEmoji = [
  '',
  '<:roll1:1029212478405627944>',
  '<:roll2:1029212519551737926>',
  '<:roll3:1029212537234919494>',
  '<:roll4:1029212554876178542>',
  '<:roll5:1029212579685474374>',
  '<:roll6:1029212581019263086>',
];

// -----------------------------
// - - - - - FUNCTIONS - - - - -
// -----------------------------

const help = (channel) => {
  // Construct the embed
  const helpEmbed = new EmbedBuilder()
    .setTitle("Here's what you can do: ")
    .addFields(
      {
        name: 'Mention Commands',
        value: `
      > Prefix with "${client.user} "\n
      > Recognized in any channel\n
      - **help** *Get command descriptions.*\n
      - **rules** *Get info on how to play the game.*\n
      - **pen** *Create a new pig-pen text channel.*`,
      },
      {
        name: 'Game Commands', value: `
      > Prefix with "."\n
      > Recognized in pig-pen channels\n
      - **play <@user>** *Begin a game with the mentioned user.*\n
      - **roll <int>** *Roll a specified number of times.*\n
      - **call** *End your turn and add to your score.*\n
      - **bro** *Roll until you win or bust.*\n
      - **stats <@user>** *View the mentioned user's statistics.*`,
      },
    );

  channel.send({ embeds: [helpEmbed] }); // Send it
};

const rules = (channel) => {
  // Construct the embed
  const rulesEmbed = new EmbedBuilder()
    .setTitle('How to play Pigs')
    .addFields(
      { name: 'What is Pigs?', value: '[Pigs](https://en.wikipedia.org/wiki/Pig_(dice_game)) is a dead-simple dice game from 1945. Players take         turns rolling a die to add to their total score.' },
      { name: 'On Your Turn', value: 'Roll a die and add its value to your running total. You can choose to keep rolling, or stop and add what you have to your total score.' },
      { name: 'Rolling a 1', value: 'If you roll a 1, your turn ends immediately and nothing is added to your total score. Sad.' },
      { name: 'Win Condition', value: 'Be the first to reach a total score of 100!' },
    );

  channel.send({ embeds: [rulesEmbed] }); // Send it
};

const writeTurnResponse = (userProfit, userTurn, userScore, turnType) => {
  let response = '';

  // Check if turn is a call
  if (turnType === 'call') {
    response += `You called at **${userProfit}**, for a total score of **${userScore}**`;
    if (userScore >= 100) { response += '\n**YOU WON!**'; }
    return response;
  }

  // Otherwise, list the results
  let turnList = 'You rolled: ';
  for (let i = 0; i < userTurn.length; i++) {
    turnList += `**${userTurn[i]}**`;
    if (i < userTurn.length - 1) { turnList += ', '; }
  }

  // Check if turn ended in a bust
  if (userProfit === 0) {
    response += `${diceEmoji[1]} **BUST!** ${diceEmoji[1]}\n`;
    response += turnList;
    response += `\nScore is still **${userScore}**`;

    // Calculate past profit
    let pastProfit = -1;
    userTurn.forEach((e) => { pastProfit += e; });
    if (pastProfit > 0) { response += `\n*You almost had ${pastProfit} in profit.*`; }
  } else if (turnType === 'roll') {
    response += turnList;
    response += `\nCurrent profit: **${userProfit}**`;
  } else if (turnType === 'bro') {
    response += turnList;
    response += `\nFinal score is **${userScore}**`;
    response += '**YOU WON!**\n';
  } else {
    response += `Oink! Somehow you took a "${turnType}" type turn.`;
  }

  return response; // Send it
};

// Gets the ai to take a turn
const aiTurn = async (channel, activeGame) => {
  const botID = client.user.id; // Initialize player id
  let response = ''; // Default response string
  const pDoc = await getPlayer(botID); // Get bot doc
  const botProfit = broForIt(activeGame, pDoc); // Take the actual turn
  await pDoc.save(); // Save player doc

  // Grab variables
  const botHistory = activeGame[`${botID}`].history;
  const botTurn = botHistory[botHistory.length - 1];
  const botScore = activeGame[`${botID}`].score;

  if (botProfit === 0) {
    // Construct response
    response += '**Bust!** I rolled: ';
    for (let i = 0; i < botTurn.length; i++) {
      if (i < botTurn.length - 1) { response += `${botTurn[i]}, `; } else { response += `${botTurn[i]}`; }
    }
    response += `\nMy total score: ${botScore}`;

    // Calculate past profit
    let pastProfit = -1;
    botTurn.forEach((e) => { pastProfit += e; });
    if (pastProfit > 0) { response += `\nI almost had ${pastProfit} in profit.`; }
  } else {
    // Construct response
    response += 'I rolled: ';
    for (let i = 0; i < botTurn.length; i++) {
      if (i < botTurn.length - 1) { response += `${botTurn[i]}, `; } else { response += `${botTurn[i]}`; }
    }
    response += `\nMy Final Score: ${botScore}\nI won!`;
  }

  channel.send(response); // Send it
};

// Handles input and response for stats command
// Requires ".stats" and an optional member mention
const handleStats = async (msg, param) => {
  let targetUser = msg.author; // Set targetUser to author
  // If there's a parameter, assign it to targetUser
  if (param) { targetUser = getUserFromMention(param); }

  if (!targetUser) { // If no member could be parsed from the parameter
    msg.reply(`Oink! Your parameter must be a user mention.\nFor example: ${client.user}`);
  } else { // If a member was successfully found
    const pDoc = await getPlayer(targetUser.id); // Get player doc from database

    const statsEmbed = new EmbedBuilder() // Create a new embed
      .setTitle(`${targetUser.username}'s Statistics`)
      .setThumbnail(targetUser.avatarURL())
      .addFields(
        { name: `${pDoc.games} games finished`, value: `> **${pDoc.wins}** wins / **${pDoc.losses}** losses\n> **${pDoc.profit}** points earned` },
        { name: `${pDoc.turns} turns taken`, value: `> **${pDoc.busts}** ended in busts\n> **${pDoc.bros}** were bro'ing for it` },
      );
    // Possibly useful embed stuff:   .setColor(0xE296CB)   '\u200B' = blank

    let rollStats = ''; // Create and populate roll statistics field
    rollStats += `> ${diceEmoji[1]} **${pDoc.rolls[1]}** - `;
    rollStats += `${diceEmoji[2]} **${pDoc.rolls[2]}** - `;
    rollStats += `${diceEmoji[3]} **${pDoc.rolls[3]}**\n> \n> `;
    rollStats += `${diceEmoji[4]} **${pDoc.rolls[4]}** - `;
    rollStats += `${diceEmoji[5]} **${pDoc.rolls[5]}** - `;
    rollStats += `${diceEmoji[6]} **${pDoc.rolls[6]}**`;
    statsEmbed.addFields({ // Add field to embed
      name: `${pDoc.rolls.total} dice rolled`, value: rollStats,
    });

    msg.channel.send({ embeds: [statsEmbed] }); // Send it
  }
};

// Handles input and response for roll command
// Requires ".roll" and an optional integer
const handleRoll = async (msg, activeGame, param) => {
  const userID = msg.author.id; // Initialize player id

  if (activeGame && activeGame.activePlayer === userID) {
    let p = param;
    // Handle the parameter
    if (!p) {
      p = 1; // No param defaults to 1
    } else if (parseInt(p, 10) <= 0) {
      msg.reply('Oink! Your parameter has to be a positive integer.\nFor example: 2');
      return;
    }

    const pDoc = await getPlayer(userID); // Get player doc
    const userProfit = takeTurn(activeGame, pDoc, p); // Take the actual turn
    await pDoc.save(); // Save player doc

    const userHistory = activeGame[`${userID}`].history;
    let userTurn;
    const userScore = activeGame[`${userID}`].score;

    // If busted, use last turn in history
    // Otherwise, use current turn
    if (userProfit === 0) {
      userTurn = userHistory[userHistory.length - 1];
    } else {
      userTurn = activeGame[`${userID}`].turn;
    }

    // Send response
    msg.reply(writeTurnResponse(userProfit, userTurn, userScore, 'roll'));

    // Since turn is over, bot should go
    if (userProfit === 0 && activeGame.activePlayer === client.user.id) {
      aiTurn(msg.channel, activeGame);
    }
  } else if (activeGame) {
    if (activeGame.activePlayer === client.user.id) {
      msg.reply('Oink! It\'s my turn!');
    } else {
      msg.reply(`Oink! It's ${activeGame.activePlayer}'s turn!`);
    }
  } else {
    msg.reply('Oink! You aren\'t even playing a game right now!');
  }
};

// Handles input and response for bro command
// Requires ".bro"
const handleBro = async (msg, activeGame) => {
  const userID = msg.author.id; // Initialize player id

  if (activeGame && activeGame.activePlayer === userID) {
    const pDoc = await getPlayer(userID); // Get player doc
    const userProfit = broForIt(activeGame, pDoc); // Take the actual turn
    await pDoc.save(); // Save player doc

    const userHistory = activeGame[`${userID}`].history;
    const userTurn = userHistory[userHistory.length - 1];
    const userScore = activeGame[`${userID}`].score;

    // Send response
    msg.reply(writeTurnResponse(userProfit, userTurn, userScore, 'bro'));

    // Since turn is over, bot should go
    if (userProfit === 0 && activeGame.activePlayer === client.user.id) {
      aiTurn(msg.channel, activeGame);
    }
  } else if (activeGame) {
    if (activeGame.activePlayer === client.user.id) {
      msg.reply('It\'s my turn!');
    } else {
      msg.reply(`It's ${activeGame.activePlayer}'s turn!`);
    }
  } else {
    msg.reply('You aren\'t even playing a game right now!');
  }
};

// Handles input and response for call command
// Requires ".call"
const handleCall = async (msg, activeGame) => {
  const userID = msg.author.id; // Initialize player id

  if (activeGame && activeGame.activePlayer === userID) {
    // Grab variables
    const userProfit = activeGame[`${userID}`].profit;

    const pDoc = await getPlayer(userID); // Get player doc
    const userScore = endTurn(activeGame, pDoc); // End the actual turn
    await pDoc.save(); // Save player doc

    // Send response
    msg.reply(writeTurnResponse(userProfit, null, userScore, 'call'));
  } else if (activeGame) {
    if (activeGame.activePlayer === client.user.id) { msg.reply('Oink! It\'s my turn!'); } else { msg.reply(`Oink! It's ${activeGame.activePlayer}'s turn!`); }
  } else {
    msg.reply('Oink! You aren\'t in a game right now!');
  }

  // Since turn is over, bot should go
  if (activeGame.activePlayer === client.user.id) {
    aiTurn(msg.channel, activeGame);
  }
};

// Handles input and response for play command
// Requires ".play" and an optional member mention
const handleStart = async (msg, param) => {
  const player = msg.author;
  const opponent = getUserFromMention(param);
  let response = ''; // Initialize response

  if (!param) {
    response += 'In theory, you\'d need another person to play against. Oink.';
  } else if (!opponent) {
    response += `Oink! Your parameter must be a user mention.\nFor example: ${client.user}`;
  } else {
    const activeGame = findActiveGame(player.id); // Check for active game

    if (opponent.id === player.id) {
      // Make sure no-one's mentioning themselves
      response += 'Oink! You can\'t play against yourself.';
    } else if (activeGame) {
      // See who's turn it is
      const yourTurn = (activeGame.activePlayer === player.id);
      // THIS SHOULD BE AN ACTUAL USER, NOT JUST A STRING
      let currOpponentID; // Found out current opponent id
      if (yourTurn) {
        currOpponentID = activeGame.waitingPlayer;
      } else {
        currOpponentID = activeGame.activePlayer;
      }

      // Construct response
      response += `Oink! You're already in a game with ${getUserFromID(currOpponentID)}.`;
      if (yourTurn) { response += '\nIt\'s your turn, by the way.'; } else { response += '\nYou\'re waiting on their turn.'; }
    } else {
      if (opponent.id === client.user.id) { response += 'Sure, let\'s play a game!'; } else { response += `Hey ${opponent}!\n${player} started a game of pigs with you!`; }

      const pDoc = await getPlayer(player.id); // Get player doc
      const oDoc = await getPlayer(opponent.id); // Get opponent doc
      startGame(pDoc, oDoc); // Start the actual game
    }
  }

  msg.reply(response); // Send it

  const activeGame = findActiveGame(player.id);
  // Since turn is over, bot should go
  if (activeGame && activeGame.activePlayer === client.user.id) {
    aiTurn(msg.channel, activeGame);
  }
};

// Exports
module.exports = {
  help,
  rules,
  handleStart,
  handleRoll,
  handleCall,
  handleBro,
  handleStats,
};
