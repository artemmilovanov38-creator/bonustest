import dotenv from "dotenv";
dotenv.config();

import TelegramBot from "node-telegram-bot-api";
import { createClient } from "@supabase/supabase-js";

console.log(process.env.SUPABASE_URL);

console.log(
  "URL:",
  process.env.SUPABASE_URL
);

console.log(
  "KEY:",
  process.env.SUPABASE_SERVICE_ROLE_KEY
    ? "FOUND"
    : "NOT FOUND"
);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
dotenv.config();

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const bot = new TelegramBot(TOKEN, {
polling: true,
});

bot.onText(/\/start (.+)/, async (msg, match) => {

const chatId = msg.chat.id;

const referrerId = match[1];

console.log(
"Реферал:",
referrerId
);
const telegramId = msg.from.id;

const { data: existingUser } =
  await supabase
    .from("users")
    .select("*")
    .eq("telegram_id", telegramId)
    .single();

if (
existingUser &&
!existingUser.referrer_id &&
existingUser.telegram_id !== Number(referrerId)
) {

await supabase
.from("users")
.update({
referrer_id: Number(referrerId),
})
.eq("telegram_id", telegramId);

console.log(
"Реферер сохранен"
);
}


bot.sendMessage(
chatId,
"Добро пожаловать в BonusTest!",
{
reply_markup: {
inline_keyboard: [
[
{
text: "🚀 BonusTest",
web_app: {
url:
"https://bonustest.vercel.app",
},
},
],
],
},
}
);
});

bot.onText(/\/start$/, async (msg) => {

bot.sendMessage(
msg.chat.id,
"Открыть приложение",
{
reply_markup: {
inline_keyboard: [
[
{
text: "🚀 BonusTest",
web_app: {
url:
"https://bonustest.vercel.app",
},
},
],
],
},
}
);
});

console.log("BOT STARTED");
