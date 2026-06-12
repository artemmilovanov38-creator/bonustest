import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [withdraws, setWithdraws] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [reports, setReports] =
  useState([]);
  const [editingTask, setEditingTask] =
  useState(null);

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

  useEffect(() => {
    loadReports();
    loadAllData();
    loadTasks();
  }, []);

  async function loadReports() {

  const { data } =
    await supabase
      .from("task_reports")
      .select("*")
      .order(
        "created_at",
        {
          ascending: false,
        }
      );

  setReports(data || []);
}
  async function loadAllData() {
    const { data: usersData } = await supabase
      .from("users")
      .select("*");

    const { data: withdrawsData } = await supabase
      .from("withdraws")
      .select("*")
      .order("created_at", { ascending: false });

    setUsers(usersData || []);
    setWithdraws(withdrawsData || []);

    calculateStats(usersData || [], withdrawsData || []);
  }

  async function loadTasks() {
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .order("id", { ascending: false });

    setTasks(data || []);
  }

  function calculateStats(usersData, withdrawsData) {
    const totalBalance = usersData.reduce(
      (sum, user) => sum + Number(user.balance || 0),
      0
    );

    const totalReferrals = usersData.reduce(
      (sum, user) => sum + Number(user.referrals_count || 0),
      0
    );

    const pendingWithdraws = withdrawsData.filter(
      (item) => item.status === "pending"
    ).length;

    setStats({
      totalUsers: usersData.length,
      totalBalance,
      totalWithdraws: withdrawsData.length,
      pendingWithdraws,
      totalReferrals,
    });
  }

  async function approveWithdraw(id) {
    const withdraw = withdraws.find((item) => item.id === id);

    await supabase
      .from("withdraws")
      .update({ status: "approved" })
      .eq("id", id);

    const user = users.find((u) => u.id === withdraw.user_id);

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

    loadAllData();
  }

  async function rejectWithdraw(id) {
    const withdraw = withdraws.find((item) => item.id === id);

    await supabase
      .from("withdraws")
      .update({ status: "rejected" })
      .eq("id", id);

    const user = users.find((u) => u.id === withdraw.user_id);

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

    loadAllData();
  }

  async function createTask() {
    const { error } = await supabase.from("tasks").insert({
      title,
      description,
      reward: Number(reward),
      level: Number(level),
      task_type: taskType,
      is_active: true,
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
    setTaskType("manual_check");

    loadTasks();
  }

  async function toggleTask(id, currentStatus) {
    await supabase
      .from("tasks")
      .update({
        is_active: !currentStatus,
      })
      .eq("id", id);

    loadTasks();
  }
async function rejectReport(id) {

  const { data: report } =
    await supabase
      .from("task_reports")
      .select("*")
      .eq("id", id)
      .single();

  await supabase
    .from("task_reports")
    .update({
      status: "rejected",
    })
    .eq("id", id);

  const { data: user } =
    await supabase
      .from("users")
      .select("*")
      .eq(
        "id",
        report.user_id
      )
      .single();

  if (user?.telegram_id) {

    await fetch(
      "/api/send-user-notification",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          telegramId:
            user.telegram_id,

          text:
            "❌ Отчёт отклонён. Проверьте условия задания и отправьте новый отчёт.",
        }),
      }
    );
  }

  loadReports();
}
  async function deleteTask(id) {
    if (!confirm("Удалить задание?")) {
      return;
    }

    await supabase
      .from("tasks")
      .delete()
      .eq("id", id);

    loadTasks();
  }
  async function saveTask() {

  const { error } = await supabase
    .from("tasks")
    .update({
      title: editingTask.title,
      description:
        editingTask.description,
      reward: Number(
        editingTask.reward
      ),
      level: Number(
        editingTask.level
      ),
    })
    .eq("id", editingTask.id);

  if (error) {
    alert(error.message);
    return;
  }

  alert("Задание обновлено");

  setEditingTask(null);

  loadTasks();
}
async function approveReport(
  report
) {
  if (user.telegram_id) {
  await fetch(
    "/api/send-user-notification",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        telegramId:
          user.telegram_id,
        text: `🎉 Ваш отчёт проверен

Начислено:
${task.reward} ₽

Баланс пополнен.`,
      }),
    }
  );
}

  const { data: task } =
    await supabase
      .from("tasks")
      .select("*")
      .eq(
        "id",
        report.task_id
      )
      .single();

  const { data: user } =
    await supabase
      .from("users")
      .select("*")
      .eq(
        "id",
        report.user_id
      )
      .single();

  const newBalance =
    Number(
      user.balance || 0
    ) +
    Number(
      task.reward || 0
    );

  await supabase
    .from("users")
    .update({
      balance:
        newBalance,
    })
    .eq(
      "id",
      user.id
    );

  await supabase
    .from("task_reports")
    .update({
      status:
        "approved",
    })
    .eq(
      "id",
      report.id
    );

  loadReports();

  alert(
    "Награда начислена"
  );
}

  return (
    <div className="task-card">
      <h1>Админка</h1>

      <div style={{ display: "grid", gap: 10, marginBottom: 20 }}>
        <div>👥 Пользователей: {stats.totalUsers}</div>
        <div>💰 Общий баланс: {stats.totalBalance} ₽</div>
        <div>📨 Заявок: {stats.totalWithdraws}</div>
        <div>⏳ На проверке: {stats.pendingWithdraws}</div>
        <div>🤝 Рефералов: {stats.totalReferrals}</div>
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
          onChange={(e) => setTitle(e.target.value)}
        />

        <br />
        <br />

        <input
          placeholder="Описание"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <br />
        <br />

        <input
          placeholder="Награда"
          value={reward}
          onChange={(e) => setReward(e.target.value)}
        />

        <br />
        <br />

        <select value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="1">Уровень 1</option>
          <option value="2">Уровень 2</option>
          <option value="3">Уровень 3</option>
          <option value="4">Уровень 4</option>
          <option value="5">Уровень 5</option>
        </select>

        <br />
        <br />

        <select value={taskType} onChange={(e) => setTaskType(e.target.value)}>
          <option value="manual_check">Ручная проверка</option>
          <option value="report"> Отчёт</option>
          <option value="telegram_subscribe">Подписка Telegram</option>
          <option value="partner_purchase">Покупка партнера</option>
        </select>

        <br />
        <br />

        <button onClick={createTask}>➕ Создать задание</button>
      </div>

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
          Награда: {task.reward} ₽
          <br />
          Уровень: {task.level}
          <br />
          Статус: {task.is_active ? "🟢 Активно" : "🔴 Скрыто"}
          <br />
          <br />
          
          <button
  onClick={() =>
    setEditingTask(task)
  }
>
  ✏️ Изменить
</button>
          <button onClick={() => toggleTask(task.id, task.is_active)}>
            {task.is_active ? "🔒 Скрыть" : "🔓 Активировать"}
          </button>

          <button
            style={{ marginLeft: 10 }}
            onClick={() => deleteTask(task.id)}
          >
            🗑️ Удалить
          </button>
        </div>
      ))}

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
<h2>
  Отчёты пользователей
