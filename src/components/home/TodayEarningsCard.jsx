import { ArrowRight, Sparkles } from "lucide-react";

export default function TodayEarningsCard({ tasks, navigate }) {
  const totalReward = tasks.reduce((sum, task) => sum + Number(task.reward || 0), 0);
  const activeCount = tasks.length;

  return (
    <section className="today-card">
      <div className="today-icon">
        <Sparkles />
      </div>

      <p>Сегодня можно заработать</p>
      <h2>{totalReward.toLocaleString("ru-RU")} ₽</h2>
      <span>Доступно заданий: {activeCount}</span>

      <button onClick={() => navigate("/tasks")}>
        Смотреть задания <ArrowRight />
      </button>
    </section>
  );
}