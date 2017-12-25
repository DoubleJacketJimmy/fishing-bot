const Router = require('../router');

const commonRouter = require('./common');
const recordsRouter = require('./records');

module.exports = Router.combineRouters(commonRouter, recordsRouter)