const mongoose = require('mongoose');

let PlayerModel = {};

/* rolls object structure:
{
  total: int,
  1: int,
  2: int,
  3: int,
  4: int,
  5: int,
  6: int
}
*/

const PlayerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
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
    type: Object,
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
  busts: {
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
  name: doc.name,
  discordID: doc.discordID,
  games: doc.games,
  wins: doc.wins,
  losses: doc.losses,
  rolls: doc.rolls,
  turns: doc.turns,
  profit: doc.profit,
  busts: doc.busts,
  bros: doc.bros,
});

PlayerSchema.statics.findByDiscordID = (id, callback) => PlayerModel.findOne({ discordID: id }).select('name discordID games wins losses rolls turns profit busts bros').exec(callback);

PlayerModel = mongoose.model('Player', PlayerSchema);

module.exports = PlayerModel;
