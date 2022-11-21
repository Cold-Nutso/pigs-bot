const models = require('../models');

const { Player } = models;

const getPlayer = (req, res) => {
  Player.findByIDLean('915117668451901461', (err, doc) => {
    if (err) { return res.status(400).json({ error: 'An error has occurred!' }); }

    return res.json({ player: doc });
  });
};

module.exports = {
  getPlayer,
};
