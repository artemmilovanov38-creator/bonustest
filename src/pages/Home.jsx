import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Flame, Sparkles } from "lucide-react";
import { CONTENT } from "../constants/contentKeys";

import HomeHeader from "../components/home/HomeHeader";
import QuickActions from "../components/home/QuickActions";
import HomeSkeleton from "../components/home/HomeSkeleton";
import BannerSlider from "../components/home/BannerSlider";
import { getAppContent } from "../services/contentService";

import { getActiveBanners } from "../services/bannerService";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Progress from "../components/ui/Progress";
import SectionTitle from "../components/ui/SectionTitle";

import useCountUp from "../hooks/useCountUp";
import { getActiveTasks, getHotTask } from "../services/taskService";

export default function Home({ user }) {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [hotTask, setHotTask] = useState(null);
  const [loadingHome, setLoadingHome] = useState(true);
  const [content, setContent] = useState({});
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    loadHomeData();
  }, []);

  async function loadHomeData() {
  try {
    setLoadingHome(true);

    const activeTasks = await getActiveTasks();
    const hot = await getHotTask();
    const appContent = await getAppContent();
    const activeBanners = await getActiveBanners();

    setTasks(activeTasks);
    setHotTask(hot);
    setContent(appContent);
    setBanners(activeBanners);
  } catch (error) {
    console.error("Home data error:", error);
  } finally {
    setLoadingHome(false);
  }
}

  const totalToday = tasks.reduce(
    (sum, task) => sum + Number(task.reward || 0),
    0
  );

  const balance = Number(user?.balance || 0);
  const levelProgress = Math.min(100, Math.round((balance / 10000) * 100));

  const animatedToday = useCountUp(totalToday);
  const animatedBalance = useCountUp(balance);

  if (loadingHome) {
    return <HomeSkeleton />;
  }

  return (
    <main className="page home-page premium-home">
      <HomeHeader user={user} />
      <BannerSlider banners={banners} navigate={navigate} />

      <Card className="earning-hero-card fade-up">
        <div className="earning-glow"></div>

        <div className="earning-icon">
          <Sparkles />
        </div>

        <span>Сегодня можно заработать</span>
        <h1>{animatedToday.toLocaleString("ru-RU")} ₽</h1>
        <p>Доступно заданий: {tasks.length}</p>

        <Button onClick={() => navigate("/tasks")}>
          {content[CONTENT.HOME.HERO_BUTTON] || "Смотреть задания"} <ArrowRight />
        </Button>
      </Card>

      <Card className="premium-balance-card new-balance-card fade-up delay-1">
        <div className="balance-card-header">
          <div>
            <span>{content[CONTENT.HOME.BALANCE_TITLE] || "Ваш баланс"}</span>
            <h2>{animatedBalance.toLocaleString("ru-RU")} ₽</h2>
          </div>

          <button onClick={() => navigate("/wallet")}>Вывести</button>
        </div>

        <div className="balance-info-grid">
          <div>
            <span>Сегодня</span>
            <strong>+0 ₽</strong>
          </div>

          <div>
            <span>Всего заработано</span>
            <strong>{animatedBalance.toLocaleString("ru-RU")} ₽</strong>
          </div>
        </div>

        <div className="level-box">
          <div>
            <span>До уровня Профи</span>
            <strong>{levelProgress}%</strong>
          </div>

          <Progress value={levelProgress} />
        </div>
      </Card>

      {hotTask && (
        <Card className="hot-home-card fade-up delay-2">
          <div className="hot-home-top">
            <div>
              <span>🔥 Горячее задание</span>
              <h2>{hotTask.title}</h2>
            </div>

            <div className="hot-home-icon">
              <Flame />
            </div>
          </div>

          <p>{hotTask.short_description || hotTask.description}</p>

          <div className="hot-home-bottom">
            <strong>
              +{Number(hotTask.reward || 0).toLocaleString("ru-RU")} ₽
            </strong>

            <button onClick={() => navigate(`/tasks/${hotTask.id}`)}>
              Выполнить
            </button>
          </div>
        </Card>
      )}

      <SectionTitle title="Быстрые действия" />

      <div className="fade-up delay-3">
        <QuickActions navigate={navigate} />
      </div>

      <SectionTitle
        title="Новые задания"
        action={
          <button className="section-action" onClick={() => navigate("/tasks")}>
            Все
          </button>
        }
      />

      <div className="task-preview-list fade-up delay-4">
        {tasks.slice(0, 3).map((task) => (
          <Card
            className="task-preview-card"
            key={task.id}
            onClick={() => navigate(`/tasks/${task.id}`)}
          >
            <div>
              <span>{task.category}</span>
              <h3>{task.title}</h3>
            </div>

            <strong>
              {Number(task.reward).toLocaleString("ru-RU")} ₽
            </strong>
          </Card>
        ))}
      </div>
    </main>
  );
}