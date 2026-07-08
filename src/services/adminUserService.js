import { supabase } from "../lib/supabase";

export async function getUsersForAdmin() {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data || [];
}

export async function updateUserBalance(userId, newBalance) {
  const { error } = await supabase
    .from("users")
    .update({ balance: Number(newBalance || 0) })
    .eq("id", userId);

  if (error) throw error;
}

export async function toggleUserBlock(userId, isBlocked) {
  const { error } = await supabase
    .from("users")
    .update({ is_blocked: isBlocked })
    .eq("id", userId);

  if (error) throw error;
}