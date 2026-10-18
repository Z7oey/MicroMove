import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  Bell,
  Check,
  ChevronRight,
  ClipboardList,
  Grid2X2,
  Heart,
  Home,
  Leaf,
  LibraryBig,
  Minus,
  Music2,
  Pause,
  Play,
  Plus,
  RotateCcw,
  ShieldCheck,
  SkipForward,
  SlidersHorizontal,
  Sparkles,
  UserRound,
  Vibrate,
  X
} from "lucide-react";
import {
  exerciseGroupById,
  exerciseGroupExercises,
  exerciseCategories,
  exercises,
  groupIdForExercise,
  groupMatchesCategory,
  libraryExerciseGroups,
  primaryExerciseForGroup,
  type Exercise,
  type ExerciseGroup,
  type ExerciseIntensity,
  type ExerciseSpace
} from "./data/exercises";
import {
  appendAbandonedSession,
  appendSession,
  deleteMovementGroup,
  loadAbandonedSessions,
  loadLikedExerciseGroups,
  loadPreferences,
  loadRecommendationHistory,
  loadReminderSettings,
  loadSavedMovementGroups,
  loadSessions,
  saveMovementGroup,
  saveLikedExerciseGroups,
  saveRecommendationHistory,
  saveReminderSettings,
  savePreferences
} from "./storage";
import {
  createAbandonedSession,
  createCompletedSession,
  generateSession,
  generateSingleExerciseSession
} from "./session";
import type {
  AbandonedSession,
  AppView,
  CompletedSession,
  LikedExerciseGroups,
  MovementMode,
  Preferences,
  ReminderSettings,
  SavedMovementGroup,
  Tab,
  TargetArea
} from "./types";
import { calculateStreak, formatDuration, todayTotalSec } from "./utils";
import { copy } from "./copy";

type PreferenceDraft = Pick<
  Preferences,
  "durationMin" | "sessionDurationSec" | "targetAreas" | "space" | "intensity"
> & {
  movementMode?: MovementMode;
};

const defaultDraft: PreferenceDraft = {
  durationMin: 1,
  sessionDurationSec: 60,
  targetAreas: ["肩颈"],
  space: "小空间",
  intensity: "温和"
};

type OnboardingDraft = Omit<PreferenceDraft, "space" | "intensity"> & {
  space: ExerciseSpace | null;
  intensity: ExerciseIntensity | null;
};

const onboardingDraft: OnboardingDraft = {
  durationMin: 1,
  sessionDurationSec: 60,
  targetAreas: [],
  space: null,
  intensity: null
};

const durationOptions = [30, 60, 90, 120, 150, 180];
const targetAreaOptions: Array<{ value: TargetArea; label: string; emoji: string }> = [
  { value: "肩颈", label: "肩颈", emoji: "💻" },
  { value: "上背", label: "上背", emoji: "🪽" },
  { value: "胸肩", label: "胸肩", emoji: "🙆" },
  { value: "腰背", label: "腰背", emoji: "🪑" }
];
const onboardingIllustrations = [
  "/assets/ip/ip-1.png",
  "/assets/ip/ip-2.png",
  "/assets/ip/ip-3.png",
  "/assets/ip/ip-4.png"
];
function areaLabel(area: string) {
  return targetAreaOptions.find((item) => item.value === area)?.label ?? area;
}

function areaLabels(areas: string[]) {
  return areas.map(areaLabel);
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function preferenceSummary(
  preferences: Pick<Preferences, "sessionDurationSec" | "targetAreas" | "space" | "intensity">
) {
  return copy.common.preferenceSummary(
    preferences.sessionDurationSec,
    areaLabels(preferences.targetAreas),
    preferences.space,
    preferences.intensity
  );
}

function fullPreferenceSummary(preferences: Preferences) {
  return preferenceSummary(preferences);
}

function movementGroupConfigurationsMatch(left: SavedMovementGroup, right: SavedMovementGroup) {
  return left.exerciseIds.length === right.exerciseIds.length &&
    left.exerciseIds.every(
      (exerciseId, index) =>
        exerciseId === right.exerciseIds[index] && left.durations[index] === right.durations[index]
    );
}

function recentCompletedExerciseIds(sessions: CompletedSession[], limit = 3) {
  return [...sessions]
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt))
    .flatMap((session) => session.exerciseIds)
    .slice(0, limit);
}

function sortGroupsByLike(groups: ExerciseGroup[], likedExerciseGroups: LikedExerciseGroups) {
  return groups
    .map((group, index) => ({ group, index, likedAt: likedExerciseGroups[group.id] }))
    .sort((left, right) => {
      if (left.likedAt && right.likedAt) return right.likedAt.localeCompare(left.likedAt);
      if (left.likedAt) return -1;
      if (right.likedAt) return 1;
      return left.index - right.index;
    })
    .map((item) => item.group);
}

