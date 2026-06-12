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
  const [reportFile, setReportFile] =
  useState(null);
  const [reportText, setReportText] =
  useState("");
  useEffect(() => {
  console.log("TG:", tg);
  console.log("TG USER:", tg?.initDataUnsafe?.user);
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
  .eq("level", level)
  .eq("is_active", true);

    setTasks(data || []);
  }

  async function loadCurrentUser() {
  
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("auth_id", user.id);

    if (data && data.length > 0) {
      const foundUser = data[0];

     if (tg?.initDataUnsafe?.user?.id) {
  await supabase
    .from("users")
    .update({
      telegram_id:
        tg.initDataUnsafe.user.id,
      username:
        tg.initDataUnsafe.user.username,
    })
    .eq("id", foundUser.id);
}

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
    if (
  task.task_type === "report"
) {
  let screenshotUrl = null;

if (reportFile) {

  const fileName =
    `${Date.now()}-${reportFile.name}`;

  const { error: uploadError } =
    await supabase.storage
      .from("reports")
      .upload(
        fileName,
        reportFile
      );

  if (uploadError) {
    alert(
      uploadError.message
    );
    return;
  }

  const { data } =
    supabase.storage
      .from("reports")
      .getPublicUrl(
        fileName
      );

  screenshotUrl =
    data.publicUrl;
}

  const { error } =
    await supabase
  .from("task_reports")
  .insert({
    user_id: dbUser.id,
    task_id: task.id,
    report_text: reportText,
    screenshot_url:
      screenshotUrl,
    status: "pending",
  });

  if (error) {
    alert(error.message);
    return;
  }

  alert(
    "Отчёт отправлен на проверку"
  );

  setReportText("");

  return;
}
    if (task.task_type === "telegram_subscribe") {

  const telegramId =
    tg?.initDataUnsafe?.user?.id;

  const response = await fetch(
    `https://bonustest.vercel.app/api/check-subscription?telegramId=${telegramId}`
  );

  const result =
    await response.json();

  if (!result.subscribed) {

    window.open(
      "https://t.me/ArtemMill",
      "_blank"
    );

    alert(
      "Сначала подпишитесь на канал"
    );

    return;
  }
}
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
      const { data: currentUser } = await supabase
.from("users")
.select("*")
.eq("id", dbUser.id)
.single();

if (
currentUser?.referrer_id &&
!currentUser?.referral_rewarded
) {

const { data: referrer } = await supabase
.from("users")
.select("*")
.eq(
"telegram_id",
currentUser.referrer_id
)
.single();


console.log(
  "REF CHECK:",
  currentUser?.referrer_id,
  currentUser?.referral_rewarded
);

console.log("CURRENT USER:", currentUser);
console.log("REFERRER:", referrer);
if (referrer) {

const refBalance =
  Number(referrer.balance || 0) + 50;

await supabase
  .from("users")
  .update({
    balance: refBalance,
    referrals_count:
      Number(referrer.referrals_count || 0) + 1,
  })
  .eq("id", referrer.id);

await supabase
  .from("users")
  .update({
    referral_rewarded: true,
  })
  .eq("id", currentUser.id);

alert(
  "Реферальный бонус начислен!"
);


}
}


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
        <div
  style={{
    marginTop: 10,
    fontSize: 12,
    wordBreak: "break-all",
  }}
>
  Реферальная ссылка:

  <br />

  https://t.me/BonusSTest_bot?start=
  {dbUser?.telegram_id}
</div>
<div
  className="task-card"
  style={{ marginTop: 15 }}
>
  <h3>👥 Приглашай друзей</h3>

  <p>
    За каждого активного друга
    получай 50 ₽
  </p>

  <input
    readOnly
    value={`https://t.me/BonusSTest_bot?start=${dbUser?.telegram_id}`}
    style={{
      width: "100%",
      padding: "10px",
      borderRadius: "10px",
      border: "1px solid #ddd",
    }}
  />

  <button
    className="task-btn"
    onClick={() => {
      navigator.clipboard.writeText(
        `https://t.me/BonusSTest_bot?start=${dbUser?.telegram_id}`
      );

      alert("Ссылка скопирована");
    }}
  >
    Скопировать ссылку
  </button>
</div>
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

            {task.task_type === "report" && (
  <textarea

    placeholder="Введите отчёт"
    value={reportText}
    onChange={(e) =>
      setReportText(
        e.target.value
      )
    }
  />
)}
<input
  type="file"
  accept="image/*"
  onChange={(e) =>
    setReportFile(
      e.target.files[0]
    )
  }
/>
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