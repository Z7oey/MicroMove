import type { AbandonedSession, CompletedSession, Preferences } from "./types";
import { exerciseCategories, type ExerciseCategory } from "./data/exercises";

const PREFERENCES_KEY = "microMovement.preferences";
const SESSIONS_KEY = "microMovement.sessions";
const ABANDONED_SESSIONS_KEY = "microMovement.abandonedSessions";
const LEARNED_EXERCISE_IDS_KEY = "learnedExerciseIds";
const MIN_SESSION_DURATION_SEC = 30;
const MAX_SESSION_DURATION_SEC = 180;

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function loadPreferences(): Preferences | null {
  const preferences = readJson<Preferences | null>(PREFERENCES_KEY, null);
  if (!preferences) return null;
  const sessionDurationSec = Math.min(
    MAX_SESSION_DURATION_SEC,
    Math.max(
      MIN_SESSION_DURATION_SEC,
      preferences.sessionDurationSec ?? Math.round(preferences.durationMin * 60)
    )
  );
  const migratedTargetAreas = (preferences.targetAreas as string[]).flatMap((area) =>
    area === "背部与腰部" ? ["上背", "腰背"] : [area]
  );
  const targetAreas = Array.from(new Set(migratedTargetAreas)).filter(
    (area): area is ExerciseCategory => exerciseCategories.includes(area as ExerciseCategory)
  );
  return {
    ...preferences,
    durationMin: sessionDurationSec / 60,
    sessionDurationSec,
    targetAreas: targetAreas.length ? targetAreas : ["肩颈"],
    reminderFrequency:
      preferences.reminderFrequency === "每45分钟"
        ? "60分钟后"
        : preferences.reminderFrequency === "每60分钟"
          ? "60分钟后"
          : preferences.reminderFrequency === "每90分钟"
            ? "90分钟后"
            : preferences.reminderFrequency === "暂不提醒"
              ? "暂不设置"
              : preferences.reminderFrequency
  };
}

export function savePreferences(preferences: Preferences) {
  window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
}

export function loadSessions(): CompletedSession[] {
  return readJson<CompletedSession[]>(SESSIONS_KEY, []);
}

export function saveSessions(sessions: CompletedSession[]) {
  window.localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function appendSession(session: CompletedSession): CompletedSession[] {
  const next = [session, ...loadSessions()];
  saveSessions(next);
  return next;
}

export function loadAbandonedSessions(): AbandonedSession[] {
  return readJson<AbandonedSession[]>(ABANDONED_SESSIONS_KEY, []);
}

export function saveAbandonedSessions(sessions: AbandonedSession[]) {
  window.localStorage.setItem(ABANDONED_SESSIONS_KEY, JSON.stringify(sessions));
}

export function appendAbandonedSession(session: AbandonedSession): AbandonedSession[] {
  const next = [session, ...loadAbandonedSessions()];
  saveAbandonedSessions(next);
  return next;
}

export function loadLearnedExerciseIds(): string[] {
  const ids = readJson<unknown>(LEARNED_EXERCISE_IDS_KEY, []);
  return Array.isArray(ids) ? ids.filter((id): id is string => typeof id === "string") : [];
}

export function markExerciseLearned(exerciseId: string): string[] {
  const next = Array.from(new Set([...loadLearnedExerciseIds(), exerciseId]));
  window.localStorage.setItem(LEARNED_EXERCISE_IDS_KEY, JSON.stringify(next));
  return next;
}
