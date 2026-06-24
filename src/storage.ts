import type { AbandonedSession, CompletedSession, Preferences } from "./types";

const PREFERENCES_KEY = "microMovement.preferences";
const SESSIONS_KEY = "microMovement.sessions";
const ABANDONED_SESSIONS_KEY = "microMovement.abandonedSessions";
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
  return {
    ...preferences,
    durationMin: sessionDurationSec / 60,
    sessionDurationSec,
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
