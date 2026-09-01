export type Subject = "Math" | "Physics" | "Chemistry" | "Biology" | "History";
export type Difficulty = "Easy" | "Medium" | "Hard";
export type Mastery = "Unresolved" | "Mastered";

export type Mistake = {
  id: string;
  subject: Subject;
  topic: string;
  difficulty: Difficulty;
  mastery: Mastery;
  question: string;
  choices: string[];
  correctIndex: number;
  hints: string[];
  solution: string;
  notes: string;
  addedAt: string;
  attempts: number;
};

export const SUBJECTS: Subject[] = ["Math", "Physics", "Chemistry", "Biology", "History"];
export const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];

export const initialMistakes: Mistake[] = [
  {
    id: "m1",
    subject: "Physics",
    topic: "Kinematics",
    difficulty: "Medium",
    mastery: "Unresolved",
    question:
      "A car accelerates uniformly from rest and covers 100 m in 5 s. What is its acceleration?",
    choices: ["4 m/s²", "8 m/s²", "10 m/s²", "20 m/s²"],
    correctIndex: 1,
    hints: [
      "Which kinematic equation links distance, time and acceleration when initial velocity is zero?",
      "Start from x = v₀t + ½at². What happens to the first term when the car starts from rest?",
      "Rearrange to a = 2x / t². Now plug in x = 100 m and t = 5 s.",
    ],
    solution:
      "Since v₀ = 0, x = ½at² → a = 2x/t² = 2(100)/25 = 8 m/s². The common mistake is using a = x/t² and getting 4 m/s².",
    notes: "I forgot the factor of ½ in the displacement equation.",
    addedAt: "2026-08-26",
    attempts: 2,
  },
  {
    id: "m2",
    subject: "Math",
    topic: "Logarithms",
    difficulty: "Hard",
    mastery: "Unresolved",
    question: "Solve for x: log₂(x) + log₂(x - 2) = 3",
    choices: ["x = 2", "x = 4", "x = -2", "x = 4 and x = -2"],
    correctIndex: 1,
    hints: [
      "What single logarithm equals the sum of two logarithms with the same base?",
      "log₂(x(x-2)) = 3 means x(x-2) = 2³. Write the quadratic.",
      "You get x² - 2x - 8 = 0 with roots 4 and -2. Which root is allowed by the domain of a log?",
    ],
    solution:
      "x² - 2x - 8 = 0 → x = 4 or x = -2. The domain requires x > 2, so only x = 4 is valid.",
    notes: "I keep forgetting to check the domain and I accept negative roots.",
    addedAt: "2026-08-27",
    attempts: 3,
  },
  {
    id: "m3",
    subject: "Chemistry",
    topic: "Stoichiometry",
    difficulty: "Medium",
    mastery: "Unresolved",
    question:
      "How many grams of H₂O are produced when 4 g of H₂ reacts completely with excess O₂? (H = 1, O = 16)",
    choices: ["18 g", "36 g", "72 g", "9 g"],
    correctIndex: 1,
    hints: [
      "First write and balance the reaction: 2H₂ + O₂ → 2H₂O.",
      "Convert 4 g of H₂ into moles using M(H₂) = 2 g/mol.",
      "The mole ratio H₂ : H₂O is 1 : 1, and M(H₂O) = 18 g/mol.",
    ],
    solution: "n(H₂) = 4/2 = 2 mol → n(H₂O) = 2 mol → m = 2 × 18 = 36 g.",
    notes: "I used the molar mass of H instead of H₂.",
    addedAt: "2026-08-28",
    attempts: 1,
  },
  {
    id: "m4",
    subject: "Biology",
    topic: "Genetics",
    difficulty: "Easy",
    mastery: "Mastered",
    question:
      "Two heterozygous tall plants (Tt) are crossed. What fraction of offspring is expected to be short?",
    choices: ["0", "1/4", "1/2", "3/4"],
    correctIndex: 1,
    hints: [
      "Draw the Punnett square for Tt × Tt.",
      "Short is the recessive phenotype — which genotype produces it?",
      "Count how many of the four boxes are tt.",
    ],
    solution: "Tt × Tt gives 1 TT : 2 Tt : 1 tt. Only tt is short, so 1/4.",
    notes: "Mixed up genotype ratio with phenotype ratio.",
    addedAt: "2026-08-20",
    attempts: 4,
  },
  {
    id: "m5",
    subject: "Physics",
    topic: "Kinematics",
    difficulty: "Hard",
    mastery: "Unresolved",
    question:
      "A ball is thrown upward at 20 m/s. How long until it returns to the thrower's hand? (g = 10 m/s²)",
    choices: ["2 s", "4 s", "5 s", "10 s"],
    correctIndex: 1,
    hints: [
      "What is the velocity of the ball at the highest point?",
      "Time to the top: t = v₀/g.",
      "The motion is symmetric, so the total time is twice the rise time.",
    ],
    solution: "t_up = 20/10 = 2 s, total = 2 × 2 = 4 s.",
    notes: "I only calculated the time to reach the top.",
    addedAt: "2026-08-29",
    attempts: 2,
  },
  {
    id: "m6",
    subject: "Math",
    topic: "Derivatives",
    difficulty: "Medium",
    mastery: "Mastered",
    question: "What is the derivative of f(x) = x² · sin(x)?",
    choices: ["2x·cos(x)", "2x·sin(x) + x²·cos(x)", "x²·cos(x)", "2x·sin(x) - x²·cos(x)"],
    correctIndex: 1,
    hints: [
      "The function is a product of two functions — which rule applies?",
      "Product rule: (uv)' = u'v + uv'.",
      "Here u = x² so u' = 2x, and v = sin(x) so v' = cos(x).",
    ],
    solution: "f'(x) = 2x·sin(x) + x²·cos(x).",
    notes: "I applied the chain rule instead of the product rule.",
    addedAt: "2026-08-18",
    attempts: 3,
  },
  {
    id: "m7",
    subject: "History",
    topic: "Industrial Revolution",
    difficulty: "Easy",
    mastery: "Unresolved",
    question: "Which invention most directly enabled factory production away from rivers?",
    choices: ["Spinning jenny", "Steam engine", "Telegraph", "Cotton gin"],
    correctIndex: 1,
    hints: [
      "Before this invention, factories depended on water wheels for power.",
      "Think about a power source that can be placed anywhere fuel can be delivered.",
      "It was refined by James Watt in the 1770s.",
    ],
    solution:
      "The steam engine freed factories from water power, allowing them to be built in cities.",
    notes: "I confused enabling power sources with textile machinery.",
    addedAt: "2026-08-25",
    attempts: 1,
  },
  {
    id: "m8",
    subject: "Chemistry",
    topic: "Acids & Bases",
    difficulty: "Hard",
    mastery: "Unresolved",
    question: "What is the pH of a 0.001 M HCl solution?",
    choices: ["1", "2", "3", "11"],
    correctIndex: 2,
    hints: [
      "HCl is a strong acid — how much of it dissociates?",
      "So [H⁺] = 0.001 M = 10⁻³ M.",
      "pH = -log[H⁺].",
    ],
    solution: "pH = -log(10⁻³) = 3.",
    notes: "I calculated pOH instead of pH.",
    addedAt: "2026-08-30",
    attempts: 2,
  },
];

