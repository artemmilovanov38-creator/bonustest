import { supabase } from "../lib/supabase";
import { createNotification } from "./notificationService";
import { checkAchievements } from "./achievementService";

export async function getAdminStats() {
  const usersResult = await supabase
    .from("users")
    .select("id", { count: "exact", head: true });

  const tasksResult = await supabase
    .from("tasks")
    .select("id", { count: "exact", head: true });

  const pendingResult = await supabase
    .from("user_tasks")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  console.log("ADMIN USERS:", usersResult);
  console.log("ADMIN TASKS:", tasksResult);
  console.log("ADMIN PENDING:", pendingResult);

  if (usersResult.error) throw usersResult.error;
  if (tasksResult.error) throw tasksResult.error;
  if (pendingResult.error) throw pendingResult.error;

  return {
    usersCount: usersResult.count || 0,
    tasksCount: tasksResult.count || 0,
    pendingCount: pendingResult.count || 0,
    payoutsCount: 0,
  };
}

export async function getPendingUserTasks() {
  const { data: userTasks, error } = await supabase
    .from("user_tasks")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) throw error;

  const result = [];

  for (const item of userTasks || []) {
    const { data: user } = await supabase
      .from("users")
      .select("first_name, username, telegram_id")
      .eq("id", item.user_id)
      .maybeSingle();

    const { data: task } = await supabase
      .from("tasks")
      .select("title, reward, category")
      .eq("id", item.task_id)
      .maybeSingle();

    result.push({
      ...item,
      users: user,
      tasks: task,
    });
  }

  return result;
}

export async function approveUserTask(userTask) {
  const reward = Number(userTask.reward || userTask.tasks?.reward || 0);

  const { data: dbUser, error: userError } = await supabase
    .from("users")
    .select("id, balance, total_earned")
    .eq("id", userTask.user_id)
    .single();

  if (userError) throw userError;

  const newBalance = Number(dbUser.balance || 0) + reward;
  const newTotalEarned = Number(dbUser.total_earned || 0) + reward;

  const { error: balanceError } = await supabase
    .from("users")
    .update({
  balance: newBalance,
  total_earned: newTotalEarned,
})
    .eq("id", userTask.user_id);

  if (balanceError) throw balanceError;

  const { error: taskError } = await supabase
    .from("user_tasks")
    .update({
      status: "approved",
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", userTask.id);
    await checkAchievements(userTask.user_id);

  if (taskError) throw taskError;

  await createNotification({
  userId: userTask.user_id,
  title: "Задание одобрено",
  text: `Начислено ${reward} ₽ на баланс.`,
  type: "success",
});
}

export async function rejectUserTask(userTask) {
  const { error } = await supabase
    .from("user_tasks")
    .update({
      status: "rejected",
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", userTask.id);

  if (error) throw error;

  await createNotification({
  userId: userTask.user_id,
  title: "Задание отклонено",
  text: "Проверь корректность выполнения и попробуй другое задание.",
  type: "error",
});
}


export async function getWithdrawRequestsForAdmin() {
  const { data: requests, error } = await supabase
    .from("withdraw_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  const result = [];

  for (const item of requests || []) {
    const { data: user } = await supabase
      .from("users")
      .select("first_name, username, telegram_id")
      .eq("id", item.user_id)
      .maybeSingle();

    result.push({
      ...item,
      user,
    });
  }

  return result;
}

export async function approveWithdrawRequest(request) {
  const { error } = await supabase
    .from("withdraw_requests")
    .update({
      status: "approved",
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", request.id);

  if (error) throw error;
  await createNotification({
  userId: request.user_id,
  title: "Выплата подтверждена",
  text: `Заявка на ${Number(request.amount || 0).toLocaleString("ru-RU")} ₽ отмечена как выплаченная.`,
  type: "success",
});
}

export async function rejectWithdrawRequest(request) {
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("balance")
    .eq("id", request.user_id)
    .single();

  if (userError) throw userError;
  await createNotification({
  userId: request.user_id,
  title: "Выплата отклонена",
  text: "Средства возвращены на баланс.",
  type: "error",
});

  const returnedBalance = Number(user.balance || 0) + Number(request.amount || 0);

  const { error: balanceError } = await supabase
    .from("users")
    .update({ balance: returnedBalance })
    .eq("id", request.user_id);

  if (balanceError) throw balanceError;

  const { error } = await supabase
    .from("withdraw_requests")
    .update({
      status: "rejected",
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", request.id);

  if (error) throw error;
}

export async function getAdminAnalytics() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayISO = today.toISOString();

  const { count: newUsersToday } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .gte("created_at", todayISO);

  const { count: approvedTasksToday } = await supabase
    .from("user_tasks")
    .select("*", { count: "exact", head: true })
    .eq("status", "approved")
    .gte("reviewed_at", todayISO);

  const { data: withdrawsToday } = await supabase
    .from("withdraw_requests")
    .select("amount")
    .eq("status", "approved")
    .gte("reviewed_at", todayISO);

  const paidToday = (withdrawsToday || []).reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  const { count: bonusesToday } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .ilike("title", "%Ежедневный бонус%")
    .gte("created_at", todayISO);

  const { count: achievementsToday } = await supabase
    .from("user_achievements")
    .select("*", { count: "exact", head: true })
    .gte("created_at", todayISO);

  return {
    newUsersToday: newUsersToday || 0,
    approvedTasksToday: approvedTasksToday || 0,
    paidToday,
    bonusesToday: bonusesToday || 0,
    achievementsToday: achievementsToday || 0,
  };
}