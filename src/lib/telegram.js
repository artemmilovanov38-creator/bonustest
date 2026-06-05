export const tg =
  window.Telegram?.WebApp;

if (tg) {
  tg.expand();
}