export type TopicStat = { topic: string; subject: Subject; accuracy: number; attempts: number };

export const weaknessStats: TopicStat[] = [
  { topic: "Kinematics", subject: "Physics", accuracy: 40, attempts: 22 },
  { topic: "Logarithms", subject: "Math", accuracy: 48, attempts: 18 },
  { topic: "Acids & Bases", subject: "Chemistry", accuracy: 55, attempts: 14 },
  { topic: "Stoichiometry", subject: "Chemistry", accuracy: 63, attempts: 20 },
  { topic: "Derivatives", subject: "Math", accuracy: 78, attempts: 26 },
  { topic: "Genetics", subject: "Biology", accuracy: 84, attempts: 12 },
];

export const weeklyActivity = [
  { day: "Mon", solved: 6 },
  { day: "Tue", solved: 11 },
  { day: "Wed", solved: 4 },
  { day: "Thu", solved: 14 },
  { day: "Fri", solved: 9 },
  { day: "Sat", solved: 17 },
  { day: "Sun", solved: 12 },
];

export type LeaderboardRow = {
  rank: number;
  name: string;
  initials: string;
  xp: number;
  resolved: number;
  streak: number;
  isYou?: boolean;
};

export const leaderboard: LeaderboardRow[] = [
  { rank: 1, name: "Elif Demir", initials: "ED", xp: 3420, resolved: 68, streak: 21 },
  { rank: 2, name: "Marco Rossi", initials: "MR", xp: 3115, resolved: 61, streak: 14 },
  { rank: 3, name: "Aisha Khan", initials: "AK", xp: 2870, resolved: 57, streak: 9 },
  { rank: 4, name: "Barış Vatansever", initials: "BV", xp: 1250, resolved: 34, streak: 7, isYou: true },
  { rank: 5, name: "Jonas Weber", initials: "JW", xp: 1180, resolved: 31, streak: 5 },
  { rank: 6, name: "Sofia Nunes", initials: "SN", xp: 1042, resolved: 28, streak: 4 },
  { rank: 7, name: "Chen Wei", initials: "CW", xp: 970, resolved: 25, streak: 12 },
  { rank: 8, name: "Nora Haddad", initials: "NH", xp: 905, resolved: 22, streak: 3 },
];

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  progress: number;
};