function App() {
  const [preferences, setPreferences] = useState<Preferences | null>(() => loadPreferences());
  const [sessions, setSessions] = useState<CompletedSession[]>(() => loadSessions());
  const [abandonedSessions, setAbandonedSessions] = useState<AbandonedSession[]>(() =>
    loadAbandonedSessions()
  );
  const [likedExerciseGroups, setLikedExerciseGroups] = useState<LikedExerciseGroups>(() =>
    loadLikedExerciseGroups()
  );
  const [savedMovementGroups, setSavedMovementGroups] = useState<SavedMovementGroup[]>(() =>
    loadSavedMovementGroups()
  );
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [view, setView] = useState<AppView>(() =>
    loadPreferences() ? { name: "home" } : { name: "onboarding" }
  );
  const recentlyRecommendedIds = useRef<string[]>([]);
  const recommendationHistoryRef = useRef(loadRecommendationHistory());
  const completedPlanIds = useRef(new Set<string>());

  const todaySec = todayTotalSec(sessions);
  const streak = calculateStreak(sessions);
  const recentExerciseIds = useMemo(() => recentCompletedExerciseIds(sessions), [sessions]);

  function recommendationHistory() {
    return Array.from(new Set([...recentlyRecommendedIds.current, ...recentExerciseIds]));
  }

  function rememberRecommendation(plan: ReturnType<typeof generateSession>) {
    const firstExerciseId = plan.exercises[0]?.id;
    if (!firstExerciseId) return;
    recentlyRecommendedIds.current = [
      firstExerciseId,
      ...recentlyRecommendedIds.current.filter((id) => id !== firstExerciseId)
    ].slice(0, 3);
    recommendationHistoryRef.current = {
      lastSessionFirstExerciseId: firstExerciseId,
      lastSessionExerciseIds: plan.exercises.map((exercise) => exercise.id)
    };
    saveRecommendationHistory(recommendationHistoryRef.current);
  }

  function toggleLikedExerciseGroup(groupId: string) {
    setLikedExerciseGroups((current) => {
      const next = { ...current };
      if (next[groupId]) {
        delete next[groupId];
      } else {
        next[groupId] = new Date().toISOString();
      }
      saveLikedExerciseGroups(next);
      return next;
    });
  }

  function persistPreferences(draft: PreferenceDraft, returnTo: "home" | "profile" = "home") {
    const { movementMode: _movementMode, ...preferenceValues } = draft;
    const next: Preferences = {
      ...preferenceValues,
      durationMin: draft.sessionDurationSec / 60,
      updatedAt: new Date().toISOString()
    };
    savePreferences(next);
    setPreferences(next);
    setActiveTab(returnTo);
    setView({ name: "home" });
  }

  function startFromPreferences(mode?: MovementMode) {
    if (!preferences) return;
    const spaceOverride: ExerciseSpace =
      mode === "seated"
        ? "小空间"
        : preferences.space === "小空间"
          ? "中空间"
          : preferences.space;
    const modePreferences = mode
      ? {
          ...preferences,
          movementMode: mode,
          space: spaceOverride,
          recentExerciseIds: recommendationHistory(),
          lastSessionFirstExerciseId: recommendationHistoryRef.current.lastSessionFirstExerciseId,
          lastSessionExerciseIds: recommendationHistoryRef.current.lastSessionExerciseIds,
          likedExerciseGroups
        }
      : {
          ...preferences,
          recentExerciseIds: recommendationHistory(),
          lastSessionFirstExerciseId: recommendationHistoryRef.current.lastSessionFirstExerciseId,
          lastSessionExerciseIds: recommendationHistoryRef.current.lastSessionExerciseIds,
          likedExerciseGroups
        };
    const plan = generateSession(modePreferences);
    rememberRecommendation(plan);
    setView({ name: "session-preview", session: plan });
  }

  function startTemporary(draft: PreferenceDraft) {
    const plan = generateSession({
      ...draft,
      movementMode: draft.movementMode ?? "seated",
      recentExerciseIds: recommendationHistory(),
      lastSessionFirstExerciseId: recommendationHistoryRef.current.lastSessionFirstExerciseId,
      lastSessionExerciseIds: recommendationHistoryRef.current.lastSessionExerciseIds,
      likedExerciseGroups
    });
    rememberRecommendation(plan);
    setView({ name: "session-preview", session: { ...plan, source: "temporary" } });
  }

  function openSavedMovementGroup(group: SavedMovementGroup) {
    if (!preferences) return;
    const selectedExercises = group.exerciseIds.flatMap((exerciseId, index) => {
      const exercise = exercises.find((item) => item.id === exerciseId);
      return exercise ? [{ ...exercise, duration: group.durations[index] ?? exercise.duration }] : [];
    });
    if (!selectedExercises.length) return;
    const targetAreas = Array.from(new Set(selectedExercises.map((exercise) => exercise.category)));
    const plannedDurationSec = selectedExercises.reduce((total, exercise) => total + exercise.duration, 0);
    setView({
      name: "session-preview",
      savedGroupId: group.id,
      savedGroupName: group.name,
      session: {
        id: `saved-session-${Date.now()}`,
        source: "preferences",
        preferences: {
          ...preferences,
          durationMin: plannedDurationSec / 60,
          sessionDurationSec: plannedDurationSec,
          targetAreas
        },
        exercises: selectedExercises,
        plannedDurationSec
      }
    });
  }

  function completeSession(
    plan: AppView & { name: "player" },
    actualCompletedSec: number,
    completedExerciseIds?: string[]
  ) {
    const completedIds = completedExerciseIds ?? [];
    const requiredIds = plan.session.exercises.map((exercise) => exercise.id);
    const completedEveryExercise =
      requiredIds.length > 0 &&
      completedIds.length === requiredIds.length &&
      requiredIds.every((exerciseId) => completedIds.includes(exerciseId));

    if (!completedEveryExercise || actualCompletedSec <= 0) {
      setView({ name: "home" });
      return;
    }
    if (completedPlanIds.current.has(plan.session.id)) return;
    completedPlanIds.current.add(plan.session.id);

    const completed = createCompletedSession(plan.session, actualCompletedSec, completedIds);
    if (plan.session.source === "single") {
      setSessions(appendSession(completed));
      setView({ name: "completion", session: completed, mode: "single" });
      return;
    }
    if (plan.session.source === "replay") {
      setView({ name: "completion", session: completed, mode: "replay" });
      return;
    }
    setSessions(appendSession(completed));
    setView({
      name: "completion",
      session: completed,
      mode: "regular",
      movementMode: plan.session.preferences.movementMode
    });
  }

  function abandonSession(
    plan: AppView & { name: "player" },
    actualCompletedSec: number,
    currentExerciseIndex: number
  ) {
    if (plan.session.source !== "single") {
      const abandoned = createAbandonedSession(
        plan.session,
        actualCompletedSec,
        currentExerciseIndex
      );
      setAbandonedSessions(appendAbandonedSession(abandoned));
    }
    setView({ name: "home" });
  }

  if (view.name === "onboarding") {
    return (
      <Shell hideNav>
        <Onboarding onSubmit={(draft) => persistPreferences(draft, "home")} />
      </Shell>
    );
  }

  if (!preferences) {
    return null;
  }

  if (view.name === "player") {
    return (
      <Shell hideNav>
        <ExercisePlayer
          session={view}
          likedExerciseGroups={likedExerciseGroups}
          onComplete={(actualCompletedSec, completedExerciseIds) =>
            completeSession(view, actualCompletedSec, completedExerciseIds)
          }
          onExit={(actualCompletedSec, currentExerciseIndex) =>
            abandonSession(view, actualCompletedSec, currentExerciseIndex)
          }
          onToggleLike={toggleLikedExerciseGroup}
        />
      </Shell>
    );
  }

  if (view.name === "session-preview") {
    return (
      <Shell hideNav>
        <SessionPreview
          initialSession={view.session}
          initialSavedGroupId={view.savedGroupId}
          initialName={view.savedGroupName}
          onBack={() => {
            if (view.savedGroupId) setActiveTab("library");
            setView({ name: "home" });
          }}
          onSave={(group) => {
            const existing = savedMovementGroups.find((savedGroup) => savedGroup.id === group.id);
            const duplicate = existing
              ? (
                  existing.name === group.name &&
                  movementGroupConfigurationsMatch(existing, group)
                ) || savedMovementGroups.some(
                  (savedGroup) =>
                    savedGroup.id !== group.id &&
                    movementGroupConfigurationsMatch(savedGroup, group)
                )
              : savedMovementGroups.some((savedGroup) =>
                  movementGroupConfigurationsMatch(savedGroup, group)
                );
            if (duplicate) return "duplicate";
            setSavedMovementGroups(saveMovementGroup(group));
            return "saved";
          }}
          onDelete={(groupId) => {
            setSavedMovementGroups(deleteMovementGroup(groupId));
            setActiveTab("library");
            setView({ name: "home" });
          }}
          onStart={(session) => setView({ name: "player", session })}
        />
      </Shell>
    );
  }

  if (view.name === "reminder-settings") {
    return (
      <Shell hideNav>
        <ReminderSettingsScreen
          onBack={() => {
            setActiveTab("profile");
            setView({ name: "home" });
          }}
        />
      </Shell>
    );
  }

  if (view.name === "completion") {
    return (
      <Shell hideNav>
        <Completion
          session={view.session}
          sessions={sessions}
          mode={view.mode}
          likedExerciseGroups={likedExerciseGroups}
          onHome={() => {
            setActiveTab(view.mode === "single" ? "library" : "home");
            setView({ name: "home" });
          }}
          onAgain={() => {
            if (view.mode === "single") {
              setActiveTab("library");
              setView({ name: "home" });
              return;
            }
            if (view.mode === "replay") {
              setActiveTab("profile");
              setView({ name: "home" });
              return;
            }
            startFromPreferences(view.movementMode);
          }}
          onToggleLike={toggleLikedExerciseGroup}
        />
      </Shell>
    );
  }

  if (view.name === "library-detail") {
    const group = exerciseGroupById(view.groupId);
    if (!group) {
      return (
        <Shell hideNav>
          <button
            className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-1 text-sm font-semibold text-ink"
            onClick={() => {
              setActiveTab("library");
              setView({ name: "home" });
            }}
            type="button"
          >
            <ArrowLeft size={18} />
            {copy.common.back}
          </button>
        </Shell>
      );
    }
    return (
      <Shell hideNav>
        <LibraryDetail
          group={group}
          likedAt={likedExerciseGroups[group.id]}
          onBack={() => {
            setActiveTab("library");
            setView({ name: "home" });
          }}
          onStart={(exercisesForSession) =>
            setView({
              name: "player",
              session: generateSingleExerciseSession(exercisesForSession)
            })
          }
          onToggleLike={() => toggleLikedExerciseGroup(group.id)}
        />
      </Shell>
    );
  }

  if (view.name === "temporary") {
    return (
      <Shell hideNav>
        <PreferenceScreen
          title={copy.preferences.temporaryTitle}
          subtitle={copy.preferences.temporarySubtitle}
          initial={preferences}
          submitLabel={copy.preferences.temporarySubmit}
          includeMovementMode
          onBack={() => setView({ name: "home" })}
          onSubmit={startTemporary}
        />
      </Shell>
    );
  }

  if (view.name === "edit-preferences") {
    return (
      <Shell hideNav>
        <PreferenceScreen
          title={copy.preferences.editTitle}
          subtitle={copy.preferences.editSubtitle}
          initial={preferences}
          submitLabel={copy.preferences.editSubmit}
          includeMovementMode={false}
          onBack={() => {
            setActiveTab(view.returnTo);
            setView({ name: "home" });
          }}
          onSubmit={(draft) => persistPreferences(draft, view.returnTo)}
        />
      </Shell>
    );
  }

  return (
    <Shell activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === "home" && (
        <HomeScreen
          preferences={preferences}
          onStart={startFromPreferences}
          onTemporary={() => setView({ name: "temporary" })}
        />
      )}
      {activeTab === "library" && (
        <LibraryScreen
          likedExerciseGroups={likedExerciseGroups}
          savedMovementGroups={savedMovementGroups}
          onOpen={(group) => setView({ name: "library-detail", groupId: group.id })}
          onOpenSavedGroup={openSavedMovementGroup}
          onToggleLike={toggleLikedExerciseGroup}
        />
      )}
      {activeTab === "profile" && (
        <ProfileScreen
          preferences={preferences}
          sessions={sessions}
          todaySec={todaySec}
          streak={streak}
          onEdit={() => setView({ name: "edit-preferences", returnTo: "profile" })}
          onReminder={() => setView({ name: "reminder-settings" })}
        />
      )}
    </Shell>
  );
}

function Shell({
  children,
  activeTab,
  onTabChange,
  hideNav = false
}: {
  children: ReactNode;
  activeTab?: Tab;
  onTabChange?: (tab: Tab) => void;
  hideNav?: boolean;
}) {
  return (
    <div className="min-h-svh bg-paper text-ink">
      <main className={cn("mx-auto min-h-svh w-full max-w-md px-5", hideNav ? "py-3" : "pb-28 pt-5")}>
        {children}
      </main>
      {!hideNav && activeTab && onTabChange && (
        <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-black/5 bg-paper/90 px-4 py-3 backdrop-blur">
          <div className="mx-auto grid max-w-md grid-cols-3 gap-2 rounded-full bg-white/70 p-1 shadow-soft">
            <TabButton icon={<Home size={18} />} label={copy.tabs.home} active={activeTab === "home"} onClick={() => onTabChange("home")} />
            <TabButton icon={<LibraryBig size={18} />} label={copy.tabs.library} active={activeTab === "library"} onClick={() => onTabChange("library")} />
            <TabButton icon={<UserRound size={18} />} label={copy.tabs.profile} active={activeTab === "profile"} onClick={() => onTabChange("profile")} />
          </div>
        </nav>
      )}
    </div>
  );
}

function TabButton({
  icon,
  label,
  active,
  onClick
}: {
  icon: ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "flex h-12 items-center justify-center gap-1.5 rounded-full text-sm transition",
        active ? "bg-leaf text-white shadow-sm" : "text-muted hover:bg-moss/60"
      )}
      onClick={onClick}
      type="button"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function Onboarding({ onSubmit }: { onSubmit: (draft: PreferenceDraft) => void }) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<OnboardingDraft>(onboardingDraft);
  const totalSteps = 2;
  const progressPercent = ((step + 1) / totalSteps) * 100;
  const needsConfirm = step === 0;
  const canContinueAreas = draft.targetAreas.length > 0;
  const showFooterPrimary = needsConfirm || step === 1;
  const illustration = onboardingIllustrations[step];

  function completeDraft(nextDraft = draft): PreferenceDraft {
    return {
      ...nextDraft,
      space: nextDraft.space ?? "小空间",
      intensity: nextDraft.intensity ?? "温和"
    };
  }

  function goBack() {
    setStep((current) => Math.max(0, current - 1));
  }

  function goNext(nextDraft = draft) {
    if (step >= totalSteps - 1) {
      onSubmit(completeDraft(nextDraft));
      return;
    }
    setStep((current) => Math.min(totalSteps - 1, current + 1));
  }

  function toggleArea(area: TargetArea) {
    setDraft((current) => {
      const exists = current.targetAreas.includes(area);
      const next = exists
        ? current.targetAreas.filter((item) => item !== area)
        : [...current.targetAreas, area];
      return { ...current, targetAreas: next };
    });
  }

  return (
    <div className="flex min-h-[calc(100svh-40px)] animate-rise flex-col pb-40 pt-3">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <p className="text-lg font-semibold text-leaf">{copy.onboarding.eyebrow}</p>
          <span className="rounded-full bg-moss px-3 py-1 text-sm font-semibold text-leaf">
            {copy.onboarding.progressLabel(step + 1, totalSteps)}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white">
          <div
            className="h-full rounded-full bg-leaf transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className={step === 0 ? "relative min-h-[184px]" : "flex justify-end pt-8"}>
          {step === 0 ? (
            <>
              <div className="relative z-10">
                <h1 className="whitespace-nowrap text-[34px] font-semibold leading-tight tracking-normal">
                  {copy.onboarding.title}
                </h1>
                <p className="mt-3 max-w-[230px] text-base leading-7 text-muted">
                  {copy.onboarding.subtitle}
                </p>
              </div>
              <img
                alt=""
                aria-hidden="true"
                className="animate-float pointer-events-none absolute right-0 top-[86px] h-24 w-24 rounded-[8px] object-cover shadow-soft"
                src={illustration}
              />
            </>
          ) : (
            <img
              alt=""
              aria-hidden="true"
              className="animate-float pointer-events-none h-24 w-24 shrink-0 rounded-[8px] object-cover shadow-soft"
              src={illustration}
            />
          )}
        </div>
      </div>

      <div className="mt-5 flex-1">
        {step === 0 && (
          <Section title={copy.preferences.durationTitle} helper={copy.preferences.durationHelper}>
            <div className="rounded-[8px] bg-white/75 p-4 shadow-soft">
              <div className="mb-3 flex items-end justify-between">
                <span className="text-base font-semibold text-muted">⏱️ {copy.preferences.durationLabel}</span>
                <strong className="text-3xl font-semibold text-leaf">
                  {copy.common.durationSec(draft.sessionDurationSec)}
                </strong>
              </div>
              <input
                className="w-full accent-leaf"
                max={durationOptions.length - 1}
                min={0}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    durationMin: durationOptions[Number(event.target.value)] / 60,
                    sessionDurationSec: durationOptions[Number(event.target.value)]
                  }))
                }
                step={1}
                type="range"
                value={durationOptions.indexOf(draft.sessionDurationSec)}
              />
              <div className="mt-2 flex justify-between text-xs text-muted">
                <span>{copy.preferences.durationMinLabel}</span>
                <span>{copy.preferences.durationMaxLabel}</span>
              </div>
            </div>
          </Section>
        )}

        {step === 1 && (
          <section className="space-y-3">
            <h2 className="whitespace-nowrap text-[27px] font-semibold tracking-normal">
              {copy.preferences.targetAreasTitle}
            </h2>
            <div className="space-y-2">
              {targetAreaOptions.map((area) => (
                <OptionButton
                  key={area.value}
                  active={draft.targetAreas.includes(area.value)}
                  emoji={area.emoji}
                  label={area.label}
                  onClick={() => toggleArea(area.value)}
                />
              ))}
            </div>
          </section>
        )}

      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-black/5 bg-paper/95 px-5 py-4 backdrop-blur">
        <div className="mx-auto grid max-w-md gap-3">
          <button
            className="min-h-14 w-full rounded-full bg-white/75 px-6 py-4 text-base font-semibold text-ink disabled:text-muted"
            disabled={step === 0}
            onClick={goBack}
            type="button"
          >
            {copy.common.back}
          </button>
          {showFooterPrimary ? (
            <button
              className="min-h-14 w-full rounded-full bg-leaf px-4 py-3 text-base font-semibold text-white shadow-soft disabled:bg-muted/30 disabled:text-muted"
              disabled={step === 1 && !canContinueAreas}
              onClick={() => goNext()}
              type="button"
            >
              {needsConfirm
                ? copy.onboarding.durationAction(draft.sessionDurationSec)
                : copy.onboarding.startAction}
            </button>
          ) : (
            null
          )}
        </div>
      </div>
    </div>
  );
}

