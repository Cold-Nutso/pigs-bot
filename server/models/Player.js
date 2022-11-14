const mongoose = require('mongoose');

let PlayerModel = {};

// games: 0,
// wins: 0,
// losses: 0,
// rolls: {
//   total: 0,
//   1: 0,
//   2: 0,
//   3: 0,
//   4: 0,
//   5: 0,
//   6: 0,
// },
// turns: 0,
// profit: 0,
// busts: 0,
// bros: 0,

const PlayerSchema = new mongoose.Schema({
  discordID: {
    type: String,
    required: true,
  },
  games: {
    type: Number,
    min: 0,
    required: true,
  },
  wins: {
    type: Number,
    min: 0,
    required: true,
  },
  losses: {
    type: Number,
    min: 0,
    required: true,
  },
  rolls: {
    type: Array,
    required: true,
  },
  turns: {
    type: Number,
    min: 0,
    required: true,
  },
  profit: {
    type: Number,
    min: 0,
    required: true,
  },
  bros: {
    type: Number,
    min: 0,
    required: true,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

PlayerSchema.statics.toAPI = (doc) => ({
  discordID: doc.discordID,
  games: doc.games,
  wins: doc.wins,
  losses: doc.losses,
  rolls: doc.rolls,
  turns: doc.turns,
  profit: doc.profit,
  bros: doc.bros,
});

PlayerSchema.statics.findByDiscordID = (id, callback) => {
  const search = { discordID: id };

  return PlayerModel.find(search).select('name age food').lean().exec(callback);
};

PlayerModel = mongoose.model('Player', PlayerSchema);

module.exports = PlayerModel;
