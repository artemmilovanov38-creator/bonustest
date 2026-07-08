import { useEffect, useState } from "react";
import UsersManager from "../components/admin/UsersManager";
import ContentManager from "../components/admin/ContentManager";
import BannerManager from "../components/admin/BannerManager";
import {
  BarChart3,
  ClipboardCheck,
  CreditCard,
  FileText,
  Megaphone,
  ListTodo,
  Settings,
  Users,
} from "lucide-react";

import TaskManager from "../components/admin/TaskManager";

import {
  approveUserTask,
  approveWithdrawRequest,
  getAdminStats,
  getAdminAnalytics,
  getPendingUserTasks,
  getWithdrawRequestsForAdmin,
  rejectUserTask,
  rejectWithdrawRequest,
} from "../services/adminService";

const adminTabs = [
  { id: "content", label: "Контент", icon: FileText },
  { id: "banners", label: "Баннеры", icon: Megaphone },
  { id: "dashboard", label: "Дашборд", icon: BarChart3 },
  { id: "review", label: "Проверка", icon: ClipboardCheck },
  { id: "withdraws", label: "Выплаты", icon: CreditCard },
  { id: "tasks", label: "Задания", icon: ListTodo },
  { id: "users", label: "Пользователи", icon: Users },
  { id: "settings", label: "Настройки", icon: Settings },
];

