const express = require('express');
const bodyParser = require('body-parser');
const { BotFrameworkAdapter } = require('botbuilder');
const { EchoBot } = require('./bot');
const twilio = require('twilio');

const app = express();
const port = process.env.PORT || 3978;

const adapter = new BotFrameworkAdapter({
    appId: process.env.MICROSOFT_APP_ID || '',
    appPassword: process.env.MICROSOFT_APP_PASSWORD || ''
});

const bot = new EchoBot();

app.use(bodyParser.json());

app.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        await bot.run(context);
    });
});

// Configurar o webhook do Twilio para o WhatsApp
app.post('/whatsapp', (req, res) => {
    const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    const incomingMessage = req.body.Body;
    const from = req.body.From;

    // Envie a mensagem para o bot
    const conversation = {
        type: 'message',
        text: incomingMessage,
        from: { id: from },
        channelId: 'whatsapp'
    };

    adapter.processActivity(conversation, async (context) => {
        await bot.run(context);
        const reply = context.activity.text;

        // Responda pelo Twilio
        twilioClient.messages.create({
            body: reply,
            from: 'whatsapp:+14155238886', // Seu número do Twilio
            to: from
        }).then(() => {
            res.sendStatus(200);
        }).catch(err => {
            console.error(err);
            res.sendStatus(500);
        });
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
