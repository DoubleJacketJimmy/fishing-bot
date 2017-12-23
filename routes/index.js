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

    .command('reg', ctx => {
        let user = new User({
            _id: ctx.from.id,
            name: ctx.from.first_name,
            score: 0
        });

        user.save()
            .then(() => {
                console.log(`New user: ${ctx.from.first_name}`);

                ctx.reply('Регистрация успешно завершена');
            })
            .catch(err => {
                console.error(err);
                
                // Duplicate key error:
                if (err.code === 11000)
                    ctx.reply('Пользователь с таким telegram ID уже зарегестрирован');
                else
                    ctx.reply('Не удалось сохранить данные');
            });
    })

    .command('myscore', ctx => {
        let userID = ctx.from.id;

        User.findById(userID)
            .exec()
            .then(user => {
                if (!user) {
                    ctx.reply('Пользователя с таким telegram ID не существует');
                    return;
                }

                ctx.replyWithMarkdown(`*Твой улов (${user.name}):* ${user.score}г`);
            })
            .catch(err => {
                console.error(err);  

                ctx.reply('Не удалось загрузить данные');
            });
    })
    
    .command('newtour', 
        ctx => ctx.reply('Сколько рыбы ты поймал (в граммах)?'),
        ctx => {
            let userID = ctx.from.id;
            let userCatch = parseInt(ctx.message.text) || 0;

            let userExist = true;

            User.findById(userID)
                .exec()
                .then(user => {
                    user.score += userCatch;

                    user.save()
                        .then(() => ctx.reply('Твой улов обновлен'))
                        .catch(err => {
                            console.error(err);

                            ctx.reply('Не удалось обновить улов');
                        });
                })
                .catch(err => {
                    console.error(err);

                    userExist = false;

                    ctx.reply('Пользователь не найден. Повтори попытку или зарегистрируйся')
                });
            
            if (userCatch < 0 || userExist) return;

            let tour = new Tour({
                userID: userID,
                catch: userCatch,
                date: new Date()
            });

            tour.save()
                .then(() => ctx.reply('Данные успешно сохранены'))
                .catch(err => {
                    console.error(err);

                    ctx.reply('Не удалось сохранить данные');
                });
        }
    )
    
    .command('showlist', ctx => {
        User.find({})
            .exec()
            .then(users => {
                let result = '';

                users.forEach(user => {
                    result += `*${user.name}:* ${user.score}г\n`
                });

                ctx.replyWithMarkdown(result || 'Не удалось сформировать список (нет зарегистрированных пользователей)');
            })
            .catch(err => {
                console.error(err);

                ctx.reply('Не удалось загрузить данные');
            });
    });

module.exports = router