import TelegramBot from "node-telegram-bot-api";

export default async function handler(req, res) {
  try {
    const { telegramId, text } = req.body || {};

    const bot = new TelegramBot(
      process.env.TELEGRAM_BOT_TOKEN
    );

    await bot.sendMessage(
      String(telegramId),
      text
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
}Ы