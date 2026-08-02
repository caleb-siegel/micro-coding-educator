import type { Lesson, Topic, Difficulty } from '../types/lesson';
import { getLessonByTopicAndDuration } from '../data/lessons';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function fetchOrCreateLesson(
  topic: Topic,
  durationMinutes: number,
  difficulty: Difficulty
): Promise<Lesson> {
  // First check if backend API is reachable for dynamic AI generation
  try {
    const controller = new AbortController();
    // Allow up to 30s for live LLM API generation to stream structured JSON
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    console.log(`[API Client] Requesting AI lesson generation for topic: '${topic}'...`);
    const response = await fetch(`${API_BASE}/api/generate-lesson`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic,
        difficulty,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && data.cards && data.cards.length > 0) {
        console.log(`[API Client] Received live lesson '${data.title}' from backend.`);
        return data as Lesson;
      }
    } else {
      console.warn(`[API Client] Backend returned HTTP ${response.status}.`);
    }
  } catch (err) {
    console.warn('[API Client] Backend API unreachable or timed out; utilizing client fallback data engine.', err);
  }

  // Fallback to local curated lesson data / client generator
  return getLessonByTopicAndDuration(topic, durationMinutes, difficulty);
}
