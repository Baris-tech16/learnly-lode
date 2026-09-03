import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { initialMistakes, type Difficulty, type Mistake, type Subject } from "./quiz-data";

type NewMistake = {
  subject: Subject;
  topic: string;
  difficulty: Difficulty;
  question: string;
  notes: string;
  imageName?: string | undefined;
  choices?: string[] | undefined;
  correctIndex?: number | undefined;
};


type Store = {
  mistakes: Mistake[];
  xp: number;
  level: number;
  streak: number;
  xpIntoLevel: number;
  xpForLevel: number;
  pendingFirstPractice: Mistake[];
  weekReviewDue: Mistake[];
  dueIds: string[];
  addMistake: (m: NewMistake) => void;
  toggleMastery: (id: string) => void;
  awardXp: (amount: number) => void;
  registerAttempt: (id: string) => void;
};

const QuizContext = createContext<Store | null>(null);

const XP_PER_LEVEL = 400;
const DAY = 86_400_000;

export const REVIEW_INTERVAL_DAYS = 7;

function iso(date: Date) {
  return date.toISOString().slice(0, 10);
}

function daysAgo(n: number) {
  return iso(new Date(Date.now() - n * DAY));
}

export function needsFirstPractice(m: Mistake) {
  return m.attempts === 0 || !m.lastPracticedAt;
}

export function isWeekReviewDue(m: Mistake) {
  if (needsFirstPractice(m)) return false;
  const last = new Date(`${m.lastPracticedAt}T00:00:00Z`).getTime();
  if (Number.isNaN(last)) return false;
  return Date.now() - last >= REVIEW_INTERVAL_DAYS * DAY;
}

/** Deterministic demo history: days since the last practice, null = never practiced. */
const SEED_HISTORY: Record<string, number | null> = {
  m1: 7,
  m2: 9,
  m3: 2,
  m4: 12,
  m5: 3,
  m6: 8,
  m7: 1,
  m8: null,
};

const seededMistakes: Mistake[] = initialMistakes.map((m) => {
  const days = m.id in SEED_HISTORY ? SEED_HISTORY[m.id]! : 1;
  return days == null
    ? { ...m, attempts: 0, lastPracticedAt: null }
    : { ...m, lastPracticedAt: daysAgo(days) };
});

export function QuizProvider({ children }: { children: ReactNode }) {
  const [mistakes, setMistakes] = useState<Mistake[]>(seededMistakes);
  const [xp, setXp] = useState(1250);
  const [streak] = useState(7);

  const addMistake = useCallback((m: NewMistake) => {
    setMistakes((prev) => [
      {
        id: `m-${Date.now()}`,
        subject: m.subject,
        topic: m.topic || "General",
        difficulty: m.difficulty,
        mastery: "Unresolved",
        question: m.imageName ? `${m.question} (attached: ${m.imageName})` : m.question,
        choices: m.choices?.length ? m.choices : ["Option A", "Option B", "Option C", "Option D"],
        correctIndex: m.correctIndex ?? 0,

        hints: [
          "Restate the question in your own words — what exactly is being asked?",
          "Which formula or concept connects the given values to the unknown?",
          "Work through the substitution one step at a time and check your units.",
        ],
        solution:
          "Walk through your own reasoning and compare it with your note about why you got it wrong.",
        notes: m.notes,
        addedAt: new Date().toISOString().slice(0, 10),
        attempts: 0,
      },
      ...prev,
    ]);
  }, []);

  const toggleMastery = useCallback((id: string) => {
    setMistakes((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, mastery: m.mastery === "Mastered" ? "Unresolved" : "Mastered" } : m,
      ),
    );
  }, []);

  const registerAttempt = useCallback((id: string) => {
    setMistakes((prev) => prev.map((m) => (m.id === id ? { ...m, attempts: m.attempts + 1 } : m)));
  }, []);

  const awardXp = useCallback((amount: number) => setXp((v) => v + amount), []);

  const value = useMemo<Store>(
    () => ({
      mistakes,
      xp,
      level: Math.floor(xp / XP_PER_LEVEL) + 1,
      streak,
      xpIntoLevel: xp % XP_PER_LEVEL,
      xpForLevel: XP_PER_LEVEL,
      addMistake,
      toggleMastery,
      awardXp,
      registerAttempt,
    }),
    [mistakes, xp, streak, addMistake, toggleMastery, awardXp, registerAttempt],
  );

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}

export function useQuiz() {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error("useQuiz must be used within QuizProvider");
  return ctx;
}
