import { useState } from "react";
import Card from "../ui/Card";

export default function BannerSlider({ banners, navigate }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!banners || banners.length === 0) return null;

  const banner = banners[activeIndex];

  function nextBanner() {
    setActiveIndex((prev) => (prev + 1) % banners.length);
  }

  return (
    <Card className="banner-slider-card fade-up" onClick={nextBanner}>
      <div className="banner-slider-top">
        <span>{banner.icon || "🔥"}</span>

        <div>
          <strong>{banner.title}</strong>
          <p>{banner.description}</p>
        </div>
      </div>

      <button
        onClick={(event) => {
          event.stopPropagation();
          navigate(banner.button_link || "/tasks");
        }}
      >
        {banner.button_text || "Подробнее"}
      </button>

      {banners.length > 1 && (
        <div className="banner-dots">
          {banners.map((item, index) => (
            <span
              key={item.id}
              className={index === activeIndex ? "active" : ""}
            />
          ))}
        </div>
      )}
    </Card>
  );
}