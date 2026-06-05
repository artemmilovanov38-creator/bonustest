import { tg } from "../lib/telegram";
import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Withdraw({ userId }) {
  const [amount, setAmount] = useState("");
  const [wallet, setWallet] = useState("");

  async function createWithdraw() {
    const { error } = await supabase
      .from("withdraws")
      .insert({
        user_id: userId,
        amount,
        wallet,
        status: "pending",
      });

    if (error) {
      alert(error.message);
    } else {
     const response = await fetch(
"/api/send-withdraw-notification",
{
method: "POST",
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify({
amount,
username:
tg?.initDataUnsafe?.user?.username,
telegramId:
tg?.initDataUnsafe?.user?.id,
}),
}
);

const result =
await response.json();

console.log(
"TELEGRAM RESULT:",
result
);

alert("Заявка создана");

setAmount("");
setWallet("");

    }
  }

  return (
    <div className="task-card">
      <h3>Вывод средств</h3>

      <input
        placeholder="Сумма"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <input
        placeholder="Кошелек"
        value={wallet}
        onChange={(e) => setWallet(e.target.value)}
      />

      <button onClick={createWithdraw}>
        Отправить заявку
      </button>
    </div>
  );
}