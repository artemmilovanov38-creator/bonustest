import { useEffect, useState } from "react";
import { Headphones, ShieldCheck, Star, Wallet } from "lucide-react";
import AchievementsBlock from "../components/profile/AchievementsBlock";

import DailyBonusCard from "../components/profile/DailyBonusCard";

import Card from "../components/ui/Card";
import Progress from "../components/ui/Progress";
import { getProfileStats } from "../services/profileService";

export default function Profile({ user }) {
  const [stats, setStats] = useState({
    completedCount: 0,
    pendingCount: 0,
    earned: 0,
  });

  useEffect(() => {
    if (user?.id) {
      loadStats();
    }
  }, [user]);

  async function loadStats() {
    try {
      const data = await getProfileStats(user.id);
      setStats(data);
    } catch (error) {
      console.error("Profile stats error:", error);
    }
  }

  const levelProgress = Math.min(
    100,
    Math.round((Number(stats.earned || 0) / 10000) * 100)
  );

  return (
    <main className="page profile-page">
      <Card className="profile-hero-card">
        <div className="profile-avatar">
          {user?.photo_url ? (
            <img src={user.photo_url} alt="" />
          ) : (
            <span>{user?.first_name?.[0] || "B"}</span>
          )}
        </div>

        <h1>{user?.first_name || "Пользователь"}</h1>
        <p>@{user?.username || "без username"}</p>

        <div className="profile-id">Telegram ID: {user?.telegram_id}</div>
      </Card>

<DailyBonusCard user={user} />
      <Card className="profile-level-card">
        <div className="profile-level-head">
          <div>
            <span>Уровень</span>
            <h2>Новичок</h2>
          </div>

          <Star />
        </div>

        <div className="level-box">
          <div>
            <span>До уровня Профи</span>
            <strong>{levelProgress}%</strong>
          </div>

          <Progress value={levelProgress} />
        </div>
      </Card>

      <section className="profile-stats-grid">
        <Card className="profile-stat-card">
          <Wallet />
          <span>Баланс</span>
          <strong>{Number(user?.balance || 0).toLocaleString("ru-RU")} ₽</strong>
        </Card>

        <Card className="profile-stat-card">
          <ShieldCheck />
          <span>Одобрено</span>
          <strong>{stats.completedCount}</strong>
        </Card>

        <Card className="profile-stat-card">
          <Star />
          <span>На проверке</span>
          <strong>{stats.pendingCount}</strong>
        </Card>

        <Card className="profile-stat-card">
          <Wallet />
          <span>Заработано</span>
          <strong>{Number(stats.earned || 0).toLocaleString("ru-RU")} ₽</strong>
        </Card>
      </section>

<AchievementsBlock user={user} />
      <Card className="support-card">
        <Headphones />
        <div>
          <h2>Поддержка</h2>
          <p>Если возник вопрос по заданию или выплате — напиши менеджеру.</p>
        </div>

        <button>Написать</button>
      </Card>
    </main>
  );
}