</h2>

{reports.map((report) => (
  <div
    key={report.id}
    style={{
      border:
        "1px solid #ddd",
      padding: 10,
      marginBottom: 10,
    }}
  >
    <div>
      Пользователь:
      {report.user_id}
    </div>

    <div>
      Задание:
      {report.task_id}
    </div>

    <div>
      Отчёт:
      {report.report_text}
    </div>

    <div>
      Статус:
      {report.status}
    </div>

    <button
      onClick={() =>
        approveReport(
          report
        )
      }
    >
      ✅ Одобрить
    </button>

    <button
      onClick={() =>
        rejectReport(
          report.id
        )
      }
    >
      ❌ Отклонить
    </button>
  </div>
))}


      <h2>Заявки на вывод</h2>
      {editingTask && (
  <div
    style={{
      border: "2px solid #4caf50",
      padding: 15,
      marginBottom: 20,
      borderRadius: 12,
    }}
  >
    <h3>
      Редактирование задания
    </h3>

    <input
      value={editingTask.title}
      onChange={(e) =>
        setEditingTask({
          ...editingTask,
          title:
            e.target.value,
        })
      }
    />

    <br />
    <br />

    <input
      value={
        editingTask.description
      }
      onChange={(e) =>
        setEditingTask({
          ...editingTask,
          description:
            e.target.value,
        })
      }
    />

    <br />
    <br />

    <input
      value={editingTask.reward}
      onChange={(e) =>
        setEditingTask({
          ...editingTask,
          reward:
            e.target.value,
        })
      }
    />

    <br />
    <br />

    <select
      value={editingTask.level}
      onChange={(e) =>
        setEditingTask({
          ...editingTask,
          level:
            e.target.value,
        })
      }
    >
      <option value="1">
        Уровень 1
      </option>
      <option value="2">
        Уровень 2
      </option>
      <option value="3">
        Уровень 3
      </option>
      <option value="4">
        Уровень 4
      </option>
      <option value="5">
        Уровень 5
      </option>
    </select>

    <br />
    <br />

    <button
      onClick={saveTask}
    >
      💾 Сохранить
    </button>

    <button
      style={{
        marginLeft: 10,
      }}
      onClick={() =>
        setEditingTask(null)
      }
    >
      ❌ Отмена
    </button>
  </div>
)}

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

          <button onClick={() => approveWithdraw(item.id)}>✅ Одобрить</button>

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