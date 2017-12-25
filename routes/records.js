const Router = require('../router');

// Mongoose models:
const User = require('../models/user');
const Tour = require('../models/tour');

const router = new Router();

router
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

            ctx.replyWithMarkdown(`Твои рекорды:\n*Щука:* ${user.recordPike / 1000}кг\n*Окунь:* ${user.recordBass}г`);
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