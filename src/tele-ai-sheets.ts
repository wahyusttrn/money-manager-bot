import 'dotenv/config';
import { google } from 'googleapis';
import { Bot } from 'grammy';
import ollama from 'ollama';
import * as z from 'zod';

const TransactionSchema = z.object({
  type: z.enum(['Income', 'Expense', 'Saving', 'Saving Expense']),
  amount: z.number(),
  description: z.string()
});

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

  const userMessage = ctx.message.text || '';

  const qwenResponse = await ollama.chat({
    model: 'qwen2.5:1.5b',
    messages: [{ role: 'user', content: `parse the following message to structured data: ${userMessage}` }],
    format: z.toJSONSchema(TransactionSchema)
  });
  const parsedData = JSON.parse(qwenResponse.message.content || '');

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID || '';
  const range = process.env.GOOGLE_SPREADSHEET_RANGE || '';
  const valueInputOption = 'USER_ENTERED';

  const requestBody = { values: [[parsedData.type, parsedData.amount, parsedData.description]] };
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption,
    requestBody
  });

  await ctx.reply(
    `Record Saved!\n\nType: ${parsedData.type}\nAmount: ${parsedData.amount}\nDescription: ${parsedData.description}`
  );
});

bot.start();
