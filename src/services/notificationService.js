import { supabase } from "../lib/supabase";

export async function createNotification({ userId, title, text, type = "info" }) {
  const { error } = await supabase.from("notifications").insert({
    user_id: userId,
    title,
    text,
    type,
    is_read: false,
  });

  if (error) throw error;
}

export async function getUserNotifications(userId) {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data || [];
}

export async function markNotificationsAsRead(userId) {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) throw error;
}
export async function getUnreadNotificationsCount(userId) {
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) throw error;

  return count || 0;
}
export async function deleteReadNotifications(userId) {
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("user_id", userId)
    .eq("is_read", true);

  if (error) throw error;
}
export async function deleteNotification(notificationId, userId) {
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", notificationId)
    .eq("user_id", userId);

  if (error) throw error;
}