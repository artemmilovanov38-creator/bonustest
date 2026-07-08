import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getUnreadNotificationsCount } from "../../services/notificationService";

export default function HomeHeader({ user }) {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user?.id) {
      loadUnreadCount();
    }
  }, [user]);

  async function loadUnreadCount() {
    try {
      const count = await getUnreadNotificationsCount(user.id);
      setUnreadCount(count);
    } catch (error) {
      console.error("Unread notifications error:", error);
    }
  }

  function getGreeting() {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) return { emoji: "☀️", text: "Доброе утро" };
    if (hour >= 12 && hour < 18) return { emoji: "🌤️", text: "Добрый день" };
    if (hour >= 18 && hour < 23) return { emoji: "🌇", text: "Добрый вечер" };

    return { emoji: "🌙", text: "Доброй ночи" };
  }

  const greeting = getGreeting();

  return (
    <header className="home-header-premium">
      <div>
        <span className="greeting">
          {greeting.emoji} {greeting.text}
        </span>

        <h1>{user?.first_name}</h1>
      </div>

      <button
        className="notification-btn"
        onClick={() => navigate("/notifications")}
      >
        <Bell />

        {unreadCount > 0 && (
          <span className="notification-count">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
    </header>
  );
}