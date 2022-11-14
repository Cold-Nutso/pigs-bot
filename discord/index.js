// Discord bot guide:
// https://buddy.works/tutorials/how-to-build-a-discord-bot-in-node-js-for-beginners

require('dotenv').config(); // Initialize dotenv
const { Client, IntentsBitField, ChannelType, PermissionsBitField, EmbedBuilder } = require('discord.js'); // Import discord.js
const pigs = require('./pigs.js'); // Import pigs.js

// Create intents
const myIntents = new IntentsBitField();
myIntents.add(
  IntentsBitField.Flags.Guilds, 
  IntentsBitField.Flags.GuildMembers, 
  IntentsBitField.Flags.GuildMessages, 
  IntentsBitField.Flags.MessageContent
  );

// Create new client
const client = new Client({ intents: myIntents });

// Client Token is stored as an environmental variable

const pigPenIDs = {};

const diceEmoji = [
  '',
  '<:roll1:1029212478405627944>',
  '<:roll2:1029212519551737926>',
  '<:roll3:1029212537234919494>',
  '<:roll4:1029212554876178542>',
  '<:roll5:1029212579685474374>',
  '<:roll6:1029212581019263086>',
]



// -----------------------------
// - - - - - FUNCTIONS - - - - -
// -----------------------------

// Finds an active game a player is in
const getActiveGame = (playerName) => {
  let foundGame = null;

  for (let game of pigs.activeGames) {
    if (game[`${playerName}`]) {
      foundGame = game;
      break;
    }
  }
  
  return foundGame;
};

// This is straight from discord.js documentation
function getUserFromMention(mention) {
	if (!mention) return null;

	if (mention.startsWith('<@') && mention.endsWith('>')) {
		mention = mention.slice(2, -1);

		if (mention.startsWith('!')) {
			mention = mention.slice(1);
		}

		return client.users.cache.get(mention);
	}
};

// Not sure this is necessary
function getUserFromID(id) {
	if (!id) return null;

	return client.users.cache.get(id);
};

const writeTurnResponse = (userProfit, userTurn, userScore, turnType) => {
  let response = ``;

  // Check if turn is a call
  if (turnType === "call") {
    response += `You called at **${userProfit}**, for a total score of **${userScore}**`;
    userScore >= 100 ? response += `**\nYOU WON!**` : null;
    return response;
  }

  // Otherwise, list the results
  let turnList = `You rolled: `;
  for (let i=0; i<userTurn.length; i++) {
    turnList += `**${userTurn[i]}**`;
    i < userTurn.length-1 ? turnList += `, ` : null;
  }

  // Check if turn ended in a bust
  if (userProfit === 0) {
    response += `${diceEmoji[1]} **BUST!** ${diceEmoji[1]}\n`;
    response += turnList;
    response += `\nScore is still **${userScore}**`;

    // Calculate past profit
    let pastProfit = -1;
    userTurn.forEach(e => pastProfit += e);
    pastProfit > 0 ? response += `\n*You almost had ${pastProfit} in profit.*` : null;
  } else if (turnType === "roll") {
    response += turnList;
    response += `\nCurrent profit: **${userProfit}**`;
  } else if (turnType === "bro") {
    response += turnList;
    response += `\nFinal score is **${userScore}**`;
    response += `**YOU WON!**\n`;
  } else {
    response += `Oink! Somehow you took a "${turnType}" type turn.`;
  }
  
  return response; // Send it
}

