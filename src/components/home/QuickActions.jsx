import { ClipboardList, TrendingUp, Users, Wallet } from "lucide-react";
import Card from "../ui/Card";

const actions = [
  { title: "Задания", icon: ClipboardList, path: "/tasks" },
  { title: "Вывод", icon: Wallet, path: "/wallet" },
  { title: "Рефералы", icon: Users, path: "/refs" },
  { title: "Прогресс", icon: TrendingUp, path: "/profile" },
];

export default function QuickActions({ navigate }) {
  return (
    <section className="quick-actions">
      {actions.map((item) => {
        const Icon = item.icon;

        return (
          <Card
            key={item.title}
            className="quick-action-card"
            onClick={() => navigate(item.path)}
          >
            <Icon />
            <span>{item.title}</span>
          </Card>
        );
      })}
    </section>
  );
}