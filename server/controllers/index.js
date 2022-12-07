module.exports.Account = require('./Account.js');
module.exports.Player = require('./Player.js');

const notFoundPage = (req, res) => {
  res.render('notFound', { csrfToken: req.csrfToken() });
};

const mainPage = (req, res) => res.render('app');

module.exports.notFoundPage = notFoundPage;
module.exports.mainPage = mainPage;
