const Router = require('../router');
const mongoose = require('mongoose');
const config = require('../config');

// Mongoose models:
const User = require('../models/user');
const Tour = require('../models/tour');

mongoose.Promise = global.Promise;

mongoose.connect(config.connectionString, {useMongoClient: true})
    .then(() => console.log('Connection established'))
    .catch(err => console.error(err));

const router = new Router();

// Routing:
router
    .command('start', ctx => ctx.reply('Hi!'))

    .command('reg', async ctx => {
        let user = new User({
            _id: ctx.from.id,
            name: ctx.from.first_name,
            score: 0
        });

        await user
            .save(err => {
                console.error(err);

                // Duplicate key error:
                if (err.code === 11000)
                    ctx.reply('You are already registered');
                else
                    ctx.reply('Failed to save changes. Please, try again');
            })
            .then(() => {
                console.log(`New user: ${ctx.from.first_name}`);

                ctx.reply('Success!');
            });
    });

module.exports = router