import 'dotenv/config';
import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL || '',
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n') || ''
  },
  scopes: [process.env.GOOGLE_SCOPES || '']
});

async function writeToSheet(values: string[][]) {
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID || '';
  const range = process.env.GOOGLE_SPREADSHEET_RANGE || '';
  const valueInputOption = 'USER_ENTERED';

  const requestBody = { values };

  try {
    const res = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption,
      requestBody
    });
    console.log('Data written to sheet');

    return res;
  } catch (error) {
    console.log(error);
  }
}

(async () => {
  const res = await writeToSheet([
    ['test', 'test'],
    ['test', 'test'],
    ['test', 'test'],
    ['test', 'test'],
    ['test', 'test'],
    ['test', 'test'],
    ['test', 'test'],
    ['test', 'test'],
    ['test', 'test'],
    ['test', 'test']
  ]);
  console.log(res?.data);
})();
