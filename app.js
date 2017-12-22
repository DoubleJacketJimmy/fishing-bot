const Telegraf = require('telegraf');
const config = require('./config');

const bot = new Telegraf(config.token);

// Routing:
const router = require('./routes');
bot.use(router.routes());

bot.startPolling();