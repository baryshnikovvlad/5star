import { NextResponse } from "next/server";
import { saveReview } from "@/lib/db";

const BAD_REQUEST = 400;
const SERVER_ERROR = 500;

export async function POST(request) {
  let body = {};

  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ error: "Некорректный JSON" }, { status: BAD_REQUEST });
  }

  const { rating, feedback = "", metadata = {} } = body || {};
  const trimmedFeedback = typeof feedback === "string" ? feedback.trim() : "";

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "Оценка должна быть целым числом от 1 до 5." },
      { status: BAD_REQUEST },
    );
  }

  if (rating < 5 && !trimmedFeedback) {
    return NextResponse.json(
      { error: "Для оценки 4 и ниже добавьте текст отзыва." },
      { status: BAD_REQUEST },
    );
  }

  const ipFromForwarded = request.headers.get("x-forwarded-for");
  const ipAddress =
    ipFromForwarded?.split(",")?.[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    null;

  const payload = {
    rating,
    feedback: trimmedFeedback,
    userAgent: metadata.userAgent || request.headers.get("user-agent"),
    language: metadata.language || request.headers.get("accept-language"),
    referer: metadata.referer || request.headers.get("referer"),
    pageUrl: metadata.pageUrl || null,
    ipAddress,
  };

  try {
    await saveReview(payload);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to save review", error);
    return NextResponse.json({ error: "Не удалось сохранить отзыв" }, { status: SERVER_ERROR });
  }
}
