"use client";

import { useState } from "react";
import styles from "./page.module.css";

const YANDEX_REVIEW_URL = "https://yandex.ru/maps/?from=feedback-widget";
const YANDEX_IFRAME_SRC =
  "https://yandex.ru/sprav/widget/rating-badge/1736307653?type=award&theme=dark";

export default function Home() {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const activeRating = hovered || rating;
  const showReviewForm = rating > 0 && rating < 5;
  const showYandexCta = rating === 5;

  const caption = rating
    ? `Ваша оценка: ${rating} ${rating === 1 ? "звезда" : rating < 5 ? "звезды" : "звёзд"}`
    : "Выберите количество звёзд";

  const handleRatingSelect = (value) => {
    setRating(value);
    setHovered(0);
    setSubmitted(false);
    setError("");
    if (value === 5) {
      setFeedback("");
    }
  };

  const submitReview = async ({ ratingValue, feedbackText }) => {
    setIsSubmitting(true);
    setError("");

    try {
      const metadata =
        typeof window !== "undefined"
          ? {
              userAgent: navigator.userAgent,
              language: navigator.language,
              referer: document.referrer,
              pageUrl: window.location.href,
            }
          : {};

      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: ratingValue,
          feedback: feedbackText,
          metadata,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Не удалось отправить отзыв.");
      }

      setSubmitted(true);
      return true;
    } catch (err) {
      console.error(err);
      setError(err.message || "Не удалось отправить отзыв. Попробуйте снова.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!showReviewForm) return;

    await submitReview({ ratingValue: rating, feedbackText: feedback });
  };

  const handleYandexClick = async () => {
    await submitReview({ ratingValue: 5, feedbackText: "" });
    window.open(YANDEX_REVIEW_URL, "_blank", "noopener,noreferrer");
  };

  const starButtonClasses = (isActive, isSelected) =>
    [styles.starButton, isActive ? styles.active : "", isSelected ? styles.selected : ""]
      .filter(Boolean)
      .join(" ");

  return (
    <div className={styles.page}>
      <main className={styles.card}>
        <div className={styles.header}>
          <span className={styles.badge}>Оценка до 5 звезд</span>
          <h1>Нам важно ваше мнение.</h1>
          <p>Если вам понравилось у нас, будем рады вашему отзыву — он помогает нам становиться лучше.</p>
        </div>

        <section className={styles.ratingBlock} aria-label="Форма оценки сервиса">
          <div className={styles.stars} role="radiogroup" aria-live="polite">
            {[1, 2, 3, 4, 5].map((value) => {
              const isActive = value <= activeRating;
              const isSelected = value === rating;

              return (
                <button
                  key={value}
                  type="button"
                  className={starButtonClasses(isActive, isSelected)}
                  aria-label={`${value} ${value === 1 ? "звезда" : value < 5 ? "звезды" : "звёзд"}`}
                  aria-pressed={isSelected}
                  onMouseEnter={() => setHovered(value)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => handleRatingSelect(value)}
                >
                  <svg viewBox="0 0 24 24" className={styles.starIcon} aria-hidden="true">
                    <path d="M12 3.5 14.85 9l6.15.9-4.45 4.34 1.05 6.09L12 17.9l-5.6 3.43 1.05-6.09L3 9.9 9.15 9 12 3.5Z" />
                  </svg>
                  <span className={styles.starValue}>{value}</span>
                </button>
              );
            })}
          </div>
          <div className={styles.ratingCopy}>
            <p className={styles.caption}>{caption}</p>
            <p className={styles.helper}>
              {rating === 0 && "Пять кликов — и всё готово."}
              {rating > 0 &&
                rating < 4 &&
                "Поделитесь, что можно улучшить — мы быстро реагируем и исправляем."}
              {rating === 4 && "Спасибо за 4 звезды! Опишите, что можем сделать лучше."}
              {rating === 5 && "Отлично! Откроем страницу Яндекс Карт для публичного отзыва."}
            </p>
          </div>
        </section>

        {showReviewForm && (
          <form className={styles.form} onSubmit={handleSubmit}>
            <p className={styles.formIntro}>
              Есть идеи или замечания?
              <br />
              Напишите, что можно улучшить. Мы ценим честную обратную связь..
            </p>
            <label className={styles.label} htmlFor="feedback">
              Что нам улучшить?
            </label>
            <textarea
              id="feedback"
              name="feedback"
              className={styles.textarea}
              placeholder="Опишите, что можно сделать лучше. Мы свяжемся, если понадобится уточнить детали."
              value={feedback}
              onChange={(event) => setFeedback(event.target.value)}
              minLength={5}
              required
            />
            <div className={styles.actions}>
              <button type="submit" className={styles.primaryButton} disabled={isSubmitting}>
                {isSubmitting ? "Отправляем..." : "Отправить отзыв"}
              </button>
              {submitted && (
                <span className={styles.success}>
                  Спасибо! Мы получили ваш отзыв и скоро вернёмся с ответом.
                </span>
              )}
              {error && <span className={styles.error}>{error}</span>}
            </div>
          </form>
        )}

        {showYandexCta && (
          <div className={styles.external}>
            <p>
              Спасибо за 5 звёзд! Нажмите на бейдж, чтобы оставить отзыв на Яндекс Картах — это
              поможет другим узнать о нашем сервисе.
            </p>
            <button
              type="button"
              className={styles.yandexEmbed}
              onClick={handleYandexClick}
              disabled={isSubmitting}
              aria-label="Оставить отзыв на Яндекс Картах"
            >
              <iframe
                src={YANDEX_IFRAME_SRC}
                width="150"
                height="50"
                frameBorder="0"
                title="Публичный отзыв в Яндекс Картах"
                aria-hidden="true"
              />
            </button>
            {error && <span className={styles.error}>{error}</span>}
          </div>
        )}
      </main>
    </div>
  );
}
