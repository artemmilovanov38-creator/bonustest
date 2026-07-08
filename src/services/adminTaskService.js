import { supabase } from "../lib/supabase";

export async function getAllTasksForAdmin() {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data || [];
}

export async function createTask(task) {
  const { data, error } = await supabase
    .from("tasks")
    .insert(task)
    .select("*")
    .single();

  if (error) throw error;

  return data;
}

export async function updateTask(taskId, updates) {
  const { data, error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", taskId)
    .select("*")
    .single();

  if (error) throw error;

  return data;
}

export async function archiveTask(taskId) {
  const { error } = await supabase
    .from("tasks")
    .update({ status: TASK_STATUS.ARCHIVED })
    .eq("id", taskId);

  if (error) throw error;
}