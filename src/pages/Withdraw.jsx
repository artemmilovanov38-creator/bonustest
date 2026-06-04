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