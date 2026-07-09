import { Copy, Gift, Users } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

export default function Refs({ user }) {
  const botUsername = "bonustest_bot";

  const miniAppName = "ИМЯ_ТВОЕГО_MINI_APP";

const refLink = `https://t.me/${botUsername}/${miniAppName}?startapp=${user?.telegram_id}`;

  async function copyRefLink() {
    try {
      await navigator.clipboard.writeText(refLink);
      setToast({
  type: "success",
  title: "Ссылка скопирована",
  text: "Отправь её друзьям и зарабатывай вместе с BONUSTEST.",
});
      alert("Ссылка скопирована");
    } catch {
      alert("Не удалось скопировать ссылку");
    }
  }

  return (
    <main className="page refs-page">
      <section className="refs-hero">
        <div className="refs-icon">
          <Gift />
        </div>

        <span>Реферальная программа</span>
        <h1>Приглашай друзей и зарабатывай больше</h1>
        <p>Отправь ссылку друзьям. Когда они начнут пользоваться приложением, ты увидишь их в статистике.</p>
      </section>

      <section className="refs-stats">
        <Card className="refs-stat-card">
          <Users />
          <span>Приглашено</span>
          <strong>{user?.referrals_count || 0}</strong>
        </Card>

        <Card className="refs-stat-card">
          <Gift />
          <span>Доход с рефералов</span>
          <strong>0 ₽</strong>
        </Card>
      </section>

      <Card className="ref-link-card">
        <span>Твоя ссылка</span>
        <p>{refLink}</p>

        <Button onClick={copyRefLink}>
          <Copy />
          Скопировать ссылку
        </Button>
      </Card>
    </main>
  );
}