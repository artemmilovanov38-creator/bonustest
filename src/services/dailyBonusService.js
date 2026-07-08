import { supabase } from "../lib/supabase";
import { createNotification } from "./notificationService";

const rewards = [25, 35, 50, 75, 100, 150, 300];

export async function claimDailyBonus(userId) {
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (!user) throw new Error("Пользователь не найден");

  const now = new Date();

  const last = user.last_daily_claim
    ? new Date(user.last_daily_claim)
    : null;

  if (last) {
    const diff =
      Math.floor((now - last) / (1000 * 60 * 60 * 24));

    if (diff === 0) {
      throw new Error("Сегодня бонус уже получен");
    }

    if (diff === 1) {
      user.streak += 1;
    } else {
      user.streak = 1;
    }
  } else {
    user.streak = 1;
  }

  const reward =
    rewards[Math.min(user.streak - 1, rewards.length - 1)];

  await supabase
    .from("users")
    .update({
      streak: user.streak,
      last_daily_claim: now.toISOString(),
      balance: Number(user.balance || 0) + reward,
      total_earned: Number(user.total_earned || 0) + reward,
    })
    .eq("id", userId);

  await createNotification({
    userId,
    title: "🎁 Ежедневный бонус",
    text: `Получено ${reward} ₽`,
    type: "success",
  });

  return {
    reward,
    streak: user.streak,
  };
}

export function getRewardForDay(day) {
  return rewards[Math.min(day - 1, rewards.length - 1)];
}

export async function getDailyBonusStatus(userId) {
  const { data: user, error } = await supabase
    .from("users")
    .select("streak,last_daily_claim")
    .eq("id", userId)
    .single();

  if (error) throw error;

  const now = new Date();

  let canClaim = true;

  if (user.last_daily_claim) {
    const last = new Date(user.last_daily_claim);

    canClaim =
      last.toDateString() !== now.toDateString();
  }

  return {
    streak: user.streak || 0,
    canClaim,
    reward: getRewardForDay(
      Math.max((user.streak || 0) + 1, 1)
    ),
    lastClaim: user.last_daily_claim,
  };
}