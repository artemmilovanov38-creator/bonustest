import { useEffect, useState } from "react";
import { Save } from "lucide-react";

import {
  getAppContentRows,
  updateAppContent,
} from "../../services/contentService";

export default function ContentManager({ showToast }) {
  const [rows, setRows] = useState([]);
  const [savingKey, setSavingKey] = useState("");
  const [activeGroup, setActiveGroup] = useState("home");

  useEffect(() => {
    loadContent();
  }, []);

  async function loadContent() {
    try {
      const data = await getAppContentRows();
      setRows(data);
    } catch (error) {
      console.error("Content error:", error);
    }
  }

  function updateLocalValue(key, value) {
    setRows((prev) =>
      prev.map((item) => (item.key === key ? { ...item, value } : item))
    );
  }

  const groups = [
  {
    id: "home",
    title: "Главная",
  },
  {
    id: "onboarding",
    title: "Онбординг",
  },
  {
    id: "wallet",
    title: "Кошелёк",
  },
  {
    id: "support",
    title: "Поддержка",
  },
];

  async function handleSave(item) {
    try {
      setSavingKey(item.key);

      await updateAppContent(item.key, item.value);

      showToast?.({
        type: "success",
        title: "Контент сохранён",
        text: item.key,
      });
    } catch (error) {
      showToast?.({
        type: "error",
        title: "Ошибка",
        text: error.message || "Не удалось сохранить",
      });
    } finally {
      setSavingKey("");
    }
  }

  return (
    <section className="content-manager">
      <div className="section-head">
        <h2>Контент приложения</h2>
        <span>{rows.length}</span>
      </div>

      <div className="content-layout">

  <aside className="content-sidebar">

    {groups.map(group => (

      <button
        key={group.id}
        className={activeGroup === group.id ? "active" : ""}
        onClick={() => setActiveGroup(group.id)}
      >
        {group.title}
      </button>

    ))}

  </aside>

  <div className="content-list">

    {rows
      .filter(item => item.key.startsWith(activeGroup))
      .map(item => (

        <div
          className="content-item app-card"
          key={item.key}
        >

          <div>

            <span>{item.key}</span>

            <p>{item.description}</p>

          </div>

          <textarea
            className="app-textarea"
            value={item.value || ""}
            onChange={(e) =>
              updateLocalValue(item.key, e.target.value)
            }
          />

          <button
            className="app-button"
            onClick={() => handleSave(item)}
          >
            {savingKey === item.key
              ? "Сохраняем..."
              : "Сохранить"}
          </button>

        </div>

      ))}

  </div>

</div>
    </section>
  );
}