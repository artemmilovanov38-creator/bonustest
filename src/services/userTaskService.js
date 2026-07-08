import { supabase } from "../lib/supabase";

export async function getUserTaskByTaskId(userId, taskId) {
  const { data, error } = await supabase
    .from("user_tasks")
    .select("*")
    .eq("user_id", userId)
    .eq("task_id", taskId)
    .maybeSingle();

  if (error) throw error;

  return data;
}

export async function uploadTaskProof(file, userId, taskId) {
  const fileExt = file.name.split(".").pop();
  const filePath = `${userId}/${taskId}-${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("task-proofs")
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from("task-proofs")
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export async function submitTaskProof({ userId, taskId, proofUrl, reward }) {
  const alreadySubmitted = await getUserTaskByTaskId(userId, taskId);

  if (alreadySubmitted) {
    throw new Error("Вы уже отправили это задание на проверку");
  }

  const { data, error } = await supabase
    .from("user_tasks")
    .insert({
      user_id: userId,
      task_id: taskId,
      proof_url: proofUrl,
      reward,
      status: "pending",
    })
    .select("*")
    .single();

  if (error) throw error;

  return data;
}

export async function getUserTasks(userId) {
  const { data: userTasks, error } = await supabase
    .from("user_tasks")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const result = [];

  for (const item of userTasks || []) {
    const { data: task } = await supabase
      .from("tasks")
      .select("title, reward, category")
      .eq("id", item.task_id)
      .maybeSingle();

    result.push({
      ...item,
      task,
    });
  }

  return result;
}