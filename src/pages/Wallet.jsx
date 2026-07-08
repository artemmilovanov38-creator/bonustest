import { useEffect, useState } from "react";
import { CreditCard, History, Send } from "lucide-react";
import {
  createWithdrawRequest,
  getWithdrawRequests,
} from "../services/walletService";

export default function Wallet({ user, showToast }) {
  const [amount, setAmount] = useState("");
  const [wallet, setWallet] = useState("");
  const [requests, setRequests] = useState([]);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user?.id) {
      loadRequests();
    }
  }, [user]);

  async function loadRequests() {
    try {
      const data = await getWithdrawRequests(user.id);
      setRequests(data);
    } catch (error) {
      console.error("Withdraw history error:", error);
    }
  }

  async function handleCreateWithdraw() {
    try {
      setSending(true);
      setMessage("");

      await createWithdrawRequest({
        userId: user.id,
        amount: Number(amount),
        wallet,
      });

      setAmount("");
      setWallet("");
     setMessage("");

showToast?.({
  type: "success",
  title: "Заявка создана",
  text: "Она появилась в истории и ожидает проверки.",
});
      await loadRequests();
    } catch (error) {
  const errorText = error.message || "Не удалось создать заявку";

  setMessage(errorText);

  showToast?.({
    type: "error",
    title: "Ошибка",
    text: errorText,
  });
} finally {
      setSending(false);
    }
  }

  return (
    <main className="page wallet-page">
      <section className="wallet-hero">
        <span>Кошелёк</span>
        <h1>{Number(user?.balance || 0).toLocaleString("ru-RU")} ₽</h1>
        <p>Доступно для вывода</p>
      </section>

      <section className="app-card withdraw-card">
        <div className="wallet-section-title">
          <CreditCard />
          <h2>Вывод средств</h2>
        </div>

        <input
          className="app-input"
          type="number"
          placeholder="Сумма вывода"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />

        <input
          className="app-input"
          placeholder="Карта / номер / реквизиты"
          value={wallet}
          onChange={(event) => setWallet(event.target.value)}
        />

        {message && <p className="wallet-message">{message}</p>}

        <button
          className="app-button"
          disabled={sending}
          onClick={handleCreateWithdraw}
        >
          <Send />
          {sending ? "Отправляем..." : "Создать заявку"}
        </button>
      </section>

      <section className="wallet-history">
        <div className="wallet-section-title">
          <History />
          <h2>История заявок</h2>
        </div>

        <div className="withdraw-list">
          {requests.length === 0 ? (
            <div className="app-card empty-state" style={{ padding: 22 }}>
              <span>💸</span>
              <h2>История пустая</h2>
              <p>Здесь появятся твои заявки на вывод.</p>
            </div>
          ) : (
            requests.map((item) => (
              <div className="withdraw-item app-card" key={item.id}>
                <div>
                  <strong>
                    {Number(item.amount).toLocaleString("ru-RU")} ₽
                  </strong>
                  <span>{item.wallet}</span>
                </div>

                <small className={`status-badge ${item.status}`}>
                  {item.status === "pending"
                    ? "На проверке"
                    : item.status === "approved"
                      ? "Выплачено"
                      : "Отклонено"}
                </small>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}