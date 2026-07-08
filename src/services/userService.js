import { supabase } from "../lib/supabase";

export async function loginOrCreateTelegramUser(telegramUser, referrerId = null) {
  const { data: existingUser, error: selectError } = await supabase
    .from("users")
    .select("*")
    .eq("telegram_id", telegramUser.telegram_id)
    .maybeSingle();

  if (selectError) throw selectError;

  if (existingUser) {
    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update({
        first_name: telegramUser.first_name,
        last_name: telegramUser.last_name,
        username: telegramUser.username,
        photo_url: telegramUser.photo_url,
        last_seen_at: new Date().toISOString(),
      })
      .eq("id", existingUser.id)
      .select("*")
      .single();

    if (updateError) throw updateError;
    return updatedUser;
  }

  const { data: createdUser, error: insertError } = await supabase
    .from("users")
    .insert({
      telegram_id: telegramUser.telegram_id,
      first_name: telegramUser.first_name,
      last_name: telegramUser.last_name,
      username: telegramUser.username,
      photo_url: telegramUser.photo_url,
      balance: 0,
      referrer_id: referrerId,
      referrals_count: 0,
      is_blocked: false,
      is_admin: false,
      last_seen_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (insertError) throw insertError;

  return createdUser;
}