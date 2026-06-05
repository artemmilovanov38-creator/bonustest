import axios from "axios";

export default async function handler(
  req,
  res
) {

  const telegramId =
    req.query.telegramId;

  try {

    const result =
      await axios.get(
        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getChatMember`,
        {
          params: {
            chat_id: "@ArtemMill",
            user_id: telegramId,
          },
        }
      );

    const status =
      result.data.result.status;

    const subscribed =
      [
        "member",
        "administrator",
        "creator",
      ].includes(status);

    res.status(200).json({
      subscribed,
    });

  } catch (e) {

    res.status(200).json({
      subscribed: false,
    });

  }
}