const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

const BOT_TOKEN = "ТВОЙ_ТОКЕН";
const CHANNEL = "@ArtemMill";

app.post("/check-subscription", async (req, res) => {

  const { telegramId } = req.body;

  try {

    const result = await axios.get(
      `https://api.telegram.org/bot${BOT_TOKEN}/getChatMember`,
      {
        params: {
          chat_id: CHANNEL,
          user_id: telegramId,
        },
      }
    );

    const status =
      result.data.result.status;

    const subscribed =
      ["member", "administrator", "creator"]
      .includes(status);

    res.json({
      subscribed,
    });

  } catch (err) {

    res.json({
      subscribed: false,
    });

  }
});

app.listen(3001);