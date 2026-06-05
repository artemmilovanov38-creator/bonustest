import TelegramBot from "node-telegram-bot-api";

export default async function handler(req, res) {

try {

```
const bot = new TelegramBot(
  process.env.TELEGRAM_BOT_TOKEN
);

const result =
  await bot.sendMessage(
    917024505,
    "ТЕСТ ОТ VERCEL"
  );

return res.status(200).json({
  success: true,
  result
});
```

} catch (e) {

```
return res.status(500).json({
  success: false,
  error: e.message
});
```

}
}