function PreferenceScreen({
  title,
  subtitle,
  initial,
  submitLabel,
  includeMovementMode,
  onBack,
  onSubmit
}: {
  title: string;
  subtitle: string;
  initial: PreferenceDraft;
  submitLabel: string;
  includeMovementMode: boolean;
  onBack: () => void;
  onSubmit: (draft: PreferenceDraft) => void;
}) {
  return (
    <div className="animate-rise space-y-6 pb-8">
      <button
        className="inline-flex min-h-12 min-w-36 items-center justify-center gap-2 rounded-full bg-white/75 px-6 py-3 text-base font-semibold text-muted shadow-sm"
        onClick={onBack}
        type="button"
      >
        <ArrowLeft size={18} />
        {copy.common.back}
      </button>
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-normal">{title}</h1>
        <p className="text-sm leading-6 text-muted">{subtitle}</p>
      </div>
      <PreferenceForm
        initial={initial}
        includeMovementMode={includeMovementMode}
        submitLabel={submitLabel}
        onSubmit={onSubmit}
      />
    </div>
  );
}

function PreferenceForm({
  initial,
  includeMovementMode,
  submitLabel,
  onSubmit
}: {
  initial: PreferenceDraft;
  includeMovementMode: boolean;
  submitLabel: string;
  onSubmit: (draft: PreferenceDraft) => void;
}) {
  const [draft, setDraft] = useState<PreferenceDraft>({
    ...defaultDraft,
    ...initial,
    durationMin: initial.sessionDurationSec / 60,
    targetAreas: initial.targetAreas.length ? initial.targetAreas : ["肩颈"],
    movementMode: initial.movementMode ?? (initial.space === "小空间" ? "seated" : "standing")
  });
  const canSubmit = draft.targetAreas.length > 0 && (!includeMovementMode || Boolean(draft.movementMode));

  function toggleArea(area: TargetArea) {
    setDraft((current) => {
      const exists = current.targetAreas.includes(area);
      const next = exists
        ? current.targetAreas.filter((item) => item !== area)
        : [...current.targetAreas, area];
      return { ...current, targetAreas: next };
    });
  }

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(draft);
      }}
    >
      <Section title={copy.preferences.durationTitle} helper={copy.preferences.durationHelper}>
        <div className="rounded-[8px] bg-white/75 p-4 shadow-soft">
          <div className="mb-3 flex items-end justify-between">
            <span className="text-sm text-muted">{copy.preferences.durationLabel}</span>
            <strong className="text-3xl font-semibold text-leaf">
              {copy.common.durationSec(draft.sessionDurationSec)}
            </strong>
          </div>
          <input
            className="w-full accent-leaf"
            max={durationOptions.length - 1}
            min={0}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                durationMin: durationOptions[Number(event.target.value)] / 60,
                sessionDurationSec: durationOptions[Number(event.target.value)]
              }))
            }
            step={1}
            type="range"
            value={durationOptions.indexOf(draft.sessionDurationSec)}
          />
          <div className="mt-2 flex justify-between text-xs text-muted">
            <span>{copy.preferences.durationMinLabel}</span>
            <span>{copy.preferences.durationMaxLabel}</span>
          </div>
        </div>
      </Section>

      <Section title={copy.preferences.targetAreasTitle}>
        <div className="space-y-2">
          {targetAreaOptions.map((area) => (
            <OptionButton
              key={area.value}
              active={draft.targetAreas.includes(area.value)}
              label={area.label}
              onClick={() => toggleArea(area.value)}
            />
          ))}
        </div>
      </Section>

      {includeMovementMode && (
        <Section title={copy.preferences.movementModeTitle}>
          <div className="grid grid-cols-2 gap-2">
            <OptionButton
              active={draft.movementMode === "seated"}
              label={copy.home.startSeated}
              onClick={() => setDraft((current) => ({ ...current, movementMode: "seated" }))}
            />
            <OptionButton
              active={draft.movementMode === "standing"}
              label={copy.home.startStanding}
              onClick={() => setDraft((current) => ({ ...current, movementMode: "standing" }))}
            />
          </div>
        </Section>
      )}

      <button
        className="h-13 w-full rounded-full bg-leaf px-5 py-4 font-semibold text-white shadow-soft transition hover:translate-y-[-1px] disabled:bg-muted/30 disabled:text-muted"
        disabled={!canSubmit}
        type="submit"
      >
        {submitLabel}
      </button>
    </form>
  );
}

function Section({
  title,
  helper,
  children
}: {
  title: string;
  helper?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-2xl font-semibold tracking-normal">{title}</h2>
        {helper && <p className="mt-1 text-sm leading-6 text-muted">{helper}</p>}
      </div>
      {children}
    </section>
  );
}

function OptionButton({
  active,
  emoji,
  label,
  description,
  onClick
}: {
  active: boolean;
  emoji?: string;
  label: string;
  description?: string;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "flex min-h-14 w-full items-center justify-between gap-3 rounded-[8px] border px-4 py-3 text-left transition",
        active
          ? "border-leaf bg-moss text-ink"
          : "border-black/5 bg-white/70 text-ink hover:border-leaf/40"
      )}
      onClick={onClick}
      type="button"
    >
      <span>
        <span className="block text-base font-semibold">
          {emoji && <span className="mr-2" aria-hidden="true">{emoji}</span>}
          {label}
        </span>
        {description && <span className="mt-1 block text-xs leading-5 text-muted">{description}</span>}
      </span>
      {active && <Check className="shrink-0 text-leaf" size={18} />}
    </button>
  );
}

function HomeScreen({
  preferences,
  onStart,
  onTemporary
}: {
  preferences: Preferences;
  onStart: (mode?: MovementMode) => void;
  onTemporary: () => void;
}) {
  const [standingPromptOpen, setStandingPromptOpen] = useState(false);

  function choosePromptMode(mode: MovementMode) {
    setStandingPromptOpen(false);
    onStart(mode);
  }

  return (
    <div className="animate-rise space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-normal text-leaf">{copy.app.name}</h1>
      </header>

      <section className="overflow-hidden rounded-[8px] bg-white shadow-soft">
        <div className="relative min-h-[230px] bg-moss px-5 py-6">
          <div className="absolute right-4 top-4 h-24 w-24 rounded-full border border-white/60" />
          <div className="absolute bottom-5 right-7 h-28 w-16 rounded-full bg-paper/70" />
          <div className="relative max-w-[280px] space-y-3">
            <div className="inline-flex items-center gap-1 rounded-full bg-white/75 px-3 py-1 text-xs text-leaf">
              <Sparkles size={14} />
              {copy.home.eyebrow}
            </div>
            <h2 className="text-4xl font-semibold leading-tight tracking-normal">{copy.home.heroTitle}</h2>
            <p className="text-sm leading-6 text-ink/70">{copy.home.heroSubtitle}</p>
          </div>
        </div>
        <div className="space-y-4 p-5">
          <div className="rounded-[8px] bg-paper px-4 py-3">
            <p className="text-sm leading-6 text-ink/80">
              {copy.home.recommendationPrefix}{preferenceSummary(preferences)}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              className="flex min-h-40 flex-col rounded-[10px] border border-white/35 bg-gradient-to-br from-leaf to-[#5f7f63] px-4 py-4 text-left text-white shadow-[0_7px_0_#4f6f54,0_15px_28px_rgba(47,50,45,0.18)] transition-[transform,box-shadow] duration-150 hover:-translate-y-1 hover:shadow-[0_9px_0_#4f6f54,0_19px_34px_rgba(47,50,45,0.2)] active:translate-y-1 active:shadow-[0_2px_0_#4f6f54,0_8px_16px_rgba(47,50,45,0.14)]"
              onClick={() => setStandingPromptOpen(true)}
              type="button"
            >
              <span className="block text-lg font-semibold">{copy.home.startSeated}</span>
              <span className="mt-2 block text-xs leading-5 text-white/80">{copy.home.seatedDescription}</span>
              <span className="mt-auto self-end text-sm font-semibold">{copy.home.startAction}</span>
            </button>
            <button
              className="flex min-h-40 flex-col rounded-[10px] border border-white/70 bg-gradient-to-br from-[#e5efd8] to-moss px-4 py-4 text-left text-ink shadow-[0_7px_0_#bfd0ad,0_15px_28px_rgba(47,50,45,0.14)] transition-[transform,box-shadow] duration-150 hover:-translate-y-1 hover:shadow-[0_9px_0_#bfd0ad,0_19px_34px_rgba(47,50,45,0.17)] active:translate-y-1 active:shadow-[0_2px_0_#bfd0ad,0_8px_16px_rgba(47,50,45,0.11)]"
              onClick={() => onStart("standing")}
              type="button"
            >
              <span className="block text-lg font-semibold">{copy.home.startStanding}</span>
              <span className="mt-2 block text-xs leading-5 text-ink/65">{copy.home.standingDescription}</span>
              <span className="mt-auto self-end text-sm font-semibold text-leaf">{copy.home.startAction}</span>
            </button>
          </div>
          <button className="w-full rounded-full bg-white/85 px-5 py-4 text-base font-semibold text-ink shadow-sm transition duration-150 hover:-translate-y-0.5 active:translate-y-0.5 active:scale-[0.99]" onClick={onTemporary} type="button">
            {copy.home.temporary}
          </button>
        </div>
      </section>
      {standingPromptOpen && (
        <StandingPrompt
          onSeated={() => choosePromptMode("seated")}
          onStanding={() => choosePromptMode("standing")}
        />
      )}
    </div>
  );
}

