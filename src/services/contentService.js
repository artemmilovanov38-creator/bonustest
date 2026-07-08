import { supabase } from "../lib/supabase";

export async function getAppContent() {
  const { data, error } = await supabase
    .from("app_content")
    .select("*")
    .order("key", { ascending: true });

  if (error) throw error;

  const content = {};

  for (const item of data || []) {
    content[item.key] = item.value;
  }

  return content;
}

export async function getAppContentRows() {
  const { data, error } = await supabase
    .from("app_content")
    .select("*")
    .order("key", { ascending: true });

  if (error) throw error;

  return data || [];
}

export async function updateAppContent(key, value) {
  const { error } = await supabase
    .from("app_content")
    .update({
      value,
      updated_at: new Date().toISOString(),
    })
    .eq("key", key);

  if (error) throw error;
}