// Handles input and response for roll command
// Requires ".roll" and an optional integer
const handleRoll = (msg, activeGame, param) => {
  const userName = msg.author.username; // Initialize player name

  if (activeGame && activeGame.activePlayer === userName) {
    // Handle the parameter
    if (!param) {
      param = 1; // No param defaults to 1
    } else if (parseInt(param) <= 0) {
      msg.reply("Oink! Your parameter has to be a positive integer.\nFor example: 2");
      return;
    }

    // Grab variables
    const userProfit = pigs.takeTurn(activeGame, userName, param); // Take the actual turn
    const userHistory = activeGame[`${userName}`].history;
    let userTurn;
    const userScore = activeGame[`${userName}`].score;

    // If busted, use last turn in history
    // Otherwise, use current turn
    userProfit === 0 ? userTurn = userHistory[userHistory.length-1] : userTurn = activeGame[`${userName}`].turn;

    // Send response
    msg.reply(writeTurnResponse(userProfit, userTurn, userScore, "roll"));

    // Since turn is over, bot should go
    if (userProfit === 0 && activeGame.activePlayer === client.user.username) {
      handleTurn(msg.channel, activeGame);
    }
  } else if (activeGame) {
    activeGame.activePlayer === client.user.username ? msg.reply(`Oink! It's my turn!`) : msg.reply(`Oink! It's ${activeGame.activePlayer}'s turn!`);
  } else {
    msg.reply(`Oink! You aren't even playing a game right now!`);
  }
};

// Handles input and response for bro command
// Requires ".bro"
const handleBro = (msg, activeGame) => {
  const userName = msg.author.username; // Initialize player name

  if (activeGame && activeGame.activePlayer === userName) {
    // Grab variables
    const userProfit = pigs.broForIt(activeGame, userName); // Take the actual turn
    const userHistory = activeGame[`${userName}`].history;
    const userTurn = userHistory[userHistory.length-1];
    const userScore = activeGame[`${userName}`].score;

    // Send response
    msg.reply(writeTurnResponse(userProfit, userTurn, userScore, "bro"));

    // Since turn is over, bot should go
    if (userProfit === 0 && activeGame.activePlayer === client.user.username) {
      handleTurn(msg.channel, activeGame);
    }
  } else if (activeGame) {
    activeGame.activePlayer === client.user.username ? msg.reply(`It's my turn!`) : msg.reply(`It's ${activeGame.activePlayer}'s turn!`);
  } else {
    msg.reply(`You aren't even playing a game right now!`);
  }
};

// Handles input and response for call command
// Requires ".call"
const handleCall = (msg, activeGame) => {
  const userName = msg.author.username; // Initialize player name

  if (activeGame && activeGame.activePlayer === userName) {
    // Grab variables
    const userProfit = activeGame[`${userName}`].profit;
    const userScore = pigs.endTurn(activeGame, userName);

    // Send response
    msg.reply(writeTurnResponse(userProfit, null, userScore, "call"));
  } else if (activeGame) {
    activeGame.activePlayer === client.user.username ? msg.reply(`Oink! It's my turn!`) : msg.reply(`Oink! It's ${activeGame.activePlayer}'s turn!`);
  } else {
    msg.reply(`Oink! You aren't in a game right now!`);
  }

  // Since turn is over, bot should go
  if (activeGame.activePlayer === client.user.username) {
    handleTurn(msg.channel, activeGame);
  }
};



// Handles input and response for play command
// Requires ".play" and an optional member mention
const handleStart = (msg, param) => {
  const playerName = msg.author.username;
  const opponent = getUserFromMention(param);
  let response = ``; // Initialize response

  if (!param) {
    response += `In theory, you'd need another person to play against. Oink.`;
  } else if (!opponent) {
    response += `Oink! Your parameter must be a user mention.\nFor example: ${client.user}`;
  } else {
    const activeGame = getActiveGame(playerName); // Check for active game

    if (opponent.username === playerName) {
      // Make sure no-one's mentioning themselves
      response += `Oink! You can't play against yourself.`;
    } else if (activeGame) {
      // See who's turn it is
      const yourTurn = activeGame.activePlayer === playerName;
      // THIS SHOULD BE AN ACTUAL USER, NOT JUST A STRING
      let currentOpponent; // Found out current opponent name
      yourTurn ? currentOpponent = activeGame.waitingPlayer : currentOpponent = activeGame.activePlayer;

      // Construct response
      response += `Oink! You're already in a game with ${currentOpponent}.`;
      yourTurn ? response += `\nIt's your turn, by the way.` : response += `\nYou're waiting on their turn.`
    } else {
      opponent.username === client.user.username ? response += `Sure, let's play a game!` : response += `Hey ${opponent}!\n${msg.author} started a game of pigs with you!`;
      pigs.startGame(playerName, opponent.username);
    }
  }

  msg.reply(response); // Send it

  let activeGame = getActiveGame(playerName);
    // Since turn is over, bot should go
    if (activeGame.activePlayer === client.user.username) {
      handleTurn(msg.channel, activeGame);
    }
};

