"use client";

import { useState } from "react";
import styles from "./page.module.css";

const YANDEX_REVIEW_URL = "https://yandex.ru/maps/?from=feedback-widget";

export default function Home() {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const activeRating = hovered || rating;
  const showReviewForm = rating > 0 && rating < 4;
  const showYandexCta = rating === 5;

  const caption = rating
    ? `Ваша оценка: ${rating} ${rating === 1 ? "звезда" : rating < 5 ? "звезды" : "звёзд"}`
    : "Выберите количество звёзд";

  const handleRatingSelect = (value) => {
    setRating(value);
    setHovered(0);
    setSubmitted(false);
    if (value >= 4) {
      setFeedback("");
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!showReviewForm) return;
    setSubmitted(true);
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
          <h1>Как вам опыт работы с нами?</h1>
          <p>
            Поставьте оценку. Если меньше четырёх звёзд — поделитесь, что улучшить. При пяти звёздах
            направим вас оставить публичный отзыв в Яндекс Картах.
          </p>
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
              {rating > 0 && rating < 4 && "Расскажите, что исправить. Мы реагируем быстро."}
              {rating === 4 &&
                "Спасибо за оценку! Можете уточнить детали или поставить 5, чтобы перейти в Яндекс Карты."}
              {rating === 5 && "Отлично! Можно сразу перейти к публичному отзыву на Яндекс Картах."}
            </p>
          </div>
        </section>

        {showReviewForm && (
          <form className={styles.form} onSubmit={handleSubmit}>
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
              <button type="submit" className={styles.primaryButton}>
                Отправить отзыв
              </button>
              {submitted && (
                <span className={styles.success}>
                  Спасибо! Мы получили ваш отзыв и скоро вернёмся с ответом.
                </span>
              )}
            </div>
          </form>
        )}

        {showYandexCta && (
          <div className={styles.external}>
            <p>
              Спасибо за 5 звёзд! Нажмите на кнопку ниже, чтобы оставить отзыв на Яндекс Картах — это
              поможет другим узнать о нашем сервисе.
            </p>
            <a
              className={styles.linkButton}
              href={YANDEX_REVIEW_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Перейти к отзыву на Яндекс Картах
            </a>
          </div>
        )}
      </main>
    </div>
  );
}
