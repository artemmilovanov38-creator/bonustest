import { supabase } from "../lib/supabase";

export async function getActiveBanner() {
  const { data, error } = await supabase
    .from("app_banners")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .limit(1);

  if (error) throw error;

  return data?.[0] || null;
}

export async function getAllBanners() {
  const { data, error } = await supabase
    .from("app_banners")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw error;

  return data || [];
}

export async function createBanner(banner) {
  const { data, error } = await supabase
    .from("app_banners")
    .insert(banner)
    .select("*")
    .single();

  if (error) throw error;

  return data;
}

export async function updateBanner(id, updates) {
  const { data, error } = await supabase
    .from("app_banners")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;

  return data;
}

export async function deleteBanner(id) {
  const { error } = await supabase
    .from("app_banners")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
export async function getActiveBanners() {
  const { data, error } = await supabase
    .from("app_banners")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;

  return data || [];
}