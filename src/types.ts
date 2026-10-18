import type {
  Exercise,
  ExerciseCategory,
  ExerciseIntensity,
  ExerciseSpace
} from "./data/exercises";

export type TargetArea = ExerciseCategory;
export type MovementMode = "seated" | "standing";

export type Preferences = {
  durationMin: number;
  sessionDurationSec: number;
  targetAreas: TargetArea[];
  space: ExerciseSpace;
  intensity: ExerciseIntensity;
  updatedAt: string;
};

export type LikedExerciseGroups = Record<string, string>;

export type ReminderSettings = {
  enabled: boolean;
  times: string[];
};

export type SavedMovementGroup = {
  id: string;
  name: string;
  exerciseIds: string[];
  durations: number[];
  savedAt: string;
};

export type RecommendationHistory = {
  lastSessionFirstExerciseId?: string;
  lastSessionExerciseIds?: string[];
};

export type CompletedSession = {
  id: string;
  source: CompletedSessionSource;
  completedAt: string;
  date: string;
  plannedDurationSec: number;
  actualCompletedSec: number;
  movementCount: number;
  targetAreas: string[];
  exerciseIds: string[];
};

export type CompletedSessionSource = "home_recommendation" | "exercise_library";

export type AbandonedSession = {
  id: string;
  abandonedAt: string;
  date: string;
  plannedDurationSec: number;
  actualCompletedSec: number;
  completedMovementCount: number;
  movementCount: number;
  targetAreas: string[];
  exerciseIds: string[];
  currentExerciseIndex: number;
};

export type SessionPlan = {
  id: string;
  source: "preferences" | "temporary" | "single" | "replay";
  preferences: Pick<Preferences, "durationMin" | "sessionDurationSec" | "targetAreas" | "space" | "intensity"> & {
    movementMode?: MovementMode;
  };
  exercises: Exercise[];
  plannedDurationSec: number;
};

export type Tab = "home" | "library" | "profile";

export type AppView =
  | { name: "onboarding" }
  | { name: "home" }
  | { name: "temporary" }
  | { name: "edit-preferences"; returnTo: "home" | "profile" }
  | { name: "library-detail"; groupId: string }
  | {
      name: "session-preview";
      session: SessionPlan;
      savedGroupId?: string;
      savedGroupName?: string;
    }
  | { name: "reminder-settings" }
  | { name: "player"; session: SessionPlan }
  | {
      name: "completion";
      session: CompletedSession;
      mode: "regular" | "single" | "replay";
      movementMode?: MovementMode;
    };