// Handles input and response for stats command
// Requires ".stats" and an optional member mention
const handleStats = (msg, param) => {
  let targetUser; // Initialize target user
  // If no param, targetUser is set to author
  // Otherwise, try to get a user from the mention
  !param ? targetUser = msg.author : targetUser = getUserFromMention(param);

  if (!targetUser) {
    // If no member was found
    msg.reply(`Oink! Your parameter must be a user mention.\nFor example: ${client.user}`);
  } else {
    // Find or create player stat set
    let statSet = pigs.playerStats[`${targetUser.username}`];
    !statSet ? statSet = pigs.addPlayer(targetUser.username) : 'Player stats were found';

    // Start building embed
    const statsEmbed = new EmbedBuilder()
	  //.setColor(0xE296CB)
    // '\u200B' = blank
	  .setTitle(`${targetUser.username}'s Statistics`)
    .setThumbnail(targetUser.avatarURL())
	  .addFields(
		  { name: `${statSet.games} games played`, value: `> **${statSet.wins}** wins / **${statSet.losses}** losses\n> **${statSet.profit}** points earned` },
      { name: `${statSet.turns} turns taken`, value: `> **${statSet.busts}** ended in busts\n> **${statSet.bros}** were bro'ing for it` },
	  );

    // Construct and add roll stats field
    let rollStats = ``;
    rollStats += `> ${diceEmoji[1]} **${statSet.rolls[1]}** - `;
    rollStats += `${diceEmoji[2]} **${statSet.rolls[2]}** - `;
    rollStats += `${diceEmoji[3]} **${statSet.rolls[3]}**\n> \n> `;
    rollStats += `${diceEmoji[4]} **${statSet.rolls[4]}** - `;
    rollStats += `${diceEmoji[5]} **${statSet.rolls[5]}** - `;
    rollStats += `${diceEmoji[6]} **${statSet.rolls[6]}**`;
    statsEmbed.addFields({ 
      name: `${statSet.rolls.total} dice rolled`, value: rollStats,
    });

    msg.channel.send({ embeds: [statsEmbed] }); // Send it
  }
}

// Gets the ai to take a turn
const handleTurn = (channel, activeGame) => {
  const botName = client.user.username; // Initialize player name
  let response = ``; // Default response string
  const botProfit = pigs.broForIt(activeGame, botName); // Take the actual turn

  // Grab variables
  const botHistory = activeGame[`${botName}`].history;
  const botTurn = botHistory[botHistory.length-1];
  const botScore = activeGame[`${botName}`].score;

  if (botProfit === 0) {
    // Construct response
    response += `**Bust!** I rolled: `;
    for (let i=0; i<botTurn.length; i++) {
      i < botTurn.length-1 ? response += `${botTurn[i]}, ` : response += `${botTurn[i]}`;
    }
    response += `\nMy total score: ${botScore}`;

    // Calculate past profit
    let pastProfit = -1;
    botTurn.forEach(e => pastProfit += e);
    pastProfit > 0 ? response += `\nI almost had ${pastProfit} in profit.` : "Profit too small to care.";
    } else {
      // Construct response
      response += `I rolled: `;
      for (let i=0; i<botTurn.length; i++) {
        i < botTurn.length-1 ? response += `${botTurn[i]}, ` : response += `${botTurn[i]}`;
      }
      response += `\nMy Final Score: ${botScore}\nI won!`;
    }

    channel.send(response); // Send it
}



