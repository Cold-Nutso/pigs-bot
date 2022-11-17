// ---------------------------
// - - - - - IMPORTS - - - - -
// ---------------------------

// import fetch from 'node-fetch';

const path = require('path');
const express = require('express');
const compression = require('compression');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const expressHandlebars = require('express-handlebars');
const helmet = require('helmet');
const session = require('express-session');
const RedisStore = require('connect-redis')(session); // Stores variables in Redis cloud
const redis = require('redis'); // Connects to Redis
const csrf = require('csurf'); // Generates unique tokens
const config = require('./config.js'); // Holds certain environmental variables
const router = require('./router.js');
const { botLogin } = require('./discord/pigs.js');

mongoose.connect(config.connections.mongo, (err) => {
  if (err) {
    console.log('Could not connect to database');
    throw err;
  }
});

// Connect to a Redis client
const redisClient = redis.createClient({
  legacyMode: true,
  url: config.connections.redis,
});
redisClient.connect().catch(console.error);

const app = express();

app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
}));
app.use('/assets', express.static(path.resolve(config.staticAssets.path)));
app.use(favicon(`${config.staticAssets.path}/img/favicon.png`));
app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Use RedisStore, storing variables in the cloud
app.use(session({
  key: 'sessionid',
  store: new RedisStore({ client: redisClient }),
  secret: config.secret,
  resave: true,
  saveUninitialized: true,
  cookie: { httpOnly: true },
}));

app.engine('handlebars', expressHandlebars.engine({ defaultLayout: '' }));
app.set('view engine', 'handlebars');
app.set('views', `${__dirname}/../views`);
app.use(cookieParser());

app.use(csrf()); // Check for csrf token
app.use((err, req, res, next) => {
  // If token is fine, return to next middleware function
  if (err.code !== 'EBADCSRFTOKEN') return next(err);

  // Otherwise, do nothing
  console.log('Missing CSRF token!');
  return false;
});

router(app);

app.listen(config.connections.http.port, (err) => {
  if (err) { throw err; }
  console.log(`Listening on port ${config.connections.http.port}`);
});

botLogin();
