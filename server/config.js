require('dotenv').config();

const staticAssets = {
  development: {
    path: 'hosted/',
  },
  production: {
    path: 'hosted/',
  },
};

const connections = {
  development: {
    http: {
      dirname: 'http://localhost:3000',
      port: process.env.PORT || process.env.NODE_PORT || 3000,
    },
    mongo: process.env.MONGODB_URI || 'mongodb://127.0.0.1/pigs-bot',
    redis: process.env.REDISCLOUD_URL,
  },
  production: {
    http: {
      dirname: __dirname,
      port: process.env.PORT || process.env.NODE_PORT || 3000,
    },
    mongo: process.env.MONGODB_URI,
    redis: process.env.REDISCLOUD_URL,
  },
};

module.exports = {
  staticAssets: staticAssets[process.env.NODE_ENV],
  connections: connections[process.env.NODE_ENV],
  secret: process.env.SECRET,
  token: process.env.CLIENT_TOKEN,
};
