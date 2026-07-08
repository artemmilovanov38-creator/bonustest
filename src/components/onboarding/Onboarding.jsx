import { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Banknote, ShieldCheck, Zap, Rocket } from "lucide-react";
import { getAppContent } from "../../services/contentService";
import { CONTENT } from "../../constants/contentKeys";
import "swiper/css";

export default function Onboarding({ onFinish }) {
  const swiperRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [content, setContent] = useState({});

  useEffect(() => {
    loadContent();
  }, []);

  async function loadContent() {
    try {
      const data = await getAppContent();
      setContent(data);
    } catch (error) {
      console.error("Onboarding content error:", error);
    }
  }

  const slides = [
    {
      icon: Banknote,
      title: content[CONTENT.ONBOARDING.SLIDE1_TITLE] || "Начни зарабатывать",
      text:
        content[CONTENT.ONBOARDING.SLIDE1_TEXT] ||
        "Выполняй простые задания и получай реальные деньги уже сегодня.",
    },
    {
      icon: ShieldCheck,
      title: content[CONTENT.ONBOARDING.SLIDE2_TITLE] || "Безопасно",
      text:
        content[CONTENT.ONBOARDING.SLIDE2_TEXT] ||
        "Все задания проверяются вручную, а выплаты проходят через модерацию.",
    },
    {
      icon: Zap,
      title: content[CONTENT.ONBOARDING.SLIDE3_TITLE] || "Быстро",
      text:
        content[CONTENT.ONBOARDING.SLIDE3_TEXT] ||
        "Большинство заданий занимает всего несколько минут.",
    },
    {
      icon: Rocket,
      title: content[CONTENT.ONBOARDING.SLIDE4_TITLE] || "Готов начать?",
      text:
        content[CONTENT.ONBOARDING.SLIDE4_TEXT] ||
        "Переходи в приложение и выбирай первое задание.",
    },
  ];

  const isLast = activeIndex === slides.length - 1;

  function handleMainButton() {
    if (isLast) {
      onFinish();
      return;
    }

    swiperRef.current?.slideNext();
  }

  return (
    <div className="onboarding">
      <Swiper
        spaceBetween={20}
        slidesPerView={1}
        allowTouchMove={true}
        simulateTouch={true}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        onSlideChange={(swiper) => {
          setActiveIndex(swiper.activeIndex);
        }}
      >
        {slides.map((slide, index) => {
          const Icon = slide.icon;

          return (
            <SwiperSlide key={index}>
              <div className="onboarding-card animate-fade-up">
                <div className="onboarding-top">
                  <span className="onboarding-brand">BONUSTEST</span>
                  <span className="onboarding-step">
                    {index + 1}/{slides.length}
                  </span>
                </div>

                <div className="onboarding-content">
                  <div className="onboarding-visual">
                    <Icon />
                  </div>

                  <h1>{slide.title}</h1>
                  <p>{slide.text}</p>
                </div>

                <div className="onboarding-actions">
                  <div className="onboarding-dots">
                    {slides.map((_, dotIndex) => (
                      <span
                        key={dotIndex}
                        className={
                          dotIndex === activeIndex
                            ? "onboarding-dot active"
                            : "onboarding-dot"
                        }
                      />
                    ))}
                  </div>

                  <button className="primary-btn" onClick={handleMainButton}>
                    {isLast ? "Начать" : "Далее →"}
                  </button>

                  {!isLast && (
                    <button className="secondary-btn" onClick={onFinish}>
                      Пропустить
                    </button>
                  )}
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}