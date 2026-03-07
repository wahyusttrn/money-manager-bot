import 'dotenv/config';
import { google } from 'googleapis';
import { Bot } from 'grammy';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL || '',
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n') || ''
  },
  scopes: [process.env.GOOGLE_SCOPES || '']
});

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN || '');

bot.on('message', async (ctx) => {
  console.log(`${ctx.from.first_name} wrote ${'text' in ctx.message ? ctx.message.text : ''}`);

  const message = ctx.message.text || '';
  const [type, ammount, ...description] = message.split(' ');

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID || '';
  const range = process.env.GOOGLE_SPREADSHEET_RANGE || '';
  const valueInputOption = 'USER_ENTERED';

  const requestBody = { values: [[type, ammount, description.join(' ')]] };
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption,
    requestBody
  });

  await ctx.reply(`Record Saved!\n\nType: ${type}\nAmount: ${ammount}\nDescription: ${description.join(' ')}`);
});

bot.start();
