import TelegramBot from "node-telegram-bot-api";

export default async function handler(req, res) {

const { amount, username, telegramId } =
req.body || {};

try {

```
const bot = new TelegramBot(
  process.env.TELEGRAM_BOT_TOKEN
);

await bot.sendMessage(
  917024505,
  `
```

🔔 Новая заявка на вывод

Пользователь: ${username}

Telegram ID: ${telegramId}

Сумма: ${amount} ₽
`


```
return res.status(200).json({
  success: true,
});
```

} catch (e) {

```
return res.status(500).json({
  success: false,
  error: e.message,
});
```

}
}
