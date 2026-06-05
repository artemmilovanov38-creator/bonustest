import Admin from "./Admin";
import Withdraw from "./Withdraw";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import "./Dashboard.css";
import { tg } from "../lib/telegram";

export default function Dashboard({ user }) {
  const [tasks, setTasks] = useState([]);
  const [dbUser, setDbUser] = useState(null);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [showWithdraw, setShowWithdraw] = useState(false);
  useEffect(() => {
  console.log("TG:", tg);
  console.log("TG USER:", tg?.initDataUnsafe?.user);

 alert(
  JSON.stringify(
    window.Telegram?.WebApp
  )
);
}, []);
  const isAdmin =
  user.email === "milovanovartem08@mail.ru";
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    loadTasks(currentLevel);
  }, [currentLevel]);

  async function loadTasks(level) {
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("level", level);

    setTasks(data || []);
  }

  async function loadCurrentUser() {
    alert("AUTH ID = " + user.id);
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("auth_id", user.id);

    if (data && data.length > 0) {
      const foundUser = data[0];

      setDbUser(foundUser);
      await loadCompletedTasks(foundUser.id);
      await calculateLevel(foundUser.id);
    }
  }

  async function loadCompletedTasks(userId) {
    const { data } = await supabase
      .from("user_tasks")
      .select("task_id")
      .eq("user_id", userId);

    setCompletedTasks(data ? data.map((item) => item.task_id) : []);
  }

  async function calculateLevel(userId) {
    const { data } = await supabase
      .from("user_tasks")
      .select("*")
      .eq("user_id", userId);

    const completedCount = data?.length || 0;
    const level = Math.floor(completedCount / 3) + 1;

    setCurrentLevel(level);
  }

  async function completeTask(task) {
    if (!dbUser) {
      alert("Пользователь не найден");
      return;
    }

    const { data: existing } = await supabase
      .from("user_tasks")
      .select("*")
      .eq("user_id", dbUser.id)
      .eq("task_id", task.id);

    if (existing && existing.length > 0) {
      alert("Задание уже выполнено");
      return;
    }

    const { error } = await supabase.from("user_tasks").insert({
      user_id: dbUser.id,
      task_id: task.id,
      completed: true,
      reward: task.reward,
      rewarded: false,
    });

    if (error) {
      alert(error.message);
      return;
    }

    const newBalance = Number(dbUser.balance || 0) + Number(task.reward);

    await supabase
      .from("users")
      .update({ balance: newBalance })
      .eq("id", dbUser.id);

    const updatedUser = {
      ...dbUser,
      balance: newBalance,
    };

    setDbUser(updatedUser);

    await loadCompletedTasks(dbUser.id);
    await calculateLevel(dbUser.id);

    alert(`Получено ${task.reward} ₽`);
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.reload();
  }

  const visibleTasks = tasks.filter(
    (task) => !completedTasks.includes(task.id)
  );

  return (
    <div className="app">
      <div className="top">
        <div>
          <div className="logo">BONUSTEST</div>
          <div className="welcome">Привет, {user.email}</div>
        </div>

        <div className="avatar">B</div>
      </div>

      <div className="balance-card">
        <span>Баланс</span>
        <h1>{dbUser?.balance || 0} ₽</h1>
      </div>
      <div style={{ color: "red" }}>
  Telegram ID:
  {tg?.initDataUnsafe?.user?.id}
</div>

<div style={{ color: "red" }}>
  Username:
  {tg?.initDataUnsafe?.user?.username}
</div>

     <div className="actions">
     {isAdmin && (
  <button
    className="action-btn"
    onClick={() =>
      setShowAdmin(!showAdmin)
    }
    
  >
    ⚙️ Админка
  </button>
)}
{showAdmin && (
  <Admin />
)}
  <button className="action-btn">
    💰 Заработать
  </button>

  <button
    className="action-btn"
    onClick={() =>
      setShowWithdraw(!showWithdraw)
    }
  >
    💳 Вывести
  </button>
</div>

{showWithdraw && dbUser && (
  <Withdraw userId={dbUser.id} />
)}

<h2 className="section-title">
  Задания уровня {currentLevel}
</h2>

      {visibleTasks.length === 0 ? (
        <div className="task-card">
          <h3>Заданий пока нет</h3>
          <p>Добавь задания следующего уровня в Supabase.</p>
        </div>
      ) : (
        visibleTasks.map((task) => (
          <div className="task-card" key={task.id}>
            <div>
              <h3>{task.title}</h3>
              <p>{task.description}</p>
            </div>

            <div className="reward">+{task.reward} ₽</div>

            <button className="task-btn" onClick={() => completeTask(task)}>
              Выполнить
            </button>
          </div>
        ))
      )}

      <button className="logout-btn" onClick={logout}>
        Выйти
      </button>
    </div>
  );
}