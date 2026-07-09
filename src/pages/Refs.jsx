import { Copy, Gift, Send, Users } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

export default function Refs({ user }) {
  const botUsername = "@BonusSTest_bot";
  const miniAppName = "bonustest";

  const refLink = `https://t.me/${botUsername}/${miniAppName}?startapp=${user?.telegram_id}`;

  function shareRefLink() {
    const text = "Присоединяйся к BONUSTEST и зарабатывай вместе со мной";

    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(
      refLink
    )}&text=${encodeURIComponent(text)}`;

    window.Telegram?.WebApp?.openTelegramLink(shareUrl);
  }

  async function copyRefLink() {
    try {
      await navigator.clipboard.writeText(refLink);
      alert("Ссылка скопирована");
    } catch {
      prompt("Скопируй ссылку вручную:", refLink);
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
        <p>
          Отправь ссылку друзьям. Когда они начнут пользоваться приложением, ты
          увидишь их в статистике.
        </p>
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

        <div className="refs-actions">
          <Button onClick={shareRefLink}>
            <Send />
            Пригласить
          </Button>

          <Button variant="secondary" onClick={copyRefLink}>
            <Copy />
            Скопировать
          </Button>
        </div>
      </Card>
    </main>
  );
}