module.exports.Account = require('./Account.js');
module.exports.Player = require('./Player.js');
module.exports.Domo = require('./Domo.js');

const notFoundPage = (req, res) => {
  res.render('notFound', { csrfToken: req.csrfToken() });
};
module.exports.notFoundPage = notFoundPage;
