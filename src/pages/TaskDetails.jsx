import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Clock, Star, Upload, Zap } from "lucide-react";
import { getTaskById } from "../services/taskService";
import {
  getUserTaskByTaskId,
  submitTaskProof,
  uploadTaskProof,
} from "../services/userTaskService";

export default function TaskDetails({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [userTask, setUserTask] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadTask();
  }, [id]);

  async function loadTask() {
    try {
      setLoading(true);
      setError("");

      const taskData = await getTaskById(id);
      const userTaskData = await getUserTaskByTaskId(user.id, id);

      setTask(taskData);
      setUserTask(userTaskData);
    } catch (err) {
      console.error("Task details error:", err);
      setError(err.message || "Не удалось загрузить задание");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!file) {
      setError("Сначала прикрепи скриншот выполнения");
      return;
    }

    try {
      setSending(true);
      setError("");

      const proofUrl = await uploadTaskProof(file, user.id, task.id);

      const submitted = await submitTaskProof({
        userId: user.id,
        taskId: task.id,
        proofUrl,
        reward: task.reward,
      });

      setUserTask(submitted);
      setFile(null);
    } catch (err) {
      console.error("Submit task error:", err);
      setError(err.message || "Не удалось отправить задание");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <main className="page task-details-page">
        <div className="skeleton-card big"></div>
        <div className="skeleton-card medium"></div>
      </main>
    );
  }

  if (error && !task) {
    return (
      <main className="page task-details-page">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft /> Назад
        </button>

        <div className="app-card empty-state">
          <span>⚠️</span>
          <h2>Ошибка</h2>
          <p>{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="page task-details-page">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft /> Назад
      </button>

      <section className="task-details-hero">
        <span>{task.category}</span>
        <h1>{task.title}</h1>
        <strong>{Number(task.reward).toLocaleString("ru-RU")} ₽</strong>

        <div className="task-meta details">
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
      </section>

      <section className="app-card task-instruction-card">
        <h2>Что нужно сделать</h2>
        <p>{task.instruction || task.description}</p>
      </section>

      {userTask ? (
  <section className="app-card task-status-card">
    <span>✅</span>
    <h2>Задание отправлено</h2>

    <p>
      Статус:{" "}
      {userTask.status === "pending"
        ? "на проверке"
        : userTask.status === "approved"
        ? "одобрено"
        : "отклонено"}
    </p>
  </section>
) : (
  <>
    {task?.task_url && (
      <a
        className="task-open-link"
        href={task.task_url}
        target="_blank"
        rel="noreferrer"
      >
        {task.task_button_text || "Открыть задание"}
      </a>
    )}

    <section className="app-card proof-card">
      <h2>Загрузить скриншот</h2>

      <label className="proof-upload">
        <Upload />
        <span>{file ? file.name : "Нажми, чтобы выбрать файл"}</span>

        <input
          type="file"
          accept="image/*"
          onChange={(event) => setFile(event.target.files?.[0] || null)}
        />
      </label>

      {error && <p className="form-error">{error}</p>}

      <button
        className="app-button"
        disabled={sending}
        onClick={handleSubmit}
      >
        {sending ? "Отправляем..." : "Отправить на проверку"}
      </button>
    </section>
  </>
)}
    </main>
  );
}