export const badges: Badge[] = [
  {
    id: "b1",
    name: "Mistake Crusher",
    description: "Master 25 questions from your vault",
    icon: "🔨",
    earned: true,
    progress: 100,
  },
  {
    id: "b2",
    name: "10 Streak Club",
    description: "Keep a 10 day review streak",
    icon: "🔥",
    earned: false,
    progress: 70,
  },
  {
    id: "b3",
    name: "Night Owl",
    description: "Complete 15 reviews after midnight",
    icon: "🦉",
    earned: true,
    progress: 100,
  },
  {
    id: "b4",
    name: "Socratic Scholar",
    description: "Solve 20 questions using only the first hint",
    icon: "🏛️",
    earned: false,
    progress: 45,
  },
  {
    id: "b5",
    name: "Formula Forger",
    description: "Master every Kinematics mistake",
    icon: "⚗️",
    earned: false,
    progress: 30,
  },
  {
    id: "b6",
    name: "Weekend Warrior",
    description: "Review on 6 consecutive weekends",
    icon: "🛡️",
    earned: true,
    progress: 100,
  },
];

/** Deterministic "AI" variation of a question with different numbers/scenarios. */
export function generateSimilarQuestion(m: Mistake, seed: number): Mistake {
  const scenarios: Record<Subject, { q: string; choices: string[]; correct: number; sol: string }> =
    {
      Physics: {
        q: `A train accelerates uniformly from rest and covers ${50 + seed * 25} m in ${5 + seed} s. What is its acceleration?`,
        choices: ["1.2 m/s²", "2.8 m/s²", "3.5 m/s²", "5.0 m/s²"],
        correct: 1,
        sol: "Use x = ½at² → a = 2x/t². Substitute the new numbers and keep the factor of ½.",
      },
      Math: {
        q: `Solve for x: log₃(x) + log₃(x - ${2 + seed}) = ${2 + seed}`,
        choices: ["x = 3", "x = 9", "x = -1", "No solution"],
        correct: 1,
        sol: "Combine the logs, solve the quadratic, then discard roots outside the domain.",
      },
      Chemistry: {
        q: `How many grams of NH₃ form when ${6 + seed * 2} g of H₂ reacts with excess N₂? (H = 1, N = 14)`,
        choices: ["17 g", "34 g", "51 g", "68 g"],
        correct: 2,
        sol: "Balance N₂ + 3H₂ → 2NH₃, convert grams to moles, apply the 3:2 ratio.",
      },
      Biology: {
        q: `A heterozygous plant (Tt) is crossed with a short plant (tt). What fraction of offspring is short?`,
        choices: ["0", "1/4", "1/2", "3/4"],
        correct: 2,
        sol: "Tt × tt gives 1 Tt : 1 tt, so half of the offspring are short.",
      },
      History: {
        q: "Which development most directly accelerated the movement of goods during the Industrial Revolution?",
        choices: ["Steam locomotive", "Spinning mule", "Bessemer process", "Penny post"],
        correct: 0,
        sol: "Rail transport with steam locomotives reshaped distribution of goods and raw materials.",
      },
    };
  const s = scenarios[m.subject];
  return {
    ...m,
    id: `${m.id}-var-${seed}`,
    question: s.q,
    choices: s.choices,
    correctIndex: s.correct,
    solution: s.sol,
    hints: m.hints,
    attempts: 0,
  };
}