function StandingPrompt({
  onSeated,
  onStanding
}: {
  onSeated: () => void;
  onStanding: () => void;
}) {
  const [tipIndex, setTipIndex] = useState(0);
  const currentTip = copy.home.standingPromptTips[tipIndex];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTipIndex((current) => (current + 1) % copy.home.standingPromptTips.length);
    }, 2000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-30 grid place-items-end bg-ink/25 px-5 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-8 backdrop-blur-sm">
      <section
        aria-modal="true"
        className="w-full max-w-md animate-rise rounded-[24px] border border-white/70 bg-white/90 p-5 shadow-[0_24px_80px_rgba(47,50,45,0.24)]"
        role="dialog"
      >
        <div className="rounded-[18px] bg-moss/80 px-4 py-4">
          <p className="text-xs font-semibold text-leaf">久坐打断提醒</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-normal">
            {copy.home.standingPromptTitle}
          </h2>
          <p className="mt-3 text-sm leading-6 text-ink/75">{copy.home.standingPromptLead}</p>
          <p
            aria-live="polite"
            className="mt-2 min-h-[3rem] rounded-[14px] bg-white/65 px-3 py-2 text-sm leading-6 text-ink/75 transition"
          >
            {currentTip}
          </p>
        </div>

        <div className="mt-4 grid gap-3">
          <button
            className="min-h-14 w-full rounded-full bg-leaf px-5 py-4 text-base font-semibold text-white shadow-soft transition hover:-translate-y-0.5 active:translate-y-0.5"
            onClick={onStanding}
            type="button"
          >
            {copy.home.standingPromptStand}
          </button>
          <button
            className="min-h-14 w-full rounded-full bg-paper px-5 py-4 text-base font-semibold text-ink shadow-sm transition hover:-translate-y-0.5 active:translate-y-0.5"
            onClick={onSeated}
            type="button"
          >
            {copy.home.standingPromptSit}
          </button>
        </div>
      </section>
    </div>
  );
}

function SessionPreview({
  initialSession,
  initialName,
  initialSavedGroupId,
  onBack,
  onSave,
  onDelete,
  onStart
}: {
  initialSession: Extract<AppView, { name: "player" }>["session"];
  initialName?: string;
  initialSavedGroupId?: string;
  onBack: () => void;
  onSave: (group: SavedMovementGroup) => "saved" | "duplicate";
  onDelete: (groupId: string) => void;
  onStart: (session: Extract<AppView, { name: "player" }>["session"]) => void;
}) {
  const [sessionExercises, setSessionExercises] = useState(() =>
    initialSession.exercises.map((exercise) => ({ ...exercise }))
  );
  const defaultName = `${areaLabels(initialSession.preferences.targetAreas).join("、")}轻松一下`;
  const [groupName, setGroupName] = useState(initialName ?? defaultName);
  const [savedGroupId, setSavedGroupId] = useState(initialSavedGroupId);
  const [nameDraft, setNameDraft] = useState(initialName ?? defaultName);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const totalDuration = sessionExercises.reduce((total, exercise) => total + exercise.duration, 0);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 2400);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  function updateDuration(exerciseId: string, delta: number) {
    setSessionExercises((current) =>
      current.map((exercise) =>
        exercise.id === exerciseId
          ? { ...exercise, duration: Math.min(120, Math.max(5, exercise.duration + delta)) }
          : exercise
      )
    );
    setSaved(false);
  }

  function adjustTotal(delta: number) {
    setSessionExercises((current) => {
      const next = current.map((exercise) => ({ ...exercise }));
      let remaining = Math.abs(delta);
      let cursor = 0;
      while (remaining > 0 && next.length) {
        const target = next[cursor % next.length];
        const candidate = target.duration + Math.sign(delta) * 5;
        if (candidate >= 5 && candidate <= 120) {
          target.duration = candidate;
          remaining -= 5;
        }
        cursor += 1;
        if (cursor > next.length * 30) break;
      }
      return next;
    });
    setSaved(false);
  }

  function buildSession() {
    return {
      ...initialSession,
      preferences: {
        ...initialSession.preferences,
        durationMin: totalDuration / 60,
        sessionDurationSec: totalDuration
      },
      exercises: sessionExercises,
      plannedDurationSec: totalDuration
    };
  }

  function saveCurrentGroup() {
    const nextName = nameDraft.trim();
    if (!nextName) return;
    const nextId = savedGroupId ?? `saved-${Date.now()}`;
    const result = onSave({
      id: nextId,
      name: nextName,
      exerciseIds: sessionExercises.map((exercise) => exercise.id),
      durations: sessionExercises.map((exercise) => exercise.duration),
      savedAt: new Date().toISOString()
    });
    if (result === "duplicate") {
      setSaveDialogOpen(false);
      setToastMessage("这个动作组已经保存过了");
      return;
    }
    setSavedGroupId(nextId);
    setGroupName(nextName);
    setSaveDialogOpen(false);
    setSaved(true);
  }

  if (pickerOpen) {
    return (
      <ExercisePicker
        initialExercises={sessionExercises}
        onCancel={() => setPickerOpen(false)}
        onDone={(nextExercises) => {
          setSessionExercises(nextExercises);
          setSaved(false);
          setPickerOpen(false);
        }}
      />
    );
  }

  return (
    <div className="animate-rise space-y-5 pb-28">
      {toastMessage && (
        <div
          aria-live="polite"
          className="fixed left-1/2 top-5 z-50 -translate-x-1/2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_35px_rgba(47,50,45,0.28)]"
          role="status"
        >
          {toastMessage}
        </div>
      )}
      <header className="grid grid-cols-[44px_1fr_44px] items-center">
        <button
          aria-label={copy.common.back}
          className="grid h-11 w-11 place-items-center rounded-full border border-black/10 bg-white/80 shadow-sm"
          onClick={onBack}
          type="button"
        >
          <X size={20} />
        </button>
        <p className="text-center text-base font-semibold">{copy.preview.title}</p>
      </header>

      <section className="rounded-[22px] bg-white/85 p-5 shadow-soft">
        <h1 className="text-3xl font-semibold leading-tight">{groupName}</h1>
        <p className="mt-2 text-sm text-muted">
          {copy.common.durationSec(totalDuration)} · {copy.common.movementItems(sessionExercises.length)}
        </p>
        <p className="mt-2 text-sm leading-6 text-muted">
          根据你这次的选择，优先照顾{areaLabels(initialSession.preferences.targetAreas).join("、")}。
        </p>
      </section>

      <section className="rounded-[20px] bg-white/85 p-4 shadow-soft">
        <div className="flex items-center justify-between">
          <span className="font-semibold">{copy.preview.totalDuration}</span>
          <strong className="text-lg text-leaf">{copy.common.durationSec(totalDuration)}</strong>
        </div>
        <div className="mt-4 grid grid-cols-[44px_1fr_44px] items-center gap-3">
          <button aria-label="减少总时长" className="grid h-11 w-11 place-items-center rounded-full bg-paper" onClick={() => adjustTotal(-15)} type="button">
            <Minus size={18} />
          </button>
          <div className="h-2 overflow-hidden rounded-full bg-moss/60">
            <div className="h-full rounded-full bg-leaf" style={{ width: `${Math.min(100, Math.max(8, (totalDuration / 180) * 100))}%` }} />
          </div>
          <button aria-label="增加总时长" className="grid h-11 w-11 place-items-center rounded-full bg-moss text-leaf" onClick={() => adjustTotal(15)} type="button">
            <Plus size={18} />
          </button>
        </div>
      </section>

      <section className="space-y-3 rounded-[20px] bg-white/85 p-4 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">动作总览</h2>
          <button className="inline-flex items-center gap-1 text-sm font-semibold text-leaf" onClick={() => setPickerOpen(true)} type="button">
            <SlidersHorizontal size={16} />
            {copy.preview.editMovements}
          </button>
        </div>
        {sessionExercises.map((exercise) => (
          <article className="grid grid-cols-[56px_1fr_auto] items-center gap-3" key={exercise.id}>
            <img alt="" className="h-14 w-14 rounded-full object-cover" src={exercise.coverImage} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{exercise.name}</p>
              <p className="mt-1 text-xs text-muted">{exercise.category} · {exercise.posture}</p>
            </div>
            <div className="flex items-center gap-1">
              <button aria-label={`减少${exercise.name}时长`} className="grid h-8 w-8 place-items-center rounded-full bg-paper" onClick={() => updateDuration(exercise.id, -5)} type="button"><Minus size={14} /></button>
              <span className="min-w-12 text-center text-xs font-semibold tabular-nums">{exercise.duration}s</span>
              <button aria-label={`增加${exercise.name}时长`} className="grid h-8 w-8 place-items-center rounded-full bg-moss" onClick={() => updateDuration(exercise.id, 5)} type="button"><Plus size={14} /></button>
            </div>
          </article>
        ))}
      </section>

      <div className="grid gap-3">
        <button className="w-full rounded-full bg-moss px-5 py-4 font-semibold text-leaf" onClick={() => { setNameDraft(groupName); setSaveDialogOpen(true); }} type="button">
          {initialSavedGroupId
            ? saved ? copy.preview.changesSaved : copy.preview.saveChanges
            : saved ? copy.preview.saved : copy.preview.save}
        </button>
        {initialSavedGroupId && (
          <button className="w-full rounded-full border border-coral/45 bg-white/75 px-5 py-4 font-semibold text-[#a85f51]" onClick={() => setDeleteDialogOpen(true)} type="button">
            {copy.preview.deleteGroup}
          </button>
        )}
      </div>

      {saveDialogOpen && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-ink/25 px-5 backdrop-blur-sm">
          <section aria-modal="true" className="w-full max-w-sm rounded-[24px] bg-white p-5 shadow-[0_24px_80px_rgba(47,50,45,0.24)]" role="dialog">
            <div className="flex items-center justify-between gap-4">
              <div><p className="text-xs font-semibold text-leaf">我的动作组</p><h2 className="mt-1 text-2xl font-semibold">{initialSavedGroupId ? "修改动作组名称" : "给动作组起个名字"}</h2></div>
              <button aria-label="关闭" className="grid h-10 w-10 place-items-center rounded-full bg-paper" onClick={() => setSaveDialogOpen(false)} type="button"><X size={18} /></button>
            </div>
            <label className="mt-5 block text-sm font-semibold text-muted" htmlFor="movement-group-name">动作组名称</label>
            <input autoFocus className="mt-2 w-full rounded-[14px] border border-leaf/25 bg-paper px-4 py-3 text-base font-semibold outline-none focus:border-leaf" id="movement-group-name" maxLength={24} onChange={(event) => setNameDraft(event.target.value)} value={nameDraft} />
            <p className="mt-2 text-right text-xs text-muted">{nameDraft.trim().length}/24</p>
            <button className="mt-4 w-full rounded-full bg-leaf px-5 py-4 font-semibold text-white disabled:opacity-40" disabled={!nameDraft.trim()} onClick={saveCurrentGroup} type="button">{initialSavedGroupId ? copy.preview.saveChanges : "确认保存"}</button>
          </section>
        </div>
      )}

      {deleteDialogOpen && initialSavedGroupId && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-ink/25 px-5 backdrop-blur-sm">
          <section aria-modal="true" className="w-full max-w-sm rounded-[24px] bg-white p-5 shadow-[0_24px_80px_rgba(47,50,45,0.24)]" role="alertdialog">
            <h2 className="text-2xl font-semibold">确认删除这个动作组？</h2>
            <p className="mt-3 text-sm leading-6 text-muted">删除后无法恢复，未保存的临时调整也会一并放弃。</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button className="rounded-full bg-paper px-4 py-3 font-semibold text-ink" onClick={() => setDeleteDialogOpen(false)} type="button">取消</button>
              <button className="rounded-full bg-[#a85f51] px-4 py-3 font-semibold text-white" onClick={() => onDelete(initialSavedGroupId)} type="button">确认删除</button>
            </div>
          </section>
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-black/5 bg-paper/95 px-5 py-4 backdrop-blur">
        <button className="mx-auto block min-h-14 w-full max-w-md rounded-full bg-leaf px-5 py-4 text-base font-semibold text-white shadow-soft disabled:opacity-40" disabled={!sessionExercises.length} onClick={() => onStart(buildSession())} type="button">
          <Play className="mr-2 inline" size={17} fill="currentColor" />
          {copy.preview.start}
        </button>
      </div>
    </div>
  );
}

