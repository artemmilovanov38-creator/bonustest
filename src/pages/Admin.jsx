import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [withdraws, setWithdraws] = useState([]);
  const [stats, setStats] = useState({
  totalUsers: 0,
  totalBalance: 0,
  totalWithdraws: 0,
  pendingWithdraws: 0,
  totalReferrals: 0,
});
  const [title, setTitle] = useState("");
const [description, setDescription] = useState("");
const [reward, setReward] = useState("");
const [level, setLevel] = useState("1");
const [taskType, setTaskType] = useState("manual_check");
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
   loadAllData();
loadTasks();
  }, []);

  async function loadUsers() {
    const { data } = await supabase
      .from("users")
      .select("*");

    setUsers(data || []);
  }
  async function loadAllData() {

  const { data: usersData } =
    await supabase
      .from("users")
      .select("*");

  const {
    data: withdrawsData,
  } = await supabase
    .from("withdraws")
    .select("*");

  setUsers(usersData || []);
  setWithdraws(
    withdrawsData || []
  );

  calculateStats(
    usersData || [],
    withdrawsData || []
  );
}

  async function loadWithdraws() {
    const { data } = await supabase
      .from("withdraws")
      .select("*")
      .order("created_at", { ascending: false });

    setWithdraws(data || []);
  }
  function calculateStats(
  usersData,
  withdrawsData
) {

  const totalBalance =
    usersData.reduce(
      (sum, user) =>
        sum + Number(user.balance || 0),
      0
    );

  const totalReferrals =
    usersData.reduce(
      (sum, user) =>
        sum +
        Number(
          user.referrals_count || 0
        ),
      0
    );
    async function loadTasks() {
  const { data } = await supabase
    .from("tasks")
    .select("*")
    .order("id", {
      ascending: false,
    });

  setTasks(data || []);
}

  const pendingWithdraws =
    withdrawsData.filter(
      (item) =>
        item.status === "pending"
    ).length;

  setStats({
    totalUsers: usersData.length,
    totalBalance,
    totalWithdraws:
      withdrawsData.length,
    pendingWithdraws,
    totalReferrals,
  });
}

 async function approveWithdraw(id) {
  const withdraw = withdraws.find(
    (item) => item.id === id
  );

  await supabase
    .from("withdraws")
    .update({
      status: "approved",
    })
    .eq("id", id);

  const user = users.find(
    (u) => u.id === withdraw.user_id
  );

  if (user?.telegram_id) {
    await fetch("/api/send-user-notification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        telegramId: user.telegram_id,
        text: `✅ Ваша заявка на вывод одобрена

Сумма: ${withdraw.amount} ₽

Средства скоро будут отправлены.`,
      }),
    });
  }

  loadWithdraws();
}

 async function rejectWithdraw(id) {
  const withdraw = withdraws.find(
    (item) => item.id === id
  );

  await supabase
    .from("withdraws")
    .update({
      status: "rejected",
    })
    .eq("id", id);

  const user = users.find(
    (u) => u.id === withdraw.user_id
  );

  if (user?.telegram_id) {
    await fetch("/api/send-user-notification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        telegramId: user.telegram_id,
        text: `❌ Ваша заявка на вывод отклонена

Сумма: ${withdraw.amount} ₽

Если есть вопросы — обратитесь в поддержку.`,
      }),
    });
  }

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
    async function deleteTask(id) {

  if (
    !confirm(
      "Удалить задание?"
    )
  ) {
    return;
  }

  await supabase
    .from("tasks")
    .delete()
    .eq("id", id);

  loadTasks();
}

async function toggleTask(
  id,
  currentStatus
) {

  await supabase
    .from("tasks")
    .update({
      is_active:
        !currentStatus,
    })
    .eq("id", id);

  loadTasks();
}
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
    display: "grid",
    gap: 10,
    marginBottom: 20,
  }}
>

  <div>
    👥 Пользователей:
    {stats.totalUsers}
  </div>

  <div>
    💰 Общий баланс:
    {stats.totalBalance} ₽
  </div>

  <div>
    📨 Заявок:
    {stats.totalWithdraws}
  </div>

  <div>
    ⏳ На проверке:
    {stats.pendingWithdraws}
  </div>

  <div>
    🤝 Рефералов:
    {stats.totalReferrals}
  </div>

</div>
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
  <h2>Задания</h2>

{tasks.map((task) => (
  <div
    key={task.id}
    style={{
      border: "1px solid #ddd",
      padding: 12,
      marginBottom: 10,
      borderRadius: 12,
    }}
  >
    <b>{task.title}</b>

    <br />

    Награда:
    {task.reward} ₽

    <br />

    Уровень:
    {task.level}

    <br />

    Статус:

    {task.is_active
      ? " 🟢 Активно"
      : " 🔴 Скрыто"}

    <br />
    <br />

    <button
      onClick={() =>
        toggleTask(
          task.id,
          task.is_active
        )
      }
    >
      {task.is_active
        ? "🔒 Скрыть"
        : "🔓 Активировать"}
    </button>

    <button
      style={{
        marginLeft: 10,
      }}
      onClick={() =>
        deleteTask(task.id)
      }
    >
      🗑️ Удалить
    </button>
  </div>
))}
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