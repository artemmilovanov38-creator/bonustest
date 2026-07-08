import { supabase } from "../lib/supabase";
import { createNotification } from "./notificationService";

export async function checkAchievements(userId) {
  // Получаем пользователя
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (!user) return;

  // Одобренные задания
  const { count: completedTasks } = await supabase
    .from("user_tasks")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "approved");

  // Все достижения
  const { data: achievements } = await supabase
    .from("achievements")
    .select("*");

  // Уже полученные
  const { data: unlocked } = await supabase
    .from("user_achievements")
    .select("achievement_id")
    .eq("user_id", userId);

  const unlockedIds = new Set(
    (unlocked || []).map((a) => a.achievement_id)
  );

  for (const achievement of achievements || []) {
    if (unlockedIds.has(achievement.id)) continue;

    let completed = false;

    switch (achievement.type) {
      case "tasks":
        completed = completedTasks >= achievement.requirement;
        break;

      case "earn":
        completed = Number(user.total_earned || 0) >= achievement.requirement;
        break;

      case "refs":
        completed = Number(user.referrals_count || 0) >= achievement.requirement;
        break;

      default:
        break;
    }

    if (!completed) continue;

    // Добавляем достижение
    await supabase.from("user_achievements").insert({
      user_id: userId,
      achievement_id: achievement.id,
    });

    // Начисляем награду
    if (achievement.reward > 0) {
      await supabase
        .from("users")
        .update({
          balance: Number(user.balance || 0) + achievement.reward,
        })
        .eq("id", userId);
    }

    // Отправляем уведомление
    await createNotification({
      userId,
      title: `🏆 ${achievement.title}`,
      text: `Получено достижение. Бонус ${achievement.reward} ₽ начислен.`,
      type: "success",
    });
  }
}

export async function getUserAchievementsView(userId) {
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  const { count: completedTasks } = await supabase
    .from("user_tasks")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "approved");

  const { data: achievements, error } = await supabase
    .from("achievements")
    .select("*")
    .order("id", { ascending: true });

  if (error) throw error;

  const { data: unlocked } = await supabase
    .from("user_achievements")
    .select("achievement_id")
    .eq("user_id", userId);

  const unlockedIds = new Set(
    (unlocked || []).map((item) => item.achievement_id)
  );

  return (achievements || []).map((achievement) => {
    let current = 0;

    if (achievement.type === "tasks") current = completedTasks || 0;
    if (achievement.type === "earn") current = Number(user?.total_earned || 0);
    if (achievement.type === "refs") current = Number(user?.referrals_count || 0);

    const progress = Math.min(
      100,
      Math.round((current / Number(achievement.requirement || 1)) * 100)
    );

    return {
      ...achievement,
      current,
      progress,
      unlocked: unlockedIds.has(achievement.id),
    };
  });
}