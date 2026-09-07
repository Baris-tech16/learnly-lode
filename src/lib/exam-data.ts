import { generateSimilarQuestion, type Difficulty, type Mistake, type Subject } from "./quiz-data";

export type ExamQuestion = {
  id: string;
  subject: Subject;
  topic: string;
  difficulty: Difficulty;
  question: string;
  choices: string[];
  correctIndex: number;
  /** Step-by-step reasoning shown after the exam. */
  explanation: string[];
};

export const EXAM_LENGTH = 10;
export const EXAM_DURATIONS = [5, 10, 15, 20] as const;
export type ExamSource = "topic" | "vault" | "mixed";

function matchesTopic(m: Mistake, topic: string) {
  const q = topic.trim().toLowerCase();
  if (!q) return true;
  return (
    m.topic.toLowerCase().includes(q) ||
    m.subject.toLowerCase().includes(q) ||
    m.question.toLowerCase().includes(q)
  );
}

/**
 * Deterministic "AI" exam builder: picks matching vault material and expands it
 * with generated variations until the exam has EXAM_LENGTH questions.
 */
export function buildExam(pool: Mistake[], topic: string, source: ExamSource): ExamQuestion[] {
  const matched = pool.filter((m) => matchesTopic(m, topic));
  const base = (matched.length ? matched : pool).slice();
  if (!base.length) return [];

  const questions: ExamQuestion[] = [];
  let round = 0;

  while (questions.length < EXAM_LENGTH) {
    for (const m of base) {
      if (questions.length >= EXAM_LENGTH) break;
      const useVariant = source === "topic" ? true : source === "vault" ? round > 0 : round % 2 === 1;
      const q = useVariant ? generateSimilarQuestion(m, (round % 3) + 1) : m;
      questions.push({
        id: `${q.id}-ex${round}`,
        subject: q.subject,
        topic: q.topic,
        difficulty: q.difficulty,
        question: q.question,
        choices: q.choices,
        correctIndex: q.correctIndex,
        explanation: [...q.hints, q.solution],
      });
    }
    round += 1;
    if (round > 12) break;
  }

  return questions.slice(0, EXAM_LENGTH);
}

export function formatClock(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}
