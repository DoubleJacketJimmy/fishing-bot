const config = require('../config');

class Router {
    constructor() {
        this._routes = {};
        this._state = {};

        this._notFoundMessage = "Command not found";
    }

    set notFoundMessage(message) {
        if (typeof message !== 'string') 
            throw new Error('the message must be a string');

        this._notFoundMessage = message;
    }

    get routes() {
        return this._routes;
    }

    set routes(value) {
        this._routes = value;
    }

    static combineRouters(...routers) {
        let routes = {};

        routers.forEach(router => 
            routes = Object.assign(routes, router.routes)
        );

        let combinedRouter = new Router();
        combinedRouter.routes = routes;

        return combinedRouter;
    }

    text(route, ...callbackArray) {
        this._routes[route] = callbackArray;

        return this;
    }

    command(route, ...callbackArray) {
        return this.text('/' + route, ...callbackArray);
    }

    getRoutes() {
        return ctx => {
            if (!ctx.message || !ctx.message.text) return;

            let command = ctx.message.text
                .replace(config.botUsername, '')
                .trim()
                .toLowerCase();

            let userID = ctx.from.id;

            if (this._routes[command]) {
                this._saveState(userID, command);
                this._routes[command][0](ctx);
            } else {
                let state = this._state[userID];

                if (!state) return;

                let lastCommand = state.lastCommand;
                let iteration = state.iteration;

                if (iteration < this._routes[lastCommand].length) {
                    this._state[userID].iteration++;
                    this._routes[lastCommand][iteration](ctx);
                }
            }
        }
    }

    _saveState(userID, command) {
        if (!this._state[userID])
            this._state[userID] = {
                lastCommand: null,
                iteration: 0
            };

        this._state[userID].lastCommand = command;
        this._state[userID].iteration = 1;
    }
}

module.exports = Router