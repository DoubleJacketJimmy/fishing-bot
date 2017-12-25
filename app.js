const Telegraf = require('telegraf');
const mongoose = require('mongoose');
const config = require('./config.js');

const bot = new Telegraf(config.token);

// Mongoose connection:
mongoose.Promise = global.Promise;

mongoose.connect(config.connectionString, {useMongoClient: true})
    .then(() => console.log('Connection established'))
    .catch(err => console.error(err));

// Routing:
const router = require('./routes');
bot.use(router.getRoutes());

bot.startPolling();