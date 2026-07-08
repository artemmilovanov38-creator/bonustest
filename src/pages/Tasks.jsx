import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Search, Star, Zap } from "lucide-react";

import { getActiveTasks } from "../services/taskService";
import { getUserTasks } from "../services/userTaskService";
import Badge from "../components/ui/Badge";

export default function Tasks({ user }) {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [history, setHistory] = useState([]);
  const [activeCategory, setActiveCategory] = useState("Все");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("active");

  useEffect(() => {
    loadTasks();

    if (user?.id) {
      loadHistory();
    }
  }, [user]);

  async function loadTasks() {
    try {
      const data = await getActiveTasks();
      setTasks(data);
    } catch (error) {
      console.error("Tasks error:", error);
    }
  }

  async function loadHistory() {
    try {
      const data = await getUserTasks(user.id);
      setHistory(data);
    } catch (error) {
      console.error("History error:", error);
    }
  }

  const categories = useMemo(() => {
    return ["Все", ...new Set(tasks.map((task) => task.category || "Общее"))];
  }, [tasks]);

  const filteredTasks = tasks.filter((task) => {
    const matchCategory =
      activeCategory === "Все" || task.category === activeCategory;

    const matchSearch = task.title
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchCategory && matchSearch;
  });

  return (
    <main className="page tasks-page">
      <section className="tasks-hero">
        <span>Центр заданий</span>
        <h1>Выбери задание и начни зарабатывать</h1>
      </section>

      <section className="search-box">
        <Search />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Поиск задания"
        />
      </section>

      <section className="category-tabs">
        {categories.map((category) => (
          <button
            key={category}
            className={activeCategory === category ? "active" : ""}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </section>

      <div className="tasks-tabs">
        <button
          className={activeTab === "active" ? "active" : ""}
          onClick={() => setActiveTab("active")}
        >
          Активные
        </button>

        <button
          className={activeTab === "history" ? "active" : ""}
          onClick={() => setActiveTab("history")}
        >
          Мои задания
        </button>
      </div>

      <section className="tasks-list">
        {activeTab === "active" ? (
          filteredTasks.map((task) => (
            <article
              className="task-card-premium app-card"
              key={task.id}
              onClick={() => navigate(`/tasks/${task.id}`)}
            >
              <div className="task-card-top">
                <div>
                  <span>{task.category}</span>
                  <h2>{task.title}</h2>
                </div>

                <strong>{Number(task.reward).toLocaleString("ru-RU")} ₽</strong>
              </div>

              <p>{task.short_description || task.description}</p>

              <div className="task-meta">
                <div>
                  <Clock />
                  {task.estimated_time || "3 минуты"}
                </div>

                <div>
                  <Star />
                  {task.difficulty === "easy" ? "Легко" : "Средне"}
                </div>

                <div>
                  <Zap />
                  {task.places_left || 0} мест
                </div>
              </div>

              <button
                className="app-button"
                onClick={(event) => {
                  event.stopPropagation();
                  navigate(`/tasks/${task.id}`);
                }}
              >
                Выполнить задание
              </button>
            </article>
          ))
        ) : history.length === 0 ? (
          <div className="app-card empty-state" style={{ padding: 24 }}>
            <span>📭</span>
            <h2>Пока пусто</h2>
            <p>Здесь появятся задания, которые ты отправишь на проверку.</p>
          </div>
        ) : (
          history.map((item) => (
            <article className="task-card-premium app-card" key={item.id}>
              <div className="task-card-top">
                <div>
                  <span>{item.task?.category}</span>
                  <h2>{item.task?.title}</h2>
                </div>

                <strong>
                  {Number(item.task?.reward || 0).toLocaleString("ru-RU")} ₽
                </strong>
              </div>

              <div className="task-status-row">
                {item.status === "approved" && (
                  <Badge variant="success">Одобрено</Badge>
                )}

                {item.status === "pending" && (
                  <Badge variant="warning">На проверке</Badge>
                )}

                {item.status === "rejected" && (
                  <Badge variant="danger">Отклонено</Badge>
                )}
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}