import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { initialMistakes, type Difficulty, type Mistake, type Subject } from "./quiz-data";
import { useAuth } from "./auth";
import {
  listMistakes,
  saveMistakes,
  updateMistake,
  type DbMistake,
  type NewDbMistake,
} from "./mistakes.functions";

type NewMistake = {
  subject: Subject;
  topic: string;
  difficulty: Difficulty;
  question: string;
  notes: string;
  imageName?: string | undefined;
  choices?: string[] | undefined;
  correctIndex?: number | undefined;
  hints?: string[] | undefined;
  solution?: string | undefined;
  source?: string | undefined;
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
  signedIn: boolean;
  addMistake: (m: NewMistake) => void;
  addMistakes: (items: NewMistake[]) => Promise<void>;
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
  const days: number | null = m.id in SEED_HISTORY ? (SEED_HISTORY[m.id] ?? null) : 1;
  return days === null
    ? { ...m, attempts: 0, lastPracticedAt: null }
    : { ...m, lastPracticedAt: daysAgo(days) };
});

const DEFAULT_HINTS = [
  "Restate the question in your own words — what exactly is being asked?",
  "Which formula or concept connects the given values to the unknown?",
  "Work through the substitution one step at a time and check your units.",
];
const DEFAULT_SOLUTION =
  "Walk through your own reasoning and compare it with your note about why you got it wrong.";

function fromDb(row: DbMistake): Mistake {
  return {
    id: row.id,
    subject: row.subject as Subject,
    topic: row.topic,
    difficulty: row.difficulty as Difficulty,
    mastery: row.mastery === "Mastered" ? "Mastered" : "Unresolved",
    question: row.question,
    choices: Array.isArray(row.choices) && row.choices.length ? row.choices : ["A", "B", "C", "D"],
    correctIndex: row.correct_index ?? 0,
    hints: Array.isArray(row.hints) && row.hints.length ? row.hints : DEFAULT_HINTS,
    solution: row.solution || DEFAULT_SOLUTION,
    notes: row.notes ?? "",
    addedAt: (row.created_at ?? "").slice(0, 10),
    attempts: row.attempts ?? 0,
    lastPracticedAt: row.last_practiced_at ?? null,
  };
}

function toDb(m: NewMistake): NewDbMistake {
  return {
    subject: m.subject,
    topic: m.topic || "General",
    difficulty: m.difficulty,
    question: m.imageName ? `${m.question} (attached: ${m.imageName})` : m.question,
    choices: m.choices?.length ? m.choices : ["Option A", "Option B", "Option C", "Option D"],
    correctIndex: m.correctIndex ?? 0,
    hints: m.hints?.length ? m.hints : DEFAULT_HINTS,
    solution: m.solution || DEFAULT_SOLUTION,
    notes: m.notes,
    source: m.source ?? "manual",
  };
}

function localMistake(m: NewMistake): Mistake {
  const db = toDb(m);
  return {
    id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    subject: m.subject,
    topic: db.topic,
    difficulty: m.difficulty,
    mastery: "Unresolved",
    question: db.question,
    choices: db.choices,
    correctIndex: db.correctIndex,
    hints: db.hints ?? DEFAULT_HINTS,
    solution: db.solution ?? DEFAULT_SOLUTION,
    notes: m.notes,
    addedAt: iso(new Date()),
    attempts: 0,
    lastPracticedAt: null,
  };
}

export function QuizProvider({ children }: { children: ReactNode }) {
  const { signedIn } = useAuth();
  const [mistakes, setMistakes] = useState<Mistake[]>(seededMistakes);
  const [xp, setXp] = useState(1250);
  const [streak] = useState(7);

  useEffect(() => {
    let cancelled = false;
    if (!signedIn) {
      setMistakes(seededMistakes);
      return;
    }
    void listMistakes()
      .then((rows) => {
        if (!cancelled) setMistakes(rows.map(fromDb));
      })
      .catch(() => {
        /* keep whatever is on screen */
      });
    return () => {
      cancelled = true;
    };
  }, [signedIn]);

  const addMistakes = useCallback(
    async (items: NewMistake[]) => {
      if (!items.length) return;
      if (!signedIn) {
        setMistakes((prev) => [...items.map(localMistake), ...prev]);
        return;
      }
      const saved = await saveMistakes({ data: { items: items.map(toDb) } });
      setMistakes((prev) => [...saved.map(fromDb), ...prev]);
    },
    [signedIn],
  );

  const addMistake = useCallback(
    (m: NewMistake) => {
      void addMistakes([m]);
    },
    [addMistakes],
  );

  const toggleMastery = useCallback(
    (id: string) => {
      let next = "Unresolved";
      setMistakes((prev) =>
        prev.map((m) => {
          if (m.id !== id) return m;
          next = m.mastery === "Mastered" ? "Unresolved" : "Mastered";
          return { ...m, mastery: next as Mistake["mastery"] };
        }),
      );
      if (signedIn) void updateMistake({ data: { id, mastery: next } }).catch(() => {});
    },
    [signedIn],
  );

  const registerAttempt = useCallback(
    (id: string) => {
      let attempts = 0;
      setMistakes((prev) =>
        prev.map((m) => {
          if (m.id !== id) return m;
          attempts = m.attempts + 1;
          return { ...m, attempts, lastPracticedAt: iso(new Date()) };
        }),
      );
      if (signedIn)
        void updateMistake({
          data: { id, attempts, lastPracticedAt: iso(new Date()) },
        }).catch(() => {});
    },
    [signedIn],
  );

  const awardXp = useCallback((amount: number) => setXp((v) => v + amount), []);

  const pendingFirstPractice = useMemo(
    () => mistakes.filter(needsFirstPractice),
    [mistakes],
  );
  const weekReviewDue = useMemo(() => mistakes.filter(isWeekReviewDue), [mistakes]);
  const dueIds = useMemo(
    () => [...pendingFirstPractice, ...weekReviewDue].map((m) => m.id),
    [pendingFirstPractice, weekReviewDue],
  );

  const value = useMemo<Store>(
    () => ({
      mistakes,
      xp,
      level: Math.floor(xp / XP_PER_LEVEL) + 1,
      streak,
      xpIntoLevel: xp % XP_PER_LEVEL,
      xpForLevel: XP_PER_LEVEL,
      pendingFirstPractice,
      weekReviewDue,
      dueIds,
      signedIn,
      addMistake,
      addMistakes,
      toggleMastery,
      awardXp,
      registerAttempt,
    }),
    [
      mistakes,
      xp,
      streak,
      pendingFirstPractice,
      weekReviewDue,
      dueIds,
      signedIn,
      addMistake,
      addMistakes,
      toggleMastery,
      awardXp,
      registerAttempt,
    ],
  );

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}


export function useQuiz() {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error("useQuiz must be used within QuizProvider");
  return ctx;
}