function ExercisePicker({
  initialExercises,
  onCancel,
  onDone
}: {
  initialExercises: Exercise[];
  onCancel: () => void;
  onDone: (exercises: Exercise[]) => void;
}) {
  const [selectedExercises, setSelectedExercises] = useState(() =>
    initialExercises.map((exercise) => ({ ...exercise }))
  );
  const [filter, setFilter] = useState<TargetArea | typeof copy.library.all>(copy.library.all);
  const [detailGroupId, setDetailGroupId] = useState<string | null>(null);
  const filteredGroups = useMemo(
    () => filter === copy.library.all
      ? libraryExerciseGroups()
      : libraryExerciseGroups().filter((group) => groupMatchesCategory(group, filter)),
    [filter]
  );

  function groupIsSelected(group: ExerciseGroup) {
    return group.exerciseIds.every((exerciseId) =>
      selectedExercises.some((exercise) => exercise.id === exerciseId)
    );
  }

  function toggleGroup(group: ExerciseGroup) {
    const groupIds = new Set(group.exerciseIds);
    if (groupIsSelected(group)) {
      if (selectedExercises.length <= group.exerciseIds.length) return;
      setSelectedExercises((current) => current.filter((exercise) => !groupIds.has(exercise.id)));
      return;
    }
    const existingIds = new Set(selectedExercises.map((exercise) => exercise.id));
    const additions = exerciseGroupExercises(group)
      .filter((exercise) => !existingIds.has(exercise.id))
      .map((exercise) => ({ ...exercise }));
    setSelectedExercises((current) => [...current, ...additions]);
  }

  if (detailGroupId) {
    const detailGroup = exerciseGroupById(detailGroupId);
    if (detailGroup) {
      return (
        <LibraryDetail
          group={detailGroup}
          selectionMode
          selected={groupIsSelected(detailGroup)}
          onBack={() => setDetailGroupId(null)}
          onSelectionToggle={() => toggleGroup(detailGroup)}
        />
      );
    }
  }

  return (
    <div className="animate-rise space-y-5 pb-28">
      <header className="grid grid-cols-[44px_1fr_64px] items-center gap-2">
        <button aria-label="取消修改" className="grid h-11 w-11 place-items-center rounded-full border border-black/10 bg-white/80 shadow-sm" onClick={onCancel} type="button"><ArrowLeft size={19} /></button>
        <div className="text-center"><p className="text-xs font-semibold text-leaf">修改动作组</p><h1 className="text-lg font-semibold">从动作库选择动作</h1></div>
        <span className="text-right text-sm font-semibold text-leaf">{selectedExercises.length} 个</span>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {([copy.library.all, ...exerciseCategories] as const).map((item) => (
          <button className={cn("shrink-0 rounded-full px-4 py-2 text-sm transition", filter === item ? "bg-leaf text-white" : "bg-white/75 text-muted")} key={item} onClick={() => setFilter(item)} type="button">{item}</button>
        ))}
      </div>

      <section className="space-y-3">
        {filteredGroups.map((group) => {
          const exercise = primaryExerciseForGroup(group);
          const selected = groupIsSelected(group);
          return (
            <article className={cn("relative overflow-hidden rounded-[12px] border bg-white/85 shadow-soft", selected ? "border-leaf/60" : "border-transparent")} key={group.id}>
              <button className="grid w-full grid-cols-[112px_1fr] gap-3 p-3 pr-16 text-left" onClick={() => setDetailGroupId(group.id)} type="button">
                <ExerciseImage exercise={exercise} />
                <div className="min-w-0"><h2 className="font-semibold">{group.name}</h2><p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">{exercise.category} · {exercise.targetMuscles}</p><p className="mt-2 text-xs text-ink/70">{copy.common.durationSec(exercise.duration)} · {exercise.posture} · {exercise.space} · {exercise.intensity}</p></div>
              </button>
              <button aria-label={selected ? `移出${group.name}` : `加入${group.name}`} className={cn("absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full shadow-sm", selected ? "bg-leaf text-white" : "bg-moss text-leaf")} onClick={() => toggleGroup(group)} type="button">{selected ? <Check size={19} /> : <Plus size={19} />}</button>
            </article>
          );
        })}
      </section>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-black/5 bg-paper/95 px-5 py-4 backdrop-blur">
        <button className="mx-auto block min-h-14 w-full max-w-md rounded-full bg-leaf px-5 py-4 font-semibold text-white shadow-soft" onClick={() => onDone(selectedExercises)} type="button">完成修改（{selectedExercises.length} 个动作）</button>
      </div>
    </div>
  );
}

function Stat({ label, value, quiet = false }: { label: string; value: string; quiet?: boolean }) {
  return (
    <div className={cn("rounded-[8px] p-4", quiet ? "border border-black/5 bg-paper/70" : "bg-white/75 shadow-soft")}>
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
    </div>
  );
}

