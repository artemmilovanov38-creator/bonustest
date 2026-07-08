export const tg = window.Telegram?.WebApp || null;

export function initTelegramApp() {
  if (!tg) return;

  tg.ready();
  tg.expand();

  if (tg.enableClosingConfirmation) {
    tg.enableClosingConfirmation();
  }

  if (tg.setHeaderColor) {
    tg.setHeaderColor("#0b1020");
  }

  if (tg.setBackgroundColor) {
    tg.setBackgroundColor("#0b1020");
  }
}

export function getTelegramUser() {
  const tgUser = tg?.initDataUnsafe?.user;

  if (tgUser?.id) {
    return {
      telegram_id: Number(tgUser.id),
      first_name: tgUser.first_name || "Пользователь",
      last_name: tgUser.last_name || "",
      username: tgUser.username || "",
      photo_url: tgUser.photo_url || "",
      language_code: tgUser.language_code || "ru",
    };
  }

  // Это нужно, чтобы приложение открывалось в браузере во время разработки
  if (import.meta.env.DEV) {
    return {
      telegram_id: 777000,
      first_name: "Demo",
      last_name: "User",
      username: "demo_user",
      photo_url: "",
      language_code: "ru",
    };
  }

  return null;
}

export function haptic(type = "light") {
  try {
    tg?.HapticFeedback?.impactOccurred(type);
  } catch (error) {
    console.log("Haptic недоступен");
  }
}