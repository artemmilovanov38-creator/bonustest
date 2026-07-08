import { useEffect, useState } from "react";
import { Gift } from "lucide-react";

import Card from "../ui/Card";
import Button from "../ui/Button";
import Progress from "../ui/Progress";

import {
  claimDailyBonus,
  getDailyBonusStatus,
} from "../../services/dailyBonusService";

export default function DailyBonusCard({ user }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const maxStreak = 7;

  useEffect(() => {
    if (user?.id) {
      loadStatus();
    }
  }, [user]);
  useEffect(() => {
  const timer = setInterval(() => {
    const now = new Date();
    const tomorrow = new Date();

    tomorrow.setHours(24, 0, 0, 0);

    const diff = tomorrow - now;

    const hours = String(Math.floor(diff / 1000 / 60 / 60)).padStart(2, "0");
    const minutes = String(Math.floor((diff / 1000 / 60) % 60)).padStart(2, "0");
    const seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, "0");

    setTimeLeft(`${hours}:${minutes}:${seconds}`);
  }, 1000);

  return () => clearInterval(timer);
}, []);

  async function loadStatus() {
    try {
      const data = await getDailyBonusStatus(user.id);
      setStatus(data);
    } catch (error) {
      console.error("Daily bonus status error:", error);
    }
  }

  async function handleClaim() {
    try {
      setLoading(true);

      await claimDailyBonus(user.id);
      await loadStatus();
    } catch (error) {
      alert(error.message || "Не удалось получить бонус");
    } finally {
      setLoading(false);
    }
  }

  const streak = status?.streak || 0;
  const progress = Math.min(100, Math.round((streak / maxStreak) * 100));

  return (
    <Card className="daily-bonus-card">
      <div className="daily-bonus-head">
        <div className="daily-bonus-icon">
          <Gift />
        </div>

        <div>
          <span>Ежедневный бонус</span>
          <h2>Серия: {streak} дней</h2>
        </div>
      </div>

      <div className="daily-bonus-info">
        <span>Следующая награда</span>
        <strong>+{status?.reward || 25} ₽</strong>
      </div>

      <Progress value={progress} />


{!status?.canClaim && (
  <p className="daily-bonus-timer">
    Следующий бонус через {timeLeft}
  </p>
)}
      <Button
        onClick={handleClaim}
        disabled={!status?.canClaim || loading}
        variant={status?.canClaim ? "primary" : "secondary"}
      >
        
        {loading
          ? "Получаем..."
          : status?.canClaim
            ? "Получить бонус"
            : "Уже получено сегодня"}
      </Button>
    </Card>
  );
}