const config = require('./config');

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

    text(route, callback) {
        this._routes[route] = callback;

        return this;
    }

    command(route, callback) {
        return this.text('/' + route, callback);
    }

    routes() {
        return ctx => {
            if (!ctx.message.text) return;

            let command = ctx.message.text
                .replace(config.botUsername, '')
                .trim()
                .toLowerCase();

            if (!this._routes[command]) {
                if (command[0] === '/') 
                    ctx.reply(this._notFoundMessage);

                return;
            }

            this._saveState(ctx.from.id, command);
            this._routes[command](ctx);        
        }
    }

    _saveState(userID, command) {
        if (!this._state[userID])
            this._state[userID] = {lastCommand: null};

        this._state[userID].lastCommand = command;
    }
}

module.exports = Router