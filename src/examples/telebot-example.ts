import 'dotenv/config';
import { Bot, InlineKeyboard } from 'grammy';

//Store bot screaming status
let screaming = false;

//Create a new bot
const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN || '');

//This function handles the /scream command
bot.command('scream', () => {
  screaming = true;
});

//This function handles /whisper command
bot.command('whisper', () => {
  screaming = false;
});

//This function would be added to the dispatcher as a handler for messages coming from the Bot API
bot.on('message', async (ctx) => {
  //Print to console
  console.log(`${ctx.from.first_name} wrote ${'text' in ctx.message ? ctx.message.text : ''}`);

  //? this is how we get the text from the message
  console.log(ctx.message.text, '<<<<<<<');
  //TODO: broke the messages to [type, ammount, description]

  if (screaming && ctx.message.text) {
    //Scream the message
    await ctx.reply(ctx.message.text.toUpperCase(), {
      ...(ctx.message.entities && { entities: ctx.message.entities })
    });
  } else {
    //This is equivalent to forwarding, without the sender's name
    await ctx.copyMessage(ctx.message.chat.id);
  }
});

//Start the Bot
bot.start();
