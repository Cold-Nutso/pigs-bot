const mongoose = require('mongoose');

let ServerModel = {};

/* activeGame object structure:
{
    activePlayer: id1,
    turnOrder: [ id1, id2, ... ],
    `${id1}`: { score: int, turn: int[], profit: int, history: int[][] },
    `${id2}`: { score: int, turn: int[], profit: int, history: int[][] },
    ...
}
*/

/* finishedGame object structure:
{
    endDate: Date,
    winner: id1,
    losers: [ id2, ... ],
    `${id1}`: { score: int, history: int[][] },
    `${id2}`: { score: int, history: int[][] },
    ...
}
*/

const ServerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  guildID: {
    type: String,
    required: true,
  },
  pigName: {
    type: String,
    required: true,
  },
  pigPenIDs: { // An array of strings
    type: Array,
    required: true,
  },
  playerIDs: { // An array of strings
    type: Array,
    required: true,
  },
  activeGames: { // An array of objects
    type: Array,
    required: true,
  },
  finishedGames: { // An array of objects
    type: Array,
    required: true,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

ServerSchema.statics.toAPI = (doc) => ({
  name: doc.name,
  guildID: doc.guildID,
  pigName: doc.pigName,
  pigPenIDs: doc.pigPenIDs,
  playerIDs: doc.playerIDs,
  activeGames: doc.activeGames,
  finishedGames: doc.finishedGames,
});

ServerSchema.statics.findByGuildID = (id, callback) => {
  const search = { guildID: id };
  return ServerModel.findOne(search).select('name guildID pigName pigPenIDs playerIDs activeGames finishedGames').exec(callback);
};

ServerModel = mongoose.model('Server', ServerSchema);

module.exports = ServerModel;
