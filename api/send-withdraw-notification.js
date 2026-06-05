import TelegramBot from "node-telegram-bot-api";

const bot = new TelegramBot(
  process.env.TELEGRAM_BOT_TOKEN
);

export default async function handler(
  req,
  res
) {

  const {
    amount,
    username,
    telegramId,
  } = req.body;

  try {

    await bot.sendMessage(
      917024505,
      `
🔔 Новая заявка на вывод

Пользователь:
${username}

Telegram ID:
${telegramId}

Сумма:
${amount} ₽
`
    );

    res.status(200).json({
      success: true,
    });

  } catch (e) {

    res.status(500).json({
      success: false,
    });

  }
}