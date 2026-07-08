import { useEffect, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import {
  archiveTask,
  createTask,
  getAllTasksForAdmin,
  updateTask,
} from "../../services/adminTaskService";

const emptyForm = {
  task_url: "",
task_button_text: "Открыть задание",
task_type: "other",
  title: "",
  description: "",
  short_description: "",
  instruction: "",
  reward: "",
  category: "Общее",
  status: "active",
  places_left: 100,
  difficulty: "easy",
  estimated_time: "3 минуты",
  is_hot: false,
  proof_required: true,
  verification_type: "manual",
  sort_order: 100,
};

export default function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    try {
      const data = await getAllTasksForAdmin();
      setTasks(data);
    } catch (error) {
      console.error("Admin tasks error:", error);
    }
  }

  function updateField(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function startEdit(task) {
    
    
    setEditingId(task.id);
    setForm({
      task_url: task.task_url || "",
task_button_text: task.task_button_text || "Открыть задание",
task_type: task.task_type || "other",
      title: task.title || "",
      description: task.description || "",
      short_description: task.short_description || "",
      instruction: task.instruction || "",
      reward: task.reward || "",
      category: task.category || "Общее",
      status: task.status || "active",
      places_left: task.places_left || 100,
      difficulty: task.difficulty || "easy",
      estimated_time: task.estimated_time || "3 минуты",
      is_hot: !!task.is_hot,
      proof_required: task.proof_required !== false,
      verification_type: task.verification_type || "manual",
      sort_order: task.sort_order || 100,
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSave() {
    try {
      setSaving(true);
      setMessage("");

      const payload = {
        ...form,
        reward: Number(form.reward || 0),
        places_left: Number(form.places_left || 0),
        sort_order: Number(form.sort_order || 100),
      };

      if (!payload.title) {
        throw new Error("Введите название задания");
      }

      if (editingId) {
        await updateTask(editingId, payload);
        setMessage("Задание обновлено");
      } else {
        await createTask(payload);
        setMessage("Задание создано");
      }

      resetForm();
      await loadTasks();
    } catch (error) {
      setMessage(error.message || "Не удалось сохранить задание");
    } finally {
      setSaving(false);
    }
  }

  async function handleArchive(taskId) {
    if (!confirm("Архивировать это задание?")) return;

    try {
      await archiveTask(taskId);
      await loadTasks();
    } catch (error) {
      alert(error.message || "Не удалось архивировать задание");
    }
  }

  return (
    <section className="admin-task-manager">
      <div className="section-head">
        <h2>Управление заданиями</h2>
        <span>{tasks.length}</span>
      </div>

      <div className="app-card admin-task-form">
        <div className="wallet-section-title">
          <Plus />
          <h2>{editingId ? "Редактировать задание" : "Новое задание"}</h2>
        </div>

        <input
          className="app-input"
          placeholder="Название задания"
          value={form.title}
          onChange={(event) => updateField("title", event.target.value)}
        />

        <input
          className="app-input"
          placeholder="Короткое описание"
          value={form.short_description}
          onChange={(event) => updateField("short_description", event.target.value)}
        />

        <textarea
          className="app-textarea"
          placeholder="Полное описание"
          value={form.description}
          onChange={(event) => updateField("description", event.target.value)}
        />

        <textarea
          className="app-textarea"
          placeholder="Инструкция для пользователя"
          value={form.instruction}
          onChange={(event) => updateField("instruction", event.target.value)}
        />


<input
  className="app-input"
  placeholder="Ссылка задания"
  value={form.task_url}
  onChange={(event) => updateField("task_url", event.target.value)}
/>

<input
  className="app-input"
  placeholder="Текст кнопки"
  value={form.task_button_text}
  onChange={(event) => updateField("task_button_text", event.target.value)}
/>

<select
  className="app-input"
  value={form.task_type}
  onChange={(event) => updateField("task_type", event.target.value)}
>
  <option value="telegram">Telegram</option>
  <option value="hh">HH</option>
  <option value="vk">VK</option>
  <option value="youtube">YouTube</option>
  <option value="website">Сайт</option>
  <option value="other">Другое</option>
</select>
        <div className="admin-form-grid">
          <input
            className="app-input"
            type="number"
            placeholder="Награда"
            value={form.reward}
            onChange={(event) => updateField("reward", event.target.value)}
          />

          <input
            className="app-input"
            placeholder="Категория"
            value={form.category}
            onChange={(event) => updateField("category", event.target.value)}
          />

          <input
            className="app-input"
            placeholder="Время"
            value={form.estimated_time}
            onChange={(event) => updateField("estimated_time", event.target.value)}
          />

          <input
            className="app-input"
            type="number"
            placeholder="Мест"
            value={form.places_left}
            onChange={(event) => updateField("places_left", event.target.value)}
          />
        </div>

        <div className="admin-switches">
          <label>
            <input
              type="checkbox"
              checked={form.is_hot}
              onChange={(event) => updateField("is_hot", event.target.checked)}
            />
            Горячее
          </label>

          <label>
            <input
              type="checkbox"
              checked={form.status === "active"}
              onChange={(event) =>
                updateField("status", event.target.checked ? "active" : "archived")
              }
            />
            Активно
          </label>
        </div>

        {message && <p className="wallet-message">{message}</p>}

        <button className="app-button" disabled={saving} onClick={handleSave}>
          <Save />
          {saving ? "Сохраняем..." : "Сохранить задание"}
        </button>

        {editingId && (
          <button className="secondary-btn" onClick={resetForm}>
            Отменить редактирование
          </button>
        )}
      </div>

      <div className="admin-task-list">
        {tasks.map((task) => (
          <article className="admin-task-item app-card" key={task.id}>
            <div>
              <span>{task.category}</span>
              <h3>{task.title}</h3>
              <p>{task.status === "active" ? "Активно" : "В архиве"}</p>
            </div>

            <strong>{Number(task.reward || 0).toLocaleString("ru-RU")} ₽</strong>

            <div className="admin-task-actions">
              <button onClick={() => startEdit(task)}>Редактировать</button>
              <button onClick={() => handleArchive(task.id)}>
                <Trash2 />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