// ---------------------------------
// - - - - - CLIENT EVENTS - - - - -
// ---------------------------------

const buildPen = async (guild) => {
  // Create a new text channel
  const newPen = await guild.channels.create({
    name: "pig-pen",
    type: ChannelType.GuildText,
    permissionOverwrites: [{
      id: guild.id,
      deny: [PermissionsBitField.Flags.ManageChannels]
    }]
  });

  // Add to guild's pen IDs
  pigPenIDs[`${guild.id}`].push(newPen.id);
}

// When a channel gets deleted
client.on('channelDelete', channel => {
  pigPenIDs[`${channel.guild.id}`].forEach( p => {
      if (p === channel.id) { 
        const index = pigPenIDs[`${channel.guild.id}`].indexOf(channel.id);
        pigPenIDs[`${channel.guild.id}`].splice(index, 1);
        return;
      }
  });
});

// When the bot joins a server
client.on("guildCreate", guild => {
  console.log("Joined a new guild: " + guild.name);
  pigPenIDs[`${guild.id}`] = [];
});

// When the bot goes online
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);

  // Fill any holes
  client.guilds.cache.forEach( g => {
    !pigPenIDs[`${g.id}`] ? pigPenIDs[`${g.id}`] = [] : "ID set was already created.";
  });
});

// When a message is sent
client.on("messageCreate", msg => {
  // Never reply to your own message
  if (msg.author.id === client.user.id) { return; }

  let inPen = false;
  pigPenIDs[`${msg.guild.id}`].forEach( p => {
    if (p === msg.channel.id) { 
      inPen = true;
      return;
    }
  });

  inPen = true;

  if (msg.content[0] !== '.') {
    // Split message content into mention and command
    const [mention, command] = msg.content.split(' ');
    const mUser = getUserFromMention(mention); // Grab mentioned user
    // Check if mentioned user is bot
    if (mUser && mUser.id === client.user.id) {
      switch (command) {
        case "help":
          let response = ``;

          response += `**Mention Commands:** `;
          response += `\n- Prefix with "${client.user} "`;
          response += `\n- Recognized in any channel`;
          response += `\n> **help** - *Get command descriptions.*`;
          response += `\n> **pen** - *Create a new pig-pen text channel.*`;

          response += `\n\n**Game Commands:** `;
          response += `\n- Prefix with "." `;
          response += `\n- Recognized in pig-pen channels`;
          response += `\n> **play <@user>** --- *Begin a game with the mentioned user.*`;
          response += `\n> **roll <int>** --- *Roll a specified number of times.*`;
          response += `\n> **call** --- *End your turn and add to your score.*`;
          response += `\n> **bro** --- *Roll until you win or bust.*`;
          response += `\n> **stats <@user>** --- *View the mentioned user's statistics.*`;
          msg.reply(response);
          break;

        case "pen":
          buildPen(msg.guild);
          msg.reply(`I built a brand new pig-pen! Enjoy!`);
          break;

        default:
          msg.reply('...Oink?');
          break;
      }
    }
  } else if (inPen) {
    // Only process commands beginning with '.'
    const trimmedMsg = msg.content.slice(1); // Trim message
    const [command, param] = trimmedMsg.split(' '); // Split into command and parameter
    const activeGame = getActiveGame(msg.author.username); // Find active game

    // Respond accordingly
    switch (command)
    {
      case "stats":
        handleStats(msg, param);
        break;

      case "play":
        handleStart(msg, param);
        break;

      case "roll":
        handleRoll(msg, activeGame, param);
        break;

      case "call":
        handleCall(msg, activeGame);
        break;

      case "bro":
        handleBro(msg, activeGame);
        break;

      default:
        msg.reply('...Oink?');
        break;
    }
  }
});
  

// Make sure this line is the last line
//process.env.CLIENT_TOKEN
client.login(process.env.CLIENT_TOKEN); // Login bot using token