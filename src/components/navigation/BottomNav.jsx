import { Home, ClipboardList, Wallet, Users, User, Shield } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const navItems = [
  { path: "/", label: "Главная", icon: Home },
  { path: "/tasks", label: "Задания", icon: ClipboardList },
  { path: "/wallet", label: "Кошелёк", icon: Wallet },
  { path: "/refs", label: "Рефы", icon: Users },
  { path: "/profile", label: "Профиль", icon: User },
  { path: "/admin", label: "Admin", icon: Shield, adminOnly: true },
];

export default function BottomNav({ user }) {
  const location = useLocation();
  const navigate = useNavigate();
  const visibleNavItems = navItems.filter((item) => !item.adminOnly || ["manager", "admin", "owner"].includes(user?.role));

  return (
    <nav className="bottom-nav premium-nav">
      {visibleNavItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.path === "/"
            ? location.pathname === "/"
            : location.pathname.startsWith(item.path);

        return (
          <button
            key={item.path}
            className={isActive ? "premium-nav-item active" : "premium-nav-item"}
            onClick={() => navigate(item.path)}
          >
            <span className="premium-nav-glow"></span>
            <Icon />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}