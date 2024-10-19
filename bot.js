const { ActivityHandler } = require('botbuilder');

class EchoBot extends ActivityHandler {
    constructor() {
        super();
        this.onMessage(async (context, next) => {
            const text = context.activity.text;
            await context.sendActivity(`Você disse: ${ text }`);
            await next();
        });
    }
}

module.exports.EchoBot = EchoBot;
