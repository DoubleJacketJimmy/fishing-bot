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
    .command('start', ctx => ctx.reply('Дороу!'))

    .command('reg', async ctx => {
        let user = new User({
            _id: ctx.from.id,
            name: ctx.from.first_name
        });

        try {
            await user.save();

            ctx.reply('Регистрация успешно завершена');
        } catch(err) {
            console.error(err);
                
            // Duplicate key error:
            if (err.name === 'MongoError' && err.code === 11000)
                ctx.reply('Пользователь с таким telegram ID уже зарегестрирован');
            else
                ctx.reply('Не удалось сохранить данные');
        }
    })

    .command('myscore', async ctx => {
        let userID = ctx.from.id;

        try {
            let user = await User.findById(userID);

            if (!user) {
                ctx.reply('Пользователя с таким telegram ID не существует');
                return;
            }

            ctx.replyWithMarkdown(`*Твой улов (${user.name}):* ${user.score}г`);
        } catch(err) {
            console.error(err);  

            ctx.reply('Не удалось загрузить данные');
        }
    })
    
    .command('newtour', 
        ctx => ctx.reply('Сколько рыбы ты поймал (в граммах)?'),
        async ctx => {
            let userID = ctx.from.id;
            let userCatch = parseInt(ctx.message.text) || 0;
            
            try {
                let user = await User.findById(userID);

                if (!user) {
                    ctx.reply('Пользователь с таким telegram ID не найден. Повтори попытку или зарегистрируйся');

                    return;
                }

                user.score += userCatch;

                await user.save();

                ctx.reply('Твой общий улов обновлен');

                let tour = new Tour({
                    userID: userID,
                    catch: userCatch,
                    date: new Date()
                });
    
                await tour.save();

                ctx.reply('Данные о рыбалке успешно сохранены');
            } catch(err) {
                console.error(err);

                ctx.reply('Не удалось сохранить данные');
            }
        }
    )
    
    .command('showlist', async ctx => {
        try {
            let users = await User.find({});

            let result = '';

            users.forEach(user => {
                result += `*${user.name}:* ${user.score}г\n`
            });

            ctx.replyWithMarkdown(result || 'Не удалось сформировать список (нет зарегистрированных пользователей)');
        } catch (err) {
            console.error(err);

            ctx.reply('Не удалось загрузить данные');
        }
    })

    .command('recordpike', 
        ctx => ctx.reply('Сколько весит твоя рекордная щука (в граммах)?'),
        getRecordFishCallback('recordPike')
    )
    
    .command('recordbass',
        ctx => ctx.reply('Сколько весит твой рекордный окунь (в граммах)?'),
        getRecordFishCallback('recordBass')
    )
    
    .command('myrecords', async ctx => {
        let userID = ctx.from.id;

        try {
            let user = await User.findById(userID);

            if (!user) {
                ctx.reply('Пользователь с таким telegram ID не найден. Повтори попытку или зарегистрируйся');

                return;
            }

            ctx.replyWithMarkdown(`Твои рекорды:\n*Щука:* ${user.recordPike}\n*Окунь:* ${user.recordBass}`);
        } catch (err) {
            console.error(err);

            ctx.reply('Не удалось загрузить данные');
        }
    });

function getRecordFishCallback(prop) {
    return async ctx => {
        let userID = ctx.from.id;
        let value = parseInt(ctx.message.text) || 0;

        try {
            let user = await User.findById(userID);

            if (!user) {
                ctx.reply('Пользователь с таким telegram ID не найден. Повтори попытку или зарегистрируйся');

                return;
            }

            if (user[prop] >= value) {
                ctx.reply('Ты вылавливал рыбу побольше');

                return;
            }

            user[prop] = value;

            await user.save();

            ctx.reply('Твой личный рекорд обновлен');

        } catch (err) {
            console.error(err);

            ctx.reply('Не удалось сохранить изменения');
        }
    }
}

module.exports = router