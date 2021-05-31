let config = null;

if (process.env.NODE_ENV === 'development')
    config = require('./config.json');
else
    config = {
        token: process.env.TOKEN,
        botUsername: process.env.BOT_USERNAME,
        connectionString: process.env.CONNECTION_STRING
    }

module.exports = config