function ExercisePlayer({
  session,
  likedExerciseGroups,
  onComplete,
  onExit,
  onToggleLike
}: {
  session: AppView & { name: "player" };
  likedExerciseGroups: LikedExerciseGroups;
  onComplete: (actualCompletedSec: number, completedExerciseIds?: string[]) => void;
  onExit: (actualCompletedSec: number, currentExerciseIndex: number) => void;
  onToggleLike: (groupId: string) => void;
}) {
  const [index, setIndex] = useState(0);
  const initialExercise = session.session.exercises[0];
  const [phase, setPhase] = useState<"preparation" | "transition" | "exercise">("preparation");
  const [preparationRemainingSec, setPreparationRemainingSec] = useState(5);
  const [transitionRemainingSec, setTransitionRemainingSec] = useState(3);
  const [remainingSec, setRemainingSec] = useState(() => initialExercise?.duration ?? 15);
  const [running, setRunning] = useState(true);
  const [actualCompletedSec, setActualCompletedSec] = useState(0);
  const [finished, setFinished] = useState(false);
  const [tipsOpen, setTipsOpen] = useState(false);
  const wasRunningBeforeTips = useRef(true);
  const completedExerciseIds = useRef<string[]>([]);
  const current = session.session.exercises[index];
  const total = session.session.exercises.length;
  const exerciseDurationSec = current.duration;
  const currentGroupId = groupIdForExercise(current.id);
  const currentLiked = Boolean(likedExerciseGroups[currentGroupId]);
  const usesLibrarySideTransition = session.session.source === "single" && total > 1;

  function recordCompletedExercise(exerciseId: string) {
    if (completedExerciseIds.current.includes(exerciseId)) return completedExerciseIds.current;
    completedExerciseIds.current = [...completedExerciseIds.current, exerciseId];
    return completedExerciseIds.current;
  }

  useEffect(() => {
    if (!running || finished) return undefined;
    const timer = window.setInterval(() => {
      if (phase === "preparation") {
        setPreparationRemainingSec((currentRemaining) => {
          if (currentRemaining > 1) return currentRemaining - 1;
          setPhase("exercise");
          setRemainingSec(current.duration);
          return 0;
        });
        return;
      }
      if (phase === "transition") {
        setTransitionRemainingSec((currentRemaining) => {
          if (currentRemaining > 1) return currentRemaining - 1;
          showExercise(Math.min(index + 1, total - 1));
          return 3;
        });
        return;
      }
      setRemainingSec((currentRemaining) => {
        const nextRemaining = currentRemaining - 1;
        setActualCompletedSec((currentActual) => {
          const nextActual = currentActual + 1;
          const nextCompletedIds = nextRemaining <= 0
            ? recordCompletedExercise(current.id)
            : completedExerciseIds.current;
          if (nextRemaining <= 0 && index >= total - 1) {
            setFinished(true);
            setRunning(false);
            window.setTimeout(() => onComplete(nextActual, nextCompletedIds), 0);
          }
          return nextActual;
        });

        if (nextRemaining <= 0) {
          if (index < total - 1) {
            if (usesLibrarySideTransition) {
              window.setTimeout(() => {
                setTipsOpen(false);
                setPhase("transition");
                setTransitionRemainingSec(3);
              }, 0);
            } else {
              window.setTimeout(() => showExercise(index + 1), 0);
            }
          }
          return current.duration;
        }
        return nextRemaining;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [current.id, current.duration, finished, index, onComplete, phase, running, total, usesLibrarySideTransition]);

  function startExercise() {
    setPhase("exercise");
    setRemainingSec(current.duration);
    setRunning(true);
  }

  function showExercise(nextIndex: number) {
    const nextExercise = session.session.exercises[nextIndex];
    if (!nextExercise) return;
    setIndex(nextIndex);
    setTipsOpen(false);
    setRunning(true);
    setPhase("exercise");
    setRemainingSec(nextExercise.duration);
  }

  function exitToHome() {
    setRunning(false);
    onExit(actualCompletedSec, index);
  }

  function previous() {
    if (index <= 0) return;
    showExercise(index - 1);
  }

  function skip() {
    if (index >= total - 1) {
      setFinished(true);
      setRunning(false);
      onComplete(actualCompletedSec, completedExerciseIds.current);
      return;
    }
    if (usesLibrarySideTransition) {
      setTipsOpen(false);
      setPhase("transition");
      setTransitionRemainingSec(3);
      setRunning(true);
      return;
    }
    showExercise(index + 1);
  }

  function cancelNextSide() {
    setFinished(true);
    setRunning(false);
    onComplete(actualCompletedSec, completedExerciseIds.current);
  }

  function restart() {
    setRemainingSec(exerciseDurationSec);
    setRunning(true);
  }

  function openTips() {
    wasRunningBeforeTips.current = running;
    setRunning(false);
    setTipsOpen(true);
  }

  function closeTips() {
    setTipsOpen(false);
    setRunning(wasRunningBeforeTips.current);
  }

  const progressPercent = ((exerciseDurationSec - remainingSec) / exerciseDurationSec) * 100;

  if (phase === "preparation") {
    return (
      <div className="flex min-h-[calc(100svh-24px)] animate-rise flex-col gap-4 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
        <header className="grid grid-cols-[44px_1fr_90px] items-center gap-2">
          <button
            aria-label={copy.common.back}
            className="grid h-11 w-11 place-items-center rounded-full border border-black/10 bg-white/80 shadow-sm"
            onClick={exitToHome}
            type="button"
          >
            <ArrowLeft size={18} />
          </button>
          <span className="text-center text-sm font-semibold text-leaf">{copy.player.progress(index + 1, total)}</span>
          <button className="rounded-full border border-black/5 bg-white/80 px-3 py-2 text-xs font-semibold shadow-sm" onClick={openTips} type="button">{copy.player.tips}</button>
        </header>

        <section className="text-center">
          <p className="text-sm font-semibold text-leaf">准备一下，马上开始</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">{current.name}</h1>
        </section>

        <ExerciseImage exercise={current} immersive />
        <div className="text-center">
          <p className="text-7xl font-bold leading-none tabular-nums text-leaf" aria-label={`${preparationRemainingSec} ${copy.common.seconds}`}>{preparationRemainingSec}</p>
          <p className="mt-2 text-sm text-muted">{copy.common.seconds}</p>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-leaf transition-all" style={{ width: `${((5 - preparationRemainingSec) / 5) * 100}%` }} /></div>

        <button
          className="mt-auto min-h-14 w-full rounded-full bg-leaf px-5 py-4 text-base font-semibold text-white shadow-soft transition active:scale-[0.99]"
          onClick={startExercise}
          type="button"
        >
          立即开始
        </button>
        {tipsOpen && (
          <div className="fixed inset-0 z-30 grid place-items-center bg-ink/20 px-5 py-8 backdrop-blur-sm">
            <section aria-modal="true" className="max-h-[80svh] w-full max-w-md overflow-y-auto rounded-[22px] border border-white/60 bg-white/90 p-5 shadow-[0_24px_80px_rgba(47,50,45,0.22)]" role="dialog">
              <div className="flex items-center justify-between gap-4"><h2 className="text-xl font-semibold">{copy.player.tips}</h2><button aria-label={copy.player.closeTips} className="grid h-10 w-10 place-items-center rounded-full bg-paper text-muted" onClick={closeTips} type="button"><X size={18} /></button></div>
              <div className="mt-4 grid gap-3"><DetailPanel icon={<ClipboardList size={15} />} title={copy.player.instructionTitle} items={current.instructions} /><DetailPanel icon={<ShieldCheck size={15} />} title={copy.player.safetyTitle} items={current.safetyTips} safety /></div>
            </section>
          </div>
        )}
      </div>
    );
  }

  if (phase === "transition") {
    const nextExercise = session.session.exercises[Math.min(index + 1, total - 1)];
    return (
      <div className="flex min-h-[calc(100svh-24px)] animate-rise flex-col items-center justify-center gap-8 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] text-center">
        <div className="space-y-3">
          <p className="text-sm font-semibold text-leaf">{copy.player.sideTransitionLabel}</p>
          <h1 className="text-3xl font-semibold tracking-normal">
            {copy.player.sideTransitionTitle(nextExercise?.name ?? "")}
          </h1>
          <p className="text-8xl font-semibold leading-none tabular-nums text-leaf">
            {transitionRemainingSec}
          </p>
        </div>
        {nextExercise && <ExerciseImage exercise={nextExercise} />}
        <button
          className="mt-6 rounded-full bg-white/80 px-5 py-3 text-sm font-semibold text-muted shadow-sm"
          onClick={cancelNextSide}
          type="button"
        >
          {copy.player.cancelNextSide}
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[calc(100svh-24px)] animate-rise flex-col gap-2 pb-[calc(env(safe-area-inset-bottom)+0.35rem)]">
      <header className="grid grid-cols-[44px_1fr_90px] items-center gap-2 pb-1">
        <button
          aria-label={copy.common.back}
          className="grid h-11 w-11 place-items-center rounded-full border border-black/10 bg-white/80 shadow-sm"
          onClick={exitToHome}
          type="button"
        >
          <ArrowLeft size={18} />
        </button>
        <span className="text-center text-sm font-semibold text-leaf">{copy.player.progress(index + 1, total)}</span>
        <button className="rounded-full border border-black/5 bg-white/80 px-3 py-2 text-xs font-semibold shadow-sm" onClick={openTips} type="button">{copy.player.tips}</button>
      </header>

      <h1 className="px-2 py-2 text-center text-[28px] font-bold leading-tight tracking-normal">{current.name}</h1>

      <section className="flex flex-1 flex-col justify-start gap-3 py-0">
        <div className="relative">
          <ExerciseImage exercise={current} immersive />
          <LikeButton className="absolute right-3 top-3" liked={currentLiked} label={currentLiked ? copy.common.unlike : copy.common.like} onClick={() => onToggleLike(currentGroupId)} />
        </div>
        <div className="text-center">
          <p className="text-7xl font-bold leading-none tabular-nums text-leaf">{remainingSec}</p>
          <p className="mt-1 text-xs text-muted">{copy.common.seconds}</p>
        </div>
        <div className="relative mt-1 h-2 rounded-full bg-white">
          <div className="h-full rounded-full bg-leaf transition-all duration-500" style={{ width: `${progressPercent}%` }} />
          <span aria-hidden="true" className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 text-base transition-all duration-500" style={{ left: `${Math.min(98, Math.max(2, progressPercent))}%` }}>🔋</span>
        </div>
      </section>

      <div className="grid grid-cols-4 gap-2 rounded-[8px] bg-paper/85 pt-1 backdrop-blur">
        <IconButton
          disabled={index === 0}
          icon={<ArrowLeft size={18} />}
          label={copy.player.previous}
          onClick={previous}
        />
        <IconButton
          icon={running ? <Pause size={18} /> : <Play size={18} />}
          label={running ? copy.player.pause : copy.player.resume}
          onClick={() => setRunning((currentRunning) => !currentRunning)}
          primary
        />
        <IconButton icon={<SkipForward size={18} />} label={copy.player.skip} onClick={skip} />
        <IconButton icon={<RotateCcw size={18} />} label={copy.player.restart} onClick={restart} />
      </div>

      {tipsOpen && (
        <div className="fixed inset-0 z-30 grid place-items-center bg-ink/20 px-5 py-8 backdrop-blur-sm">
          <section aria-modal="true" className="max-h-[80svh] w-full max-w-md overflow-y-auto rounded-[22px] border border-white/60 bg-white/75 p-5 shadow-[0_24px_80px_rgba(47,50,45,0.22)] backdrop-blur-xl" role="dialog">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold">{copy.player.tips}</h2>
              <button
                aria-label={copy.player.closeTips}
                className="grid h-10 w-10 place-items-center rounded-full bg-white/80 text-muted"
                onClick={closeTips}
                type="button"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mt-4 grid gap-3">
              <DetailPanel icon={<ClipboardList size={15} />} title={copy.player.instructionTitle} items={current.instructions} />
              <DetailPanel icon={<ShieldCheck size={15} />} title={copy.player.safetyTitle} items={current.safetyTips} safety />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function DetailPanel({
  icon,
  title,
  items,
  safety = false
}: {
  icon: ReactNode;
  title: string;
  items: string[];
  safety?: boolean;
}) {
  return (
    <section className={cn("rounded-[8px] px-4 py-3", safety ? "bg-coral/15" : "bg-white/85 shadow-sm")}>
      <div className="flex items-center gap-2">
        <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full text-white", safety ? "bg-coral" : "bg-leaf")}>
          {icon}
        </span>
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-5 text-ink/80">
        {(safety ? items.slice(0, 2) : items).map((item) => <li key={item}>{item}</li>)}
      </ul>
    </section>
  );
}

function IconButton({
  icon,
  label,
  onClick,
  primary = false,
  disabled = false
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  primary?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      className={cn(
        "flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-[8px] text-xs font-semibold transition",
        primary ? "bg-leaf text-white shadow-soft" : "bg-white/85 text-ink shadow-sm",
        disabled && "cursor-not-allowed opacity-40"
      )}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {icon}
      {label}
    </button>
  );
}

function LikeButton({
  liked,
  label,
  onClick,
  className
}: {
  liked: boolean;
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      aria-label={label}
      className={cn(
        "grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/85 text-muted shadow-sm transition hover:bg-white",
        liked && "text-[#d94d5c]",
        className
      )}
      onClick={onClick}
      type="button"
    >
      <Heart fill={liked ? "currentColor" : "none"} size={19} />
    </button>
  );
}

function DetailHeroImage({ exercise }: { exercise: Exercise }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [exercise.id, exercise.coverImage]);

  return (
    <div className="relative h-[clamp(240px,30svh,280px)] w-full overflow-hidden rounded-[22px] bg-white shadow-soft">
      {!failed ? (
        <img
          alt={exercise.name}
          className="h-full w-full object-cover object-center"
          onError={() => setFailed(true)}
          src={exercise.coverImage}
        />
      ) : (
        <div aria-label={copy.player.imagePlaceholder} className="grid h-full w-full place-items-center bg-moss/70 px-5 text-center text-sm leading-6 text-leaf">
          {copy.player.imagePlaceholder}
        </div>
      )}
    </div>
  );
}

function Completion({
  session,
  sessions,
  mode,
  likedExerciseGroups,
  onHome,
  onAgain,
  onToggleLike
}: {
  session: CompletedSession;
  sessions: CompletedSession[];
  mode: "regular" | "single" | "replay";
  likedExerciseGroups: LikedExerciseGroups;
  onHome: () => void;
  onAgain: () => void;
  onToggleLike: (groupId: string) => void;
}) {
  const modeLabel =
    mode === "single" ? copy.completion.singleMode : mode === "replay" ? copy.completion.replayMode : copy.completion.regularMode;
  const primaryLabel = mode === "regular" ? copy.completion.regularPrimary : copy.completion.replayPrimary;
  const secondaryLabel =
    mode === "single" ? copy.completion.backLibrary : mode === "replay" ? copy.completion.backProfile : copy.completion.again;
  const feedback =
    mode === "regular"
      ? copy.completion.regularFeedback
      : copy.completion.feedback[session.movementCount % copy.completion.feedback.length];
  const primaryGroupId = session.exerciseIds[0] ? groupIdForExercise(session.exerciseIds[0]) : undefined;

  return (
    <div className="flex min-h-[calc(100svh-40px)] animate-rise flex-col justify-between gap-8 py-6">
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-moss text-leaf">
            <Check size={28} />
          </div>
          {primaryGroupId && (
            <LikeButton
              liked={Boolean(likedExerciseGroups[primaryGroupId])}
              label={likedExerciseGroups[primaryGroupId] ? copy.common.unlike : copy.common.like}
              onClick={() => onToggleLike(primaryGroupId)}
            />
          )}
        </div>
        <div className="space-y-2">
          {mode !== "regular" && <p className="text-sm font-medium text-leaf">{modeLabel}</p>}
          <h1 className="text-4xl font-semibold leading-tight tracking-normal">
            {primaryLabel} {formatDuration(session.actualCompletedSec)}
          </h1>
          <p className="text-base leading-7 text-muted">{feedback}</p>
          <p className="text-base font-semibold leading-7 text-leaf">{copy.completion.sittingBreakFeedback}</p>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <Stat label={copy.completion.todayTotal} value={formatDuration(todayTotalSec(sessions))} />
        <Stat label={copy.completion.streak} value={copy.common.days(calculateStreak(sessions))} />
        <Stat label={copy.completion.movementCount} value={copy.common.movements(session.movementCount)} />
        <Stat label={copy.completion.targetAreas} value={copy.common.targetPriority(areaLabels(session.targetAreas))} />
      </section>

      <div className="grid grid-cols-2 gap-3">
        <button className="rounded-full bg-moss px-4 py-4 font-semibold text-ink" onClick={onHome} type="button">
          {copy.completion.home}
        </button>
        <button className="rounded-full bg-leaf px-4 py-4 font-semibold text-white shadow-soft" onClick={onAgain} type="button">
          {secondaryLabel}
        </button>
      </div>
    </div>
  );
}

function LibraryScreen({
  likedExerciseGroups,
  savedMovementGroups,
  onOpen,
  onOpenSavedGroup,
  onToggleLike
}: {
  likedExerciseGroups: LikedExerciseGroups;
  savedMovementGroups: SavedMovementGroup[];
  onOpen: (group: ExerciseGroup) => void;
  onOpenSavedGroup: (group: SavedMovementGroup) => void;
  onToggleLike: (groupId: string) => void;
}) {
  const [filter, setFilter] = useState<
    TargetArea | typeof copy.library.all | typeof copy.library.myGroups
  >(copy.library.all);
  const filtered = useMemo(() => {
    if (filter === copy.library.myGroups) return [];
    const groups = filter === copy.library.all
      ? libraryExerciseGroups()
      : libraryExerciseGroups().filter((group) => groupMatchesCategory(group, filter));
    return sortGroupsByLike(groups, likedExerciseGroups);
  }, [filter, likedExerciseGroups]);

  return (
    <div className="animate-rise space-y-5">
      <header className="space-y-2">
        <p className="text-sm font-medium text-leaf">{copy.library.eyebrow}</p>
        <h1 className="text-3xl font-semibold tracking-normal">{copy.library.title}</h1>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {([copy.library.all, ...exerciseCategories, copy.library.myGroups] as const).map((item) => (
          <button
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm transition",
              filter === item ? "bg-leaf text-white" : "bg-white/75 text-muted"
            )}
            key={item}
            onClick={() => setFilter(item)}
            type="button"
          >
            {item}
          </button>
        ))}
      </div>

      {filter === copy.library.myGroups ? (
        <section className="space-y-3">
          {savedMovementGroups.length === 0 ? (
            <div className="rounded-[18px] bg-white/75 p-6 text-center shadow-soft"><LibraryBig className="mx-auto text-leaf" size={30} /><h2 className="mt-3 font-semibold">还没有保存的动作组</h2><p className="mt-2 text-sm leading-6 text-muted">从首页生成动作组，在预览页调整后保存，就会出现在这里。</p></div>
          ) : savedMovementGroups.map((group) => {
            const groupExercises = group.exerciseIds.flatMap((exerciseId) => {
              const exercise = exercises.find((item) => item.id === exerciseId);
              return exercise ? [exercise] : [];
            });
            const totalDuration = group.durations.reduce((total, duration) => total + duration, 0);
            return (
              <button className="w-full rounded-[16px] bg-white/85 p-4 text-left shadow-soft transition hover:-translate-y-0.5" key={group.id} onClick={() => onOpenSavedGroup(group)} type="button">
                <div className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-semibold">{group.name}</h2><p className="mt-1 text-xs text-muted">{copy.common.durationSec(totalDuration)} · {copy.common.movementItems(group.exerciseIds.length)}</p></div><ChevronRight className="mt-1 shrink-0 text-leaf" size={20} /></div>
                <div className="mt-3 flex -space-x-2">{groupExercises.slice(0, 5).map((exercise) => <img alt="" className="h-10 w-10 rounded-full border-2 border-white object-cover" key={exercise.id} src={exercise.coverImage} />)}</div>
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-ink/75">{groupExercises.map((exercise) => exercise.name).join(" · ")}</p>
              </button>
            );
          })}
        </section>
      ) : (
        <section className="space-y-3">
          {filtered.map((group) => {
          const exercise = primaryExerciseForGroup(group);
          const isLiked = Boolean(likedExerciseGroups[group.id]);
          return (
          <article className="relative overflow-hidden rounded-[8px] bg-white/80 shadow-soft" key={group.id}>
            <button
              className="grid w-full grid-cols-[112px_1fr] gap-3 p-3 pr-14 text-left"
              onClick={() => onOpen(group)}
              type="button"
            >
              <ExerciseImage exercise={exercise} />
              <div className="min-w-0">
                <h2 className="font-semibold">{group.name}</h2>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">
                  {exercise.category} · {exercise.targetMuscles}
                </p>
                <p className="mt-2 text-xs text-ink/70">
                  {copy.common.durationSec(exercise.duration)} · {exercise.posture} · {exercise.space} · {exercise.intensity}
                </p>
              </div>
            </button>
            <LikeButton
              className="absolute right-3 top-3"
              liked={isLiked}
              label={isLiked ? copy.common.unlike : copy.common.like}
              onClick={() => onToggleLike(group.id)}
            />
          </article>
          );
          })}
        </section>
      )}
    </div>
  );
}

function LibraryDetail({
  group,
  likedAt,
  onBack,
  onStart,
  onToggleLike,
  selectionMode = false,
  selected = false,
  onSelectionToggle
}: {
  group: ExerciseGroup;
  likedAt?: string;
  onBack: () => void;
  onStart?: (exercisesForSession: Exercise[]) => void;
  onToggleLike?: () => void;
  selectionMode?: boolean;
  selected?: boolean;
  onSelectionToggle?: () => void;
}) {
  const primaryExercise = primaryExerciseForGroup(group);
  const sessionExercises = exerciseGroupExercises(group);

  return (
    <div className="flex min-h-[calc(100svh-24px)] animate-rise flex-col gap-5 pb-[calc(env(safe-area-inset-bottom)+0.3rem)]">
      <header className="flex items-center justify-between pb-0.5">
        <button
          className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-1 text-lg font-semibold text-ink"
          onClick={onBack}
          type="button"
        >
          <ArrowLeft size={22} strokeWidth={2.4} />
          {copy.common.back}
        </button>
        {selectionMode ? (
          <span className="rounded-full bg-moss px-3 py-1.5 text-xs font-semibold text-leaf">仅查看动作介绍</span>
        ) : onToggleLike ? (
          <LikeButton
            className="h-10 w-10 bg-transparent shadow-none"
            liked={Boolean(likedAt)}
            label={likedAt ? copy.common.unlike : copy.common.like}
            onClick={onToggleLike}
          />
        ) : null}
      </header>

      <DetailHeroImage exercise={primaryExercise} />

      <section className="space-y-3 px-1 py-1">
        <div className="space-y-2.5">
          <h1 className="text-[29px] font-semibold leading-[1.1] tracking-normal text-ink">
            {group.name}
          </h1>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm leading-6 text-muted">
            <Leaf className="text-leaf" size={20} />
            <span>{primaryExercise.category}</span>
            <span aria-hidden="true">·</span>
            <span>{primaryExercise.targetMuscles}</span>
            <span aria-hidden="true">·</span>
            <span>{primaryExercise.posture}</span>
            <span aria-hidden="true">·</span>
            <span>{primaryExercise.space}</span>
            <span aria-hidden="true">·</span>
            <span>{primaryExercise.intensity}</span>
          </p>
        </div>
      </section>

      <section className="border-t border-black/5 px-1 pt-5">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-leaf text-white">
            <ClipboardList size={17} />
          </span>
          <h2 className="text-xl font-semibold tracking-normal">{copy.library.instructionTitle}</h2>
        </div>
        <ol className="mt-4 space-y-3">
          {primaryExercise.instructions.map((item, index) => (
            <li className="grid grid-cols-[29px_1fr] items-start gap-3 text-base leading-[1.42] text-ink/85" key={item}>
              <span className="grid h-7 w-7 place-items-center rounded-full bg-leaf text-sm font-semibold text-white">
                {index + 1}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-[18px] bg-coral/15 px-4 py-4">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-coral text-white">
            <ShieldCheck size={17} />
          </span>
          <h2 className="text-xl font-semibold tracking-normal text-[#a85f51]">{copy.player.safetyTitle}</h2>
        </div>
        <ul className="mt-3 list-disc space-y-1.5 pl-6 text-base leading-7 text-ink/80">
          {primaryExercise.safetyTips.slice(0, 2).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      {selectionMode && onSelectionToggle ? (
        <button className={cn("min-h-13 w-full rounded-full px-5 py-3 text-lg font-semibold shadow-soft transition active:scale-[0.99]", selected ? "bg-moss text-leaf" : "bg-leaf text-white")} onClick={onSelectionToggle} type="button">
          {selected ? "从动作组移除" : "加入动作组"}
        </button>
      ) : onStart ? (
        <button className="min-h-13 w-full rounded-full bg-leaf px-5 py-3 text-lg font-semibold text-white shadow-soft transition active:scale-[0.99]" onClick={() => onStart(sessionExercises)} type="button">{copy.library.startNow}</button>
      ) : null}
    </div>
  );
}

function ReminderSettingsScreen({ onBack }: { onBack: () => void }) {
  const [settings, setSettings] = useState<ReminderSettings>(() => loadReminderSettings());
  const [saved, setSaved] = useState(false);

  function updateTime(index: number, value: string) {
    setSettings((current) => ({
      ...current,
      times: current.times.map((time, timeIndex) => (timeIndex === index ? value : time))
    }));
    setSaved(false);
  }

  function persist() {
    const normalized = { ...settings, times: Array.from(new Set(settings.times.filter(Boolean))).sort() };
    saveReminderSettings(normalized);
    setSettings(normalized);
    setSaved(true);
  }

  return (
    <div className="animate-rise space-y-6 pb-8">
      <header className="grid grid-cols-[44px_1fr_44px] items-center">
        <button aria-label={copy.common.back} className="grid h-11 w-11 place-items-center rounded-full border border-black/10 bg-white/80 shadow-sm" onClick={onBack} type="button"><ArrowLeft size={19} /></button>
        <h1 className="text-center text-lg font-semibold">{copy.reminder.title}</h1>
      </header>

      <section className="overflow-hidden rounded-[24px] bg-white/85 shadow-soft">
        <div className="flex items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-4">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-moss text-leaf"><Bell size={26} /></span>
            <div><h2 className="text-xl font-semibold">{copy.reminder.title}</h2><p className="mt-1 text-sm text-muted">{copy.reminder.subtitle}</p></div>
          </div>
          <button aria-label="提醒开关" className={cn("relative h-8 w-14 shrink-0 rounded-full transition", settings.enabled ? "bg-leaf" : "bg-muted/30")} onClick={() => { setSettings((current) => ({ ...current, enabled: !current.enabled })); setSaved(false); }} type="button"><span className={cn("absolute top-1 h-6 w-6 rounded-full bg-white shadow-sm transition", settings.enabled ? "left-7" : "left-1")} /></button>
        </div>

        <div className={cn("border-t border-black/5 p-5 transition", !settings.enabled && "opacity-45")}>
          <p className="font-semibold text-muted">{copy.reminder.times}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {settings.times.map((time, index) => (
              <label className="flex items-center gap-2 rounded-[14px] bg-paper px-3 py-2" key={`${index}-${time}`}>
                <input aria-label={`提醒时间 ${index + 1}`} className="bg-transparent font-semibold text-leaf outline-none" disabled={!settings.enabled} onChange={(event) => updateTime(index, event.target.value)} type="time" value={time} />
                <button aria-label={`删除 ${time}`} className="grid h-6 w-6 place-items-center rounded-full bg-muted/15" disabled={!settings.enabled} onClick={() => { setSettings((current) => ({ ...current, times: current.times.filter((_, itemIndex) => itemIndex !== index) })); setSaved(false); }} type="button"><X size={13} /></button>
              </label>
            ))}
            <button className="inline-flex items-center gap-1 rounded-[14px] border border-dashed border-leaf/40 px-4 py-3 text-sm font-semibold text-leaf disabled:opacity-40" disabled={!settings.enabled || settings.times.length >= 5} onClick={() => { setSettings((current) => ({ ...current, times: [...current.times, "18:00"] })); setSaved(false); }} type="button"><Plus size={16} />{copy.reminder.addTime}</button>
          </div>
        </div>
      </section>

      <p className="rounded-[16px] bg-moss/55 px-4 py-3 text-sm leading-6 text-muted">有点没电了吗？动一下再继续。一次 30 秒也很好。</p>
      <p className="text-xs leading-5 text-muted">{copy.reminder.gentleNote}</p>
      <button className="w-full rounded-full bg-leaf px-5 py-4 font-semibold text-white shadow-soft" onClick={persist} type="button">{saved ? "已保存" : copy.reminder.save}</button>
    </div>
  );
}

function ProfileScreen({
  preferences,
  sessions,
  todaySec,
  streak,
  onEdit,
  onReminder
}: {
  preferences: Preferences;
  sessions: CompletedSession[];
  todaySec: number;
  streak: number;
  onEdit: () => void;
  onReminder: () => void;
}) {
  const [widgetOpen, setWidgetOpen] = useState(false);
  const [musicOn, setMusicOn] = useState(true);
  const [vibrationOn, setVibrationOn] = useState(true);
  const completedDates = useMemo(() => new Set(sessions.map((session) => session.date)), [sessions]);
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthLabel = `${year}年${month + 1}月`;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingEmptyDays = (new Date(year, month, 1).getDay() + 6) % 7;
  const calendarCells = Array.from({ length: leadingEmptyDays + daysInMonth }, (_, index) => {
    const day = index - leadingEmptyDays + 1;
    if (day < 1) return null;
    const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return { day, completed: completedDates.has(date) };
  });
  return (
    <div className="animate-rise space-y-5">
      <header className="flex flex-col items-center pb-2 pt-2 text-center">
        <div className="grid h-24 w-24 place-items-center rounded-[32px] bg-gradient-to-br from-moss to-[#a8b99c] text-leaf shadow-soft">
          <Leaf size={42} />
        </div>
        <h1 className="mt-3 text-3xl font-semibold">hi</h1>
        <p className="text-sm text-muted">MicroMove 用户</p>
      </header>

      <section className="rounded-[22px] bg-white/85 p-5 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-base font-semibold text-muted">{copy.profile.cumulativeDays}</p>
            <p className="mt-2 text-4xl font-bold">{completedDates.size}<span className="ml-1 text-xl">天</span></p>
            <p className="mt-4 text-sm text-muted">{completedDates.size ? "每一次短短的活动都算数" : "你还没有开始呢"}</p>
          </div>
          <div className="w-[190px]">
            <p className="mb-2 text-right text-xs font-semibold text-muted">{monthLabel}</p>
            <div className="grid grid-cols-7 gap-1">
              {calendarCells.map((cell, index) => (
                <span aria-label={cell ? `${cell.day}日${cell.completed ? "已完成" : ""}` : undefined} className={cn("grid aspect-square place-items-center rounded-[5px] text-[9px]", cell?.completed ? "bg-leaf font-semibold text-white" : cell ? "bg-moss/55 text-muted" : "bg-transparent")} key={index}>{cell?.day}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-[22px] bg-white/85 p-4 shadow-soft">
        <div>
          <p className="text-base font-semibold text-muted">{copy.profile.preferencesAndRecords}</p>
          <p className="mt-2 text-xs text-muted">{copy.profile.currentPreferences}</p>
          <p className="mt-1 text-sm font-semibold leading-6">{fullPreferenceSummary(preferences)}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Stat label={copy.profile.todayTotal} value={formatDuration(todaySec)} />
          <Stat label={copy.profile.streak} value={copy.common.days(streak)} />
        </div>
        <button className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-leaf px-4 py-4 text-sm font-semibold text-white" onClick={onEdit} type="button">
          <SlidersHorizontal size={17} />{copy.profile.editPreferences}
        </button>
      </section>

      <section className="rounded-[22px] bg-white/85 p-4 shadow-soft">
        <p className="mb-2 text-base font-semibold text-muted">{copy.profile.settings}</p>
        <button className="flex w-full items-center justify-between border-b border-black/5 py-4 text-left font-semibold" onClick={onReminder} type="button">
          <span className="inline-flex items-center gap-3"><Bell size={21} />{copy.profile.reminder}</span><ChevronRight size={19} />
        </button>
        <button className="flex w-full items-center justify-between py-4 text-left font-semibold" onClick={() => setWidgetOpen(true)} type="button">
          <span className="inline-flex items-center gap-3"><Grid2X2 size={21} />{copy.profile.addWidget}</span><ChevronRight size={19} />
        </button>
      </section>

      <section className="rounded-[22px] bg-white/85 p-4 shadow-soft">
        <p className="mb-2 text-base font-semibold text-muted">{copy.profile.soundAndVibration}</p>
        <VisualToggle icon={<Music2 size={21} />} label={copy.profile.music} active={musicOn} onClick={() => setMusicOn((current) => !current)} />
        <VisualToggle icon={<Vibrate size={21} />} label={copy.profile.vibration} active={vibrationOn} onClick={() => setVibrationOn((current) => !current)} />
        <p className="mt-3 text-xs leading-5 text-muted">当前仅展示设置样式，不播放声音或触发振动。</p>
      </section>

      {widgetOpen && (
        <div className="fixed inset-0 z-30 grid place-items-center bg-ink/25 px-5 backdrop-blur-sm">
          <section className="w-full max-w-sm rounded-[24px] bg-white p-5 text-center shadow-[0_24px_80px_rgba(47,50,45,0.24)]">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-[20px] bg-moss text-leaf"><Grid2X2 size={30} /></div>
            <h2 className="mt-4 text-xl font-semibold">{copy.profile.addWidget}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{copy.profile.widgetMessage}</p>
            <p className="mt-3 rounded-[12px] bg-paper px-3 py-3 text-xs leading-5 text-muted">这是 Web MVP 引导原型；原生 App 将在这里进入系统小组件添加流程。</p>
            <button className="mt-5 w-full rounded-full bg-leaf px-4 py-3 font-semibold text-white" onClick={() => setWidgetOpen(false)} type="button">知道了</button>
          </section>
        </div>
      )}
    </div>
  );
}

function VisualToggle({ icon, label, active, onClick }: { icon: ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button className="flex w-full items-center justify-between border-b border-black/5 py-3 last:border-0" onClick={onClick} type="button">
      <span className="inline-flex items-center gap-3 font-semibold">{icon}{label}</span>
      <span className={cn("relative h-7 w-12 rounded-full transition", active ? "bg-leaf" : "bg-muted/25")}><span className={cn("absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition", active ? "left-6" : "left-1")} /></span>
    </button>
  );
}

function ExerciseImage({
  exercise,
  large = false,
  immersive = false
}: {
  exercise: Exercise;
  large?: boolean;
  immersive?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const imageSrc = exercise.coverImage;

  useEffect(() => {
    setFailed(false);
  }, [exercise.id, imageSrc]);

  return (
    <div
      className={cn(
        "relative grid shrink-0 place-items-center overflow-hidden rounded-[8px]",
        immersive
          ? "w-full bg-white shadow-soft"
          : large
            ? "w-full bg-white shadow-soft"
            : "h-24 w-28 bg-moss/70"
      )}
    >
      {!failed ? (
        <img
          alt={exercise.name}
          className={immersive || large ? "block h-auto w-full" : "h-full w-full object-cover"}
          onError={() => setFailed(true)}
          src={imageSrc}
        />
      ) : large || immersive ? (
        <div aria-label={copy.player.imagePlaceholder} className="h-full w-full bg-white" />
      ) : (
        <span className="px-3 text-center text-xs leading-5 text-leaf">{copy.player.imagePlaceholder}</span>
      )}
    </div>
  );
}

export default App;
