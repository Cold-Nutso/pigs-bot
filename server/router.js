const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
  app.get('/getToken', mid.requiresSecure, controllers.Account.getToken);
  app.get('/getPlayer/:discordID', mid.requiresLogin, controllers.Player.getPlayer);

  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);

  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);

  app.post('/passChange', mid.requiresSecure, mid.requiresLogout, controllers.Account.passChange);

  app.get('/logout', mid.requiresLogin, controllers.Account.logout);

  app.get('/main', mid.requiresLogin, controllers.mainPage);

  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);

  app.get('*', controllers.notFoundPage);
};

module.exports = router;
