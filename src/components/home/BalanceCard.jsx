import { ArrowUpRight, Wallet } from "lucide-react";

export default function BalanceCard({ user, setActivePage }) {
  const balance = Number(user?.balance || 0).toLocaleString("ru-RU");

  return (
    <section className="balance-card-premium">
      <div className="balance-card-glow"></div>

      <div className="balance-card-top">
        <div>
          <span>Доступно</span>
          <h2>{balance} ₽</h2>
        </div>

        <div className="balance-icon">
          <Wallet />
        </div>
      </div>

      <div className="balance-stats">
        <div>
          <small>Сегодня</small>
          <strong>+0 ₽</strong>
        </div>

        <div>
          <small>Уровень</small>
          <strong>Новичок</strong>
        </div>
      </div>

      <button
        className="withdraw-btn"
        onClick={() => setActivePage("wallet")}
      >
        Вывести средства
        <ArrowUpRight />
      </button>
    </section>
  );
}