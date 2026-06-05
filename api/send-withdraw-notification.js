import TelegramBot from "node-telegram-bot-api";

const bot = new TelegramBot(
  process.env.TELEGRAM_BOT_TOKEN
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).json({
      message: "API работает. Используй POST-запрос.",
    });
  }

  const { amount, username, telegramId } = req.body || {};

  try {
    await bot.sendMessage(
      917024505,
      `
🔔 Новая заявка на вывод

Пользователь:
${username || "не указан"}

Telegram ID:
${telegramId || "не указан"}

Сумма:
${amount || "не указана"} ₽
`
    );

    return res.status(200).json({
      success: true,
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      error: e.message,
    });
  }
}