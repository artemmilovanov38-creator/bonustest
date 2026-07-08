import { supabase } from "../lib/supabase";
import { TASK_STATUS } from "../constants/statuses";

export async function getActiveTasks() {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("status", TASK_STATUS.ACTIVE)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data || [];
}

export async function getHotTask() {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("status", TASK_STATUS.ACTIVE)
    .eq("is_hot", true)
    .order("reward", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  return data;
}

export async function getTaskById(taskId) {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", taskId)
    .single();

  if (error) throw error;

  return data;
}