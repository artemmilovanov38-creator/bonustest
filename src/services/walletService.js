import { supabase } from "../lib/supabase";
import { WITHDRAW_STATUS } from "../constants/statuses";
import { getAppContent } from "./contentService";


export async function getWithdrawRequests(userId) {
  const { data, error } = await supabase
    .from("withdraw_requests")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data || [];
}

export async function createWithdrawRequest({ userId, amount, wallet }) {
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("balance")
    .eq("id", userId)
    .single();

  if (userError) throw userError;
  const content = await getAppContent();

const minWithdraw = Number(content["settings.min_withdraw_amount"] || 0);
const withdrawsEnabled = content["settings.withdraws_enabled"] !== "false";

if (!withdrawsEnabled) {
  throw new Error(
    content["settings.withdraws_disabled_text"] ||
      "Выводы временно недоступны"
  );
}

if (Number(amount) < minWithdraw) {
  throw new Error(`Минимальная сумма вывода — ${minWithdraw} ₽`);
}

  if (Number(amount) <= 0) {
    throw new Error("Введите корректную сумму");
  }

  if (Number(amount) > Number(user.balance || 0)) {
    throw new Error("Недостаточно средств на балансе");
  }

  const newBalance = Number(user.balance || 0) - Number(amount);

  const { error: balanceError } = await supabase
    .from("users")
    .update({ balance: newBalance })
    .eq("id", userId);

  if (balanceError) throw balanceError;

  const { data, error } = await supabase
    .from("withdraw_requests")
    .insert({
      user_id: userId,
      amount,
      wallet,
      status: WITHDRAW_STATUS.PENDING,
    })
    .select("*")
    .single();

  if (error) throw error;

  return data;
}