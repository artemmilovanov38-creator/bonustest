import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [withdraws, setWithdraws] = useState([]);
  const [title, setTitle] = useState("");
const [description, setDescription] = useState("");
const [reward, setReward] = useState("");
const [level, setLevel] = useState("1");
const [taskType, setTaskType] = useState("manual_check");
  

  useEffect(() => {
    loadUsers();
    loadWithdraws();
  }, []);

  async function loadUsers() {
    const { data } = await supabase
      .from("users")
      .select("*");

    setUsers(data || []);
  }

  async function loadWithdraws() {
    const { data } = await supabase
      .from("withdraws")
      .select("*")
      .order("created_at", { ascending: false });

    setWithdraws(data || []);
  }

  async function approveWithdraw(id) {
    await supabase
      .from("withdraws")
      .update({
        status: "approved",
      })
      .eq("id", id);

    loadWithdraws();
  }

  async function rejectWithdraw(id) {
    await supabase
      .from("withdraws")
      .update({
        status: "rejected",
      })
      .eq("id", id);

    loadWithdraws();
  }
  async function createTask() {

  const { error } = await supabase
    .from("tasks")
    .insert({
      title,
      description,
      reward: Number(reward),
      level: Number(level),
      task_type: taskType,
    });

  if (error) {
    alert(error.message);
    return;
  }

  alert("Задание создано");

  setTitle("");
  setDescription("");
  setReward("");
  setLevel("1");
}

  return (
    <div className="task-card">
      <h1>Админка</h1>
      <div
  style={{
    border: "1px solid #ddd",
    padding: "15px",
    borderRadius: "12px",
    marginBottom: "20px",
  }}
>
  <h2>Создать задание</h2>

  <input
    placeholder="Название"
    value={title}
    onChange={(e) =>
      setTitle(e.target.value)
    }
  />

  <br />
  <br />

  <input
    placeholder="Описание"
    value={description}
    onChange={(e) =>
      setDescription(e.target.value)
    }
  />

  <br />
  <br />

  <input
    placeholder="Награда"
    value={reward}
    onChange={(e) =>
      setReward(e.target.value)
    }
  />

  <br />
  <br />

  <select
    value={level}
    onChange={(e) =>
      setLevel(e.target.value)
    }
  >
    <option value="1">Уровень 1</option>
    <option value="2">Уровень 2</option>
    <option value="3">Уровень 3</option>
    <option value="4">Уровень 4</option>
    <option value="5">Уровень 5</option>
  </select>

  <br />
  <br />

  <select
    value={taskType}
    onChange={(e) =>
      setTaskType(e.target.value)
    }
  >
    <option value="manual_check">
      Ручная проверка
    </option>

    <option value="telegram_subscribe">
      Подписка Telegram
    </option>

    <option value="partner_purchase">
      Покупка партнера
    </option>
  </select>

  <br />
  <br />

  <button onClick={createTask}>
    ➕ Создать задание
  </button>
</div>

      <h2>Пользователи</h2>

      {users.map((user) => (
        <div
          key={user.id}
          style={{
            borderBottom: "1px solid #ddd",
            padding: "10px 0",
          }}
        >
          <b>{user.email}</b>
          <br />
          Баланс: {user.balance} ₽
        </div>
      ))}

      <hr />

      <h2>Заявки на вывод</h2>

      {withdraws.map((item) => (
        <div
          key={item.id}
          style={{
            border: "1px solid #ddd",
            padding: "12px",
            marginBottom: "10px",
            borderRadius: "12px",
          }}
        >
          <b>{item.amount} ₽</b>
          <br />
          Кошелек: {item.wallet}
          <br />
          Статус: {item.status}
          <br />
          <br />

          <button onClick={() => approveWithdraw(item.id)}>
            ✅ Одобрить
          </button>

          <button
            onClick={() => rejectWithdraw(item.id)}
            style={{ marginLeft: 10 }}
          >
            ❌ Отклонить
          </button>
        </div>
      ))}
    </div>
  );
}