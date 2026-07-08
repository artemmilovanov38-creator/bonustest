import { useEffect, useState } from "react";
import Card from "../ui/Card";
import Progress from "../ui/Progress";
import { getUserAchievementsView } from "../../services/achievementService";

export default function AchievementsBlock({ user }) {
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    if (user?.id) {
      loadAchievements();
    }
  }, [user]);

  async function loadAchievements() {
    try {
      const data = await getUserAchievementsView(user.id);
      setAchievements(data);
    } catch (error) {
      console.error("Achievements error:", error);
    }
  }

  return (
    <section className="achievements-block">
      <div className="section-head">
        <h2>Достижения</h2>
        <span>{achievements.filter((item) => item.unlocked).length}</span>
      </div>

      <div className="achievements-list">
        {achievements.map((item) => (
          <Card
            key={item.id}
            className={item.unlocked ? "achievement-card unlocked" : "achievement-card"}
          >
            <div className="achievement-icon">{item.icon}</div>

            <div className="achievement-content">
              <div className="achievement-top">
                <h3>{item.title}</h3>
                <span>{item.unlocked ? "Получено" : `+${item.reward} ₽`}</span>
              </div>

              <p>{item.description}</p>

              <div className="achievement-progress-row">
                <small>
                  {item.current} / {item.requirement}
                </small>
                <small>{item.progress}%</small>
              </div>

              <Progress value={item.progress} />
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}