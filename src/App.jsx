import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";

import Toast from "./components/common/Toast";

import Notifications from "./pages/Notifications";

import { getTelegramUser, initTelegramApp } from "./lib/telegram";
import { loginOrCreateTelegramUser } from "./services/userService";

import Home from "./pages/Home";
import Tasks from "./pages/Tasks";
import Wallet from "./pages/Wallet";
import Refs from "./pages/Refs";
import Profile from "./pages/Profile";

import Onboarding from "./components/onboarding/Onboarding";
import BottomNav from "./components/navigation/BottomNav";
import Skeleton from "./components/common/Skeleton";
import TaskDetails from "./pages/TaskDetails";

import Admin from "./pages/Admin";

import "./index.css";

function parseStartParam() {
  const fromTelegram = window.Telegram?.WebApp?.initDataUnsafe?.start_param;
  const fromUrl = new URLSearchParams(window.location.search).get("start");

  return fromTelegram || fromUrl || null;
}

window.addEventListener("error", (event) => {
  alert(event.message);
});
export default function App() {
  const [appUser, setAppUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [toast, setToast] = useState(null);

function showToast(data) {
  setToast(data);

  setTimeout(() => {
    setToast(null);
  }, 3000);
}

  useEffect(() => {
    initTelegramApp();
    startApp();
  }, []);

  async function startApp() {
    setLoading(true);
    setError("");

    try {
      const telegramUser = getTelegramUser();

      if (!telegramUser) {
        setError("Открой приложение через Telegram, чтобы войти автоматически.");
        setLoading(false);
        return;
      }

      const startParam = parseStartParam();

      const referrerId =
        startParam && Number(startParam) !== telegramUser.telegram_id
          ? Number(startParam)
          : null;

      const user = await loginOrCreateTelegramUser(telegramUser, referrerId);

      setAppUser(user);

      const onboardingPassed = localStorage.getItem("onboarding_passed");

      if (!onboardingPassed) {
        setShowOnboarding(true);
      }
    } catch (err) {
      console.error("Start app error:", err);
      setError(err.message || "Неизвестная ошибка запуска приложения");
    } finally {
      setLoading(false);
    }
  }

  function finishOnboarding() {
    localStorage.setItem("onboarding_passed", "true");
    setShowOnboarding(false);
  }

  if (loading) {
    return (
      <div className="app-shell">
        <Skeleton type="home" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-shell center-screen">
        <div className="glass-card empty-state">
          <span>⚠️</span>
          <h2>Не получилось войти</h2>
          <p>{error}</p>

          <button className="primary-btn" onClick={startApp}>
            Повторить
          </button>
        </div>
      </div>
    );
  }

  if (appUser?.is_blocked) {
    return (
      <div className="app-shell center-screen">
        <div className="glass-card empty-state">
          <span>🔒</span>
          <h2>Аккаунт заблокирован</h2>
          <p>Обратись в поддержку, если считаешь, что это ошибка.</p>
        </div>
      </div>
    );
  }

  if (showOnboarding) {
    return (
      <div className="app-shell">
        <Onboarding onFinish={finishOnboarding} />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <Routes>
  <Route path="/" element={<Home user={appUser} />} />
  <Route path="/tasks" element={<Tasks user={appUser} />} />
  <Route path="/tasks/:id" element={<TaskDetails user={appUser} />} />
  <Route path="/wallet" element={<Wallet user={appUser} showToast={showToast} />} />
  <Route path="/refs" element={<Refs user={appUser} />} />
  <Route path="/profile" element={<Profile user={appUser} />} />
  <Route path="/notifications" element={<Notifications user={appUser} />} />
  <Route path="/admin" element={<Admin user={appUser} showToast={showToast} />} />
</Routes>


      <BottomNav user={appUser} />
    </div>
  );
}