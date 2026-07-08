import { useEffect, useState } from "react";
import { Save, Trash2 } from "lucide-react";

import {
  createBanner,
  deleteBanner,
  getAllBanners,
  updateBanner,
} from "../../services/bannerService";

const emptyForm = {
  title: "",
  description: "",
  button_text: "Подробнее",
  button_link: "/tasks",
  icon: "🔥",
  color: "green",
  is_active: true,
  sort_order: 1,
};

export default function BannerManager({ showToast }) {
  const [banners, setBanners] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadBanners();
  }, []);

  async function loadBanners() {
    try {
      const data = await getAllBanners();
      setBanners(data);
    } catch (error) {
      console.error("Banners error:", error);
    }
  }

  function updateField(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function startEdit(banner) {
    setEditingId(banner.id);
    setForm({
      title: banner.title || "",
      description: banner.description || "",
      button_text: banner.button_text || "Подробнее",
      button_link: banner.button_link || "/tasks",
      icon: banner.icon || "🔥",
      color: banner.color || "green",
      is_active: banner.is_active !== false,
      sort_order: banner.sort_order || 1,
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSave() {
    try {
      setSaving(true);

      const payload = {
        ...form,
        sort_order: Number(form.sort_order || 1),
      };

      if (!payload.title) {
        throw new Error("Введите заголовок баннера");
      }

      if (editingId) {
        await updateBanner(editingId, payload);
      } else {
        await createBanner(payload);
      }

      showToast?.({
        type: "success",
        title: "Баннер сохранён",
        text: "Изменения применятся на главной странице.",
      });

      resetForm();
      await loadBanners();
    } catch (error) {
      showToast?.({
        type: "error",
        title: "Ошибка",
        text: error.message || "Не удалось сохранить баннер",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Удалить баннер?")) return;

    try {
      await deleteBanner(id);
      await loadBanners();

      showToast?.({
        type: "success",
        title: "Баннер удалён",
      });
    } catch (error) {
      showToast?.({
        type: "error",
        title: "Ошибка",
        text: error.message || "Не удалось удалить баннер",
      });
    }
  }

  return (
    <section className="banner-manager">
      <div className="section-head">
        <h2>Баннеры и акции</h2>
        <span>{banners.length}</span>
      </div>

      <div className="app-card banner-form">
        <input
          className="app-input"
          placeholder="Заголовок акции"
          value={form.title}
          onChange={(event) => updateField("title", event.target.value)}
        />

        <textarea
          className="app-textarea"
          placeholder="Описание акции"
          value={form.description}
          onChange={(event) => updateField("description", event.target.value)}
        />

        <div className="admin-form-grid">
          <input
            className="app-input"
            placeholder="Текст кнопки"
            value={form.button_text}
            onChange={(event) => updateField("button_text", event.target.value)}
          />

          <input
            className="app-input"
            placeholder="Ссылка кнопки"
            value={form.button_link}
            onChange={(event) => updateField("button_link", event.target.value)}
          />

          <input
            className="app-input"
            placeholder="Иконка"
            value={form.icon}
            onChange={(event) => updateField("icon", event.target.value)}
          />

          <input
            className="app-input"
            type="number"
            placeholder="Порядок"
            value={form.sort_order}
            onChange={(event) => updateField("sort_order", event.target.value)}
          />
        </div>

        <div className="admin-switches">
          <label>
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(event) => updateField("is_active", event.target.checked)}
            />
            Активен
          </label>
        </div>

        <button className="app-button" disabled={saving} onClick={handleSave}>
          <Save />
          {saving ? "Сохраняем..." : editingId ? "Сохранить баннер" : "Создать баннер"}
        </button>

        {editingId && (
          <button className="secondary-btn" onClick={resetForm}>
            Отменить редактирование
          </button>
        )}
      </div>

      <div className="banner-list">
        {banners.map((banner) => (
          <article className="app-card banner-admin-card" key={banner.id}>
            <div>
              <span>{banner.icon}</span>
              <strong>{banner.title}</strong>
              <p>{banner.description}</p>
              <small>{banner.is_active ? "Активен" : "Выключен"}</small>
            </div>

            <div className="admin-task-actions">
              <button onClick={() => startEdit(banner)}>Редактировать</button>
              <button onClick={() => handleDelete(banner.id)}>
                <Trash2 />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}