import { supabase } from "../lib/supabase";

export async function getProfileStats(userId) {
  const { data: userTasks, error } = await supabase
    .from("user_tasks")
    .select("status, reward")
    .eq("user_id", userId);

  if (error) throw error;

  const completed = userTasks.filter((item) => item.status === "approved");
  const pending = userTasks.filter((item) => item.status === "pending");

  const earned = completed.reduce(
    (sum, item) => sum + Number(item.reward || 0),
    0
  );

  return {
    completedCount: completed.length,
    pendingCount: pending.length,
    earned,
  };
}