export default function Admin({ user, showToast }) {
  const [activeAdminTab, setActiveAdminTab] = useState("dashboard");

  const [stats, setStats] = useState({
    usersCount: 0,
    tasksCount: 0,
    pendingCount: 0,
    payoutsCount: 0,
  });
  const [analytics, setAnalytics] = useState({
  newUsersToday: 0,
  approvedTasksToday: 0,
  paidToday: 0,
  bonusesToday: 0,
  achievementsToday: 0,
});

  const [pendingTasks, setPendingTasks] = useState([]);
  const [withdrawRequests, setWithdrawRequests] = useState([]);

  useEffect(() => {
    if (user?.is_admin) {
      loadStats();
    }
  }, [user]);

  async function loadStats() {
    try {
      const data = await getAdminStats();
const pending = await getPendingUserTasks();
const withdraws = await getWithdrawRequestsForAdmin();
const analyticsData = await getAdminAnalytics();

      setStats({
        ...data,
        payoutsCount: withdraws.filter((item) => item.status === "pending").length,
      });

      setPendingTasks(pending);
      setWithdrawRequests(withdraws);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error("Admin stats error:", error);
    }
  }

  async function handleApprove(item) {
  try {
    await approveUserTask(item);
    await loadStats();

    showToast?.({
      type: "success",
      title: "Задание одобрено",
      text: "Баланс пользователя обновлён.",
    });
  } catch (error) {
    showToast?.({
      type: "error",
      title: "Ошибка",
      text: error.message || "Не удалось одобрить задание",
    });
  }
}

  async function handleReject(item) {
  try {
    await rejectUserTask(item);
    await loadStats();

    showToast?.({
      type: "success",
      title: "Задание отклонено",
      text: "Заявка перенесена в отклонённые.",
    });
  } catch (error) {
    showToast?.({
      type: "error",
      title: "Ошибка",
      text: error.message || "Не удалось отклонить задание",
    });
  }
}

  async function handleApproveWithdraw(item) {
  try {
    await approveWithdrawRequest(item);
    await loadStats();

    showToast?.({
      type: "success",
      title: "Выплата подтверждена",
      text: "Заявка отмечена как выплаченная.",
    });
  } catch (error) {
    showToast?.({
      type: "error",
      title: "Ошибка",
      text: error.message || "Не удалось подтвердить выплату",
    });
  }
}

  async function handleRejectWithdraw(item) {
  try {
    await rejectWithdrawRequest(item);
    await loadStats();

    showToast?.({
      type: "success",
      title: "Выплата отклонена",
      text: "Средства возвращены на баланс пользователя.",
    });
  } catch (error) {
    showToast?.({
      type: "error",
      title: "Ошибка",
      text: error.message || "Не удалось отклонить выплату",
    });
  }
}

  if (!user?.is_admin) {
    return (
      <main className="page admin-page">
        <div className="app-card empty-state" style={{ padding: 24 }}>
          <span>🔒</span>
          <h2>Доступ закрыт</h2>
          <p>Этот раздел доступен только администратору.</p>
        </div>
      </main>
    );
  }

  function renderAdminContent() {
    if (activeAdminTab === "tasks") return <TaskManager />;
if (activeAdminTab === "banners") {
  return <BannerManager showToast={showToast} />;
}
    if (activeAdminTab === "review") {
      return (
        <section className="admin-section">
          <div className="section-head">
            <h2>Заявки на проверку</h2>
            <span>{pendingTasks.length}</span>
          </div>

          <div className="admin-review-list">
            {pendingTasks.length === 0 ? (
              <div className="app-card empty-state" style={{ padding: 22 }}>
                <span>✅</span>
                <h2>Пока пусто</h2>
                <p>Новых заявок на проверку нет.</p>
              </div>
            ) : (
              pendingTasks.map((item) => (
                <article className="admin-review-card app-card" key={item.id}>
                  <div className="admin-review-top">
                    <div>
                      <span>@{item.users?.username || "без username"}</span>
                      <h3>{item.users?.first_name || "Пользователь"}</h3>
                    </div>

                    <strong>
                      {Number(item.reward || item.tasks?.reward || 0).toLocaleString("ru-RU")} ₽
                    </strong>
                  </div>

                  <div className="admin-review-task">
                    <small>{item.tasks?.category}</small>
                    <p>{item.tasks?.title}</p>
                  </div>

                  {item.proof_url && (
                    <a className="proof-link" href={item.proof_url} target="_blank" rel="noreferrer">
                      Открыть скриншот
                    </a>
                  )}

                  <div className="admin-review-actions">
                    <button className="approve-btn" onClick={() => handleApprove(item)}>
                      Одобрить
                    </button>
                    <button className="reject-btn" onClick={() => handleReject(item)}>
                      Отклонить
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      );
    }

    if (activeAdminTab === "withdraws") {
      return (
        <section className="admin-section">
          <div className="section-head">
            <h2>Заявки на вывод</h2>
            <span>{withdrawRequests.filter((item) => item.status === "pending").length}</span>
          </div>

          <div className="admin-review-list">
            {withdrawRequests.map((item) => (
              <article className="admin-review-card app-card" key={item.id}>
                <div className="admin-review-top">
                  <div>
                    <span>@{item.user?.username || "без username"}</span>
                    <h3>{item.user?.first_name || "Пользователь"}</h3>
                  </div>

                  <strong>{Number(item.amount).toLocaleString("ru-RU")} ₽</strong>
                </div>

                <div className="admin-review-task">
                  <small>Реквизиты</small>
                  <p>{item.wallet}</p>
                </div>

                <small className={`status-badge ${item.status}`}>
                  {item.status === "pending"
                    ? "На проверке"
                    : item.status === "approved"
                      ? "Выплачено"
                      : "Отклонено"}
                </small>

                {item.status === "pending" && (
                  <div className="admin-review-actions" style={{ marginTop: 12 }}>
                    <button className="approve-btn" onClick={() => handleApproveWithdraw(item)}>
                      Выплачено
                    </button>

                    <button className="reject-btn" onClick={() => handleRejectWithdraw(item)}>
                      Отклонить
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      );
    }

   if (activeAdminTab === "users") {
  return <UsersManager />;
}

if (activeAdminTab === "content") {
  return <ContentManager showToast={showToast} />;
}

    if (activeAdminTab === "settings") {
      return (
        <div className="app-card empty-state" style={{ padding: 24 }}>
          <span>⚙️</span>
          <h2>Настройки</h2>
          <p>Здесь будут настройки проекта, лимиты, тексты и параметры приложения.</p>
        </div>
      );
    }

    return (
  <section className="admin-dashboard">
    <div className="admin-grid">
      <div className="admin-stat app-card">
        <Users />
        <span>Пользователи</span>
        <strong>{stats.usersCount}</strong>
      </div>

      <div className="admin-stat app-card">
        <ListTodo />
        <span>Задания</span>
        <strong>{stats.tasksCount}</strong>
      </div>

      <div className="admin-stat app-card">
        <ClipboardCheck />
        <span>На проверке</span>
        <strong>{stats.pendingCount}</strong>
      </div>

      <div className="admin-stat app-card">
        <CreditCard />
        <span>Выводы</span>
        <strong>{stats.payoutsCount}</strong>
      </div>
    </div>

    <section className="today-analytics app-card">
      <div className="section-head">
        <h2>Сегодня</h2>
      </div>

      <div className="analytics-list">
        <div>
          <span>👥 Новых пользователей</span>
          <strong>{analytics.newUsersToday}</strong>
        </div>

        <div>
          <span>📋 Одобрено заданий</span>
          <strong>{analytics.approvedTasksToday}</strong>
        </div>

        <div>
          <span>💸 Выплачено</span>
          <strong>{Number(analytics.paidToday).toLocaleString("ru-RU")} ₽</strong>
        </div>

        <div>
          <span>🎁 Получили бонус</span>
          <strong>{analytics.bonusesToday}</strong>
        </div>

        <div>
          <span>🏆 Получили достижения</span>
          <strong>{analytics.achievementsToday}</strong>
        </div>
      </div>
    </section>
  </section>
);
  }

  return (
    <main className="page admin-page">
      <section className="admin-hero">
        <span>ADMIN PANEL</span>
        <h1>Управление BONUSTEST</h1>
        <p>Проверка заданий, выплаты, пользователи и настройки платформы.</p>
      </section>

      <section className="admin-control-panel app-card">
        {adminTabs.map((tab) => {
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              className={activeAdminTab === tab.id ? "active" : ""}
              onClick={() => setActiveAdminTab(tab.id)}
            >
              <Icon />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </section>

      {renderAdminContent()}
    </main>
  );
}