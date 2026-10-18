import type {
  AbandonedSession,
  CompletedSession,
  LikedExerciseGroups,
  Preferences,
  RecommendationHistory,
  ReminderSettings,
  SavedMovementGroup
} from "./types";
import { exerciseCategories, type ExerciseCategory } from "./data/exercises";
import { isValidCompletedSession } from "./utils";

const PREFERENCES_KEY = "microMovement.preferences";
const SESSIONS_KEY = "microMovement.sessions";
const ABANDONED_SESSIONS_KEY = "microMovement.abandonedSessions";
const LEARNED_EXERCISE_IDS_KEY = "learnedExerciseIds";
const LIKED_EXERCISE_GROUPS_KEY = "likedExerciseGroupIds";
const RECOMMENDATION_HISTORY_KEY = "microMovement.recommendationHistory";
const REMINDER_SETTINGS_KEY = "microMovement.reminderSettings";
const SAVED_MOVEMENT_GROUPS_KEY = "microMovement.savedMovementGroups";
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
  const storedPreferences = readJson<(Preferences & { reminderFrequency?: unknown }) | null>(PREFERENCES_KEY, null);
  if (!storedPreferences) return null;
  const { reminderFrequency: _legacyReminderFrequency, ...preferences } = storedPreferences;
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
    targetAreas: targetAreas.length ? targetAreas : ["肩颈"]
  };
}

export function savePreferences(preferences: Preferences) {
  window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
}

export function loadSessions(): CompletedSession[] {
  const storedSessions = readJson<(CompletedSession & { source?: unknown })[]>(SESSIONS_KEY, []);
  const normalizedSessions: CompletedSession[] = storedSessions.map((session): CompletedSession => ({
    ...session,
    source: session.source === "exercise_library" ? "exercise_library" : "home_recommendation"
  }));
  const validSessions = normalizedSessions.filter(isValidCompletedSession);
  if (validSessions.length !== storedSessions.length) saveSessions(validSessions);
  return validSessions;
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

export function loadLikedExerciseGroups(): LikedExerciseGroups {
  const liked = readJson<unknown>(LIKED_EXERCISE_GROUPS_KEY, {});
  if (!liked || typeof liked !== "object" || Array.isArray(liked)) return {};
  return Object.fromEntries(
    Object.entries(liked).filter(
      (entry): entry is [string, string] =>
        typeof entry[0] === "string" && typeof entry[1] === "string"
    )
  );
}

export function saveLikedExerciseGroups(liked: LikedExerciseGroups) {
  window.localStorage.setItem(LIKED_EXERCISE_GROUPS_KEY, JSON.stringify(liked));
}

export function loadRecommendationHistory(): RecommendationHistory {
  const history = readJson<unknown>(RECOMMENDATION_HISTORY_KEY, {});
  if (!history || typeof history !== "object" || Array.isArray(history)) return {};
  const candidate = history as RecommendationHistory;
  return {
    lastSessionFirstExerciseId:
      typeof candidate.lastSessionFirstExerciseId === "string"
        ? candidate.lastSessionFirstExerciseId
        : undefined,
    lastSessionExerciseIds: Array.isArray(candidate.lastSessionExerciseIds)
      ? candidate.lastSessionExerciseIds.filter((id): id is string => typeof id === "string")
      : undefined
  };
}

export function saveRecommendationHistory(history: RecommendationHistory) {
  window.localStorage.setItem(RECOMMENDATION_HISTORY_KEY, JSON.stringify(history));
}

export function loadReminderSettings(): ReminderSettings {
  const candidate = readJson<Partial<ReminderSettings>>(REMINDER_SETTINGS_KEY, {});
  return {
    enabled: candidate.enabled === true,
    times: Array.isArray(candidate.times)
      ? candidate.times.filter((time): time is string => typeof time === "string")
      : ["11:00", "16:00"]
  };
}

export function saveReminderSettings(settings: ReminderSettings) {
  window.localStorage.setItem(REMINDER_SETTINGS_KEY, JSON.stringify(settings));
}

export function loadSavedMovementGroups(): SavedMovementGroup[] {
  const groups = readJson<unknown>(SAVED_MOVEMENT_GROUPS_KEY, []);
  if (!Array.isArray(groups)) return [];
  const validGroups = groups.filter((group): group is SavedMovementGroup => {
    if (!group || typeof group !== "object") return false;
    const candidate = group as SavedMovementGroup;
    return Boolean(
      typeof candidate.id === "string" &&
      typeof candidate.name === "string" &&
      typeof candidate.savedAt === "string" &&
      Array.isArray(candidate.exerciseIds) &&
      candidate.exerciseIds.every((id) => typeof id === "string") &&
      Array.isArray(candidate.durations) &&
      candidate.durations.every((duration) => typeof duration === "number") &&
      candidate.exerciseIds.length === candidate.durations.length
    );
  });
  const seenConfigurations = new Set<string>();
  const uniqueGroups = validGroups.filter((group) => {
    const signature = JSON.stringify([group.exerciseIds, group.durations]);
    if (seenConfigurations.has(signature)) return false;
    seenConfigurations.add(signature);
    return true;
  });
  if (uniqueGroups.length !== validGroups.length) {
    window.localStorage.setItem(SAVED_MOVEMENT_GROUPS_KEY, JSON.stringify(uniqueGroups));
  }
  return uniqueGroups;
}

export function saveMovementGroup(group: SavedMovementGroup): SavedMovementGroup[] {
  const next = [group, ...loadSavedMovementGroups().filter((item) => item.id !== group.id)];
  window.localStorage.setItem(SAVED_MOVEMENT_GROUPS_KEY, JSON.stringify(next));
  return next;
}

export function deleteMovementGroup(groupId: string): SavedMovementGroup[] {
  const next = loadSavedMovementGroups().filter((group) => group.id !== groupId);
  window.localStorage.setItem(SAVED_MOVEMENT_GROUPS_KEY, JSON.stringify(next));
  return next;
}
