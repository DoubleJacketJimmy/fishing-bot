const Router = require('../router');

// Mongoose models:
const User = require('../models/user');
const Tour = require('../models/tour');

const router = new Router();

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
    );

module.exports = router