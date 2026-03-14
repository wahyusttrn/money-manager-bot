import 'dotenv/config';
import { google } from 'googleapis';
import { Bot } from 'grammy';
import ollama from 'ollama';
import * as z from 'zod';

const systemPrompt = `
  You are a money tracker assistant that helps users to track their transaction.
  You are given a message from a user and you need to parse the message to structured data.
  The structured data should be in JSON format.

  ---
  ## Notes:

  #### Language:
  - Indonesian
  - English

  #### Calculations:
  - rb / ribu means thousand (seribu = 1000, dua ribu = 2000, 10rb = 10000, 100rb = 100000)
  - ratus means hundred (seratus = 100, dua ratus = 200, seratus ribu = 100000)
  - jt / juta means million (seribu juta = 1000000, dua juta = 2000000, 10jt = 10000000)
  - milyar means billion (seribu milyar = 1000000000, dua milyar = 2000000000)

  ## Type and Keyword
  - Income: 
    - Indonesian: gaji, penghasilan, upah
    - English: salary, income, earnings, paid
  - Expense: 
    - Indonesian: pengeluaran, belanja, pembelian
    - English: expense, spending, purchase
  - Saving: 
    - Indonesian: tabungan, simpanan
    - English: saving, savings
  - Saving Expense: 
    - Indonesian: memakai tabungan, memakai simpanan
    - English: saving expense, savings expense
    ---

    ## Important:
    - Be very detailed on the description
    - Description CAN NOT be only one word

  Here is the message:
`;

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
    messages: [{ role: 'user', content: `${systemPrompt}\n\n${userMessage}` }],
    format: z.toJSONSchema(TransactionSchema)
  });
  const parsedData = JSON.parse(qwenResponse.message.content || '');

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID || '';
  const range = process.env.GOOGLE_SPREADSHEET_RANGE || '';
  const valueInputOption = 'USER_ENTERED';

  const requestBody = {
    values: [[new Date().toISOString(), parsedData.type, parsedData.amount, parsedData.description]]
  };
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
