import { Flame, ArrowRight } from "lucide-react";

export default function HotTaskCard({ task, navigate }) {
  if (!task) return null;

  return (
    <section className="hot-task-card app-card">
      <div className="hot-task-head">
        <div>
          <span>🔥 Горячее задание</span>
          <h2>{task.title}</h2>
        </div>

        <div className="hot-task-icon">
          <Flame />
        </div>
      </div>

      <p>{task.description}</p>

      <div className="hot-task-bottom">
        <strong>{Number(task.reward).toLocaleString("ru-RU")} ₽</strong>
        <small>осталось мест: {task.places_left}</small>
      </div>

      <button onClick={() => navigate(`/tasks/${task.id}`)}>
        Выполнить <ArrowRight />
      </button>
    </section>
  );
}