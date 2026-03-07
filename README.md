# Money Management Bot

- Client: Telegram
- Database: Google Sheets
- AI: Ollama
- Server: Node.js - TypeScript

## User Flow

1. User sends a message to the bot
2. Bot parse the "human" message to structured data using AI
3. Bot save the record to Google Sheets
4. Bot sends a response to the user

## Example

```
User: "habis makan 20k"
Bot: "Record Saved! Type: Expense, Amount: 20000, Description: makan"
```
