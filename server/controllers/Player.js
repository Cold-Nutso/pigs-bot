const models = require('../models');

const { Player } = models;

const getPlayer = (req, res) => {
  let error = false;
  let id = req.url.substr(-18); // Hard code param isolation

  if (id === '------default-----') {
    id = req.session.account.discordID;
  } else if (!req.session.account.premium && id !== req.session.account.discordID) {
    id = req.session.account.discordID;
    error = true;
  }

  // Find player by discord ID
  Player.findByIDLean(id, (err, doc) => {
    if (err) { return res.status(400).json({ error: 'An error has occurred!' }); }

    const body = { player: doc };
    if (error) { body.error = 'Oof. Custom ID search is a premium feature!'; }

    return res.json(body);
  });
};

module.exports = {
  getPlayer,
};
