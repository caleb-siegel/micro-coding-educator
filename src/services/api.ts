import type { Lesson, LessonCard, Topic, Difficulty } from '../types/lesson';
import { getInitialPracticeSession, getFallbackNextCards } from '../data/lessons';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function startPracticeSession(
  topic: Topic,
  difficulty: Difficulty
): Promise<Lesson> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    console.log(`[API Client] Starting practice session for topic: '${topic}' (${difficulty})...`);
    const response = await fetch(`${API_BASE}/api/start-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic,
        difficulty,
        count: 3,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && data.cards && data.cards.length > 0) {
        console.log(`[API Client] Received live practice session '${data.title}' from backend.`);
        return data as Lesson;
      }
    }
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.warn('[API Client] Backend start-session unreachable/timed out. Using client practice session.', err);
  }

  // Fallback to client generator
  return getInitialPracticeSession(topic, difficulty);
}

export async function fetchMoreCards(
  topic: Topic,
  difficulty: Difficulty,
  seenTitles: string[] = []
): Promise<LessonCard[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    console.log(`[API Client] Background pre-fetching next cards for topic: '${topic}'...`);
    const response = await fetch(`${API_BASE}/api/generate-cards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic,
        difficulty,
        count: 2,
        seenTitles,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && data.cards && data.cards.length > 0) {
        console.log(`[API Client] Received ${data.cards.length} new background cards.`);
        return data.cards as LessonCard[];
      }
    }
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.warn('[API Client] Background generate-cards failed. Utilizing client fallback cards.', err);
  }

  return getFallbackNextCards(topic, difficulty, 2);
}

export async function fetchOrCreateLesson(
  topic: Topic,
  _durationMinutes: number,
  difficulty: Difficulty
): Promise<Lesson> {
  return startPracticeSession(topic, difficulty);
}

export async function askCardChat(
  lessonTopic: string,
  difficulty: string,
  cardContext: LessonCard,
  messages: ChatMessage[],
  userPrompt: string
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 35000);

  try {
    const response = await fetch(`${API_BASE}/api/card-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lessonTopic,
        difficulty,
        cardContext,
        messages,
        userPrompt,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data && data.reply) {
        return data.reply;
      }
      throw new Error("Received empty reply from AI chat service.");
    }

    let errorDetail = `AI Chat request failed with HTTP ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson.detail) {
        errorDetail = errJson.detail;
      }
    } catch {
      // payload not JSON
    }
    throw new Error(errorDetail);

  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error("AI Chat request timed out. Please try asking again.");
    }
    throw new Error(err.message || "Failed to reach AI Chat Backend Service.");
  }
}
