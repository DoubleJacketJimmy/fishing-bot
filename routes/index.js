const Router = require('../router');

const router = new Router();

// Routing:
router.text('check', ctx => ctx.reply('check'));

module.exports = router;