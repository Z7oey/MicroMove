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
  reminderFrequency: "30分钟后" | "60分钟后" | "90分钟后" | "暂不设置" | "每45分钟" | "每60分钟" | "每90分钟" | "暂不提醒";
  updatedAt: string;
};

export type CompletedSession = {
  id: string;
  completedAt: string;
  date: string;
  plannedDurationSec: number;
  actualCompletedSec: number;
  movementCount: number;
  targetAreas: string[];
  exerciseIds: string[];
};

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
  | { name: "player"; session: SessionPlan }
  | {
      name: "completion";
      session: CompletedSession;
      mode: "regular" | "single" | "replay";
      movementMode?: MovementMode;
    };
