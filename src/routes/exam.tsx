import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Eraser,
  Flag,
  Library,
  Sparkles,
  Timer,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell, TopHeader } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  buildExam,
  EXAM_DURATIONS,
  EXAM_LENGTH,
  formatClock,
  type ExamQuestion,
  type ExamSource,
} from "@/lib/exam-data";
import { useQuiz } from "@/lib/quiz-store";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/exam")({
  head: () => ({
    meta: [
      { title: "AI Exam Simulator — QuizForge" },
      {
        name: "description",
        content:
          "Generate a timed 10-question mock exam from any topic or your mistake vault, with live navigation, detailed scoring and AI explanations.",
      },
      { property: "og:title", content: "AI Exam Simulator — QuizForge" },
      {
        property: "og:description",
        content: "Timed 10-question mock exams with AI explanations and auto-saved mistakes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ExamPage,
});

type Phase = "setup" | "generating" | "running" | "results";

function ExamPage() {
  const { mistakes, addMistake, awardXp } = useQuiz();
  const { t, term, localizeMistake } = useI18n();

  const [phase, setPhase] = useState<Phase>("setup");
  const [topic, setTopic] = useState("");
  const [source, setSource] = useState<ExamSource>("mixed");
  const [minutes, setMinutes] = useState<number>(10);

  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const finishedRef = useRef(false);

  const localizedPool = useMemo(() => mistakes.map(localizeMistake), [mistakes, localizeMistake]);

  const answeredCount = answers.filter((a) => a !== null).length;
  const blankCount = answers.length - answeredCount;

  const finish = useCallback(
    (auto = false) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      setConfirmOpen(false);

      const missed = questions.filter((q, i) => answers[i] !== q.correctIndex);
      missed.forEach((q) => {
        addMistake({
          subject: q.subject,
          topic: q.topic,
          difficulty: q.difficulty,
          question: q.question,
          notes: q.explanation[q.explanation.length - 1] ?? "",
          choices: q.choices,
          correctIndex: q.correctIndex,
        });
      });
      setSavedCount(missed.length);
      awardXp((questions.length - missed.length) * 15);
      setPhase("results");
      if (auto) toast.error(t("exam.timeUpTitle"), { description: t("exam.timeUpDesc") });
    },
    [questions, answers, addMistake, awardXp, t],
  );

  useEffect(() => {
    if (phase !== "running") return;
    const id = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          window.clearInterval(id);
          finish(true);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase, finish]);

  function startExam() {
    if (source === "topic" && !topic.trim()) {
      toast.error(t("exam.needTopic"));
      return;
    }
    const built = buildExam(localizedPool, topic, source, localizeMistake);
    if (!built.length) {
      toast.error(t("exam.needTopic"));
      return;
    }
    finishedRef.current = false;
    setQuestions(built);
    setAnswers(Array(built.length).fill(null));
    setIndex(0);
    setSavedCount(0);
    setRemaining(minutes * 60);
    setPhase("generating");
    window.setTimeout(() => setPhase("running"), 1900);
  }

  /* ----------------------------- SETUP ----------------------------- */
  if (phase === "setup") {
    return (
      <AppShell>
        <TopHeader />
        <div>
          <h2 className="text-xl font-bold">{t("exam.title")}</h2>
          <p className="text-sm text-muted-foreground">{t("exam.subtitle")}</p>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-primary" /> {t("exam.setupTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="exam-topic">{t("exam.topicLabel")}</Label>
              <Input
                id="exam-topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={t("exam.topicPlaceholder")}
              />
            </div>

            <div className="space-y-2">
              <Label>{t("exam.sourceLabel")}</Label>
              <div className="grid gap-2 sm:grid-cols-3">
                {(["topic", "vault", "mixed"] as ExamSource[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSource(s)}
                    className={`rounded-xl border px-3 py-3 text-sm font-medium transition-colors ${
                      source === s
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-surface/60 hover:border-primary/50"
                    }`}
                  >
                    {t(
                      s === "topic"
                        ? "exam.sourceTopic"
                        : s === "vault"
                          ? "exam.sourceVault"
                          : "exam.sourceMixed",
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("exam.durationLabel")}</Label>
              <div className="grid grid-cols-4 gap-2">
                {EXAM_DURATIONS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setMinutes(d)}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border px-2 py-3 text-sm font-semibold transition-colors ${
                      minutes === d
                        ? "border-accent bg-accent/15 text-accent"
                        : "border-border bg-surface/60 hover:border-accent/50"
                    }`}
                  >
                    <Timer className="h-4 w-4 shrink-0" />
                    {t("exam.minutes", { n: d })}
                  </button>
                ))}
              </div>
            </div>

            <Button className="w-full" onClick={startExam}>
              <Sparkles className="mr-1.5 h-4 w-4" /> {t("exam.start")}
            </Button>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  /* --------------------------- GENERATING --------------------------- */
  if (phase === "generating") {
    return (
      <AppShell>
        <TopHeader />
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center gap-4 py-20 text-center">
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-primary/30" />
              <div className="gradient-primary relative grid h-16 w-16 place-items-center rounded-full">
                <Sparkles className="h-7 w-7 animate-pulse text-primary-foreground" />
              </div>
            </div>
            <p className="text-base font-bold">{t("exam.generating")}</p>
            <p className="max-w-sm text-sm text-muted-foreground">{t("exam.generatingDesc")}</p>
            <Progress value={66} className="h-1.5 w-48" />
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  /* ---------------------------- RESULTS ---------------------------- */
  if (phase === "results") {
    const correct = questions.filter((q, i) => answers[i] === q.correctIndex).length;
    const blanks = answers.filter((a) => a === null).length;
    const incorrect = questions.length - correct - blanks;
    const accuracy = Math.round((correct / questions.length) * 100);
    const used = minutes * 60 - remaining;
    const missed = questions
      .map((q, i) => ({ q, i }))
      .filter(({ q, i }) => answers[i] !== q.correctIndex);

    return (
      <AppShell>
        <TopHeader />
        <div>
          <h2 className="text-xl font-bold">{t("exam.resultsTitle")}</h2>
          <p className="text-sm text-muted-foreground">
            {savedCount > 0 ? t("exam.autoSaved", { n: savedCount }) : t("exam.autoSavedNone")}
          </p>
        </div>

        <Card className="glass-card">
          <CardContent className="grid grid-cols-2 gap-3 py-6 sm:grid-cols-3 lg:grid-cols-6">
            <Stat label={t("exam.score")} value={`${correct}/${questions.length}`} tone="primary" />
            <Stat label={t("exam.accuracy")} value={`${accuracy}%`} tone="primary" />
            <Stat label={t("exam.correct")} value={String(correct)} tone="success" />
            <Stat label={t("exam.incorrect")} value={String(incorrect)} tone="destructive" />
            <Stat label={t("exam.blanks")} value={String(blanks)} tone="muted" />
            <Stat label={t("exam.timeTaken")} value={formatClock(used)} tone="accent" />
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base">{t("exam.breakdown")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {missed.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">{t("exam.perfect")}</p>
            )}
            {missed.map(({ q, i }) => (
              <div key={q.id} className="rounded-xl border border-border bg-surface/60 p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge className="bg-primary/15 text-primary">
                    {t("exam.questionN", { i: i + 1, n: questions.length })}
                  </Badge>
                  <Badge variant="outline">{term(q.subject)}</Badge>
                  <Badge variant="outline">{q.topic}</Badge>
                </div>
                <p className="text-sm font-semibold">{q.question}</p>
                <div className="mt-3 grid gap-1.5 text-sm">
                  <p className="text-destructive">
                    {t("exam.yourAnswer")}:{" "}
                    {answers[i] === null || answers[i] === undefined
                      ? t("exam.noAnswer")
                      : q.choices[answers[i] as number]}
                  </p>
                  <p className="text-success">
                    {t("exam.correctAnswer")}: {q.choices[q.correctIndex]}
                  </p>
                </div>
                <div className="mt-3 rounded-lg border border-accent/30 bg-accent/10 p-3">
                  <p className="text-xs font-bold text-accent">{t("exam.explanation")}</p>
                  <ol className="mt-2 list-decimal space-y-1 pl-4 text-sm text-foreground/90">
                    {q.explanation.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setPhase("setup")}>
            <Sparkles className="mr-1.5 h-4 w-4" /> {t("exam.retake")}
          </Button>
          <Button variant="outline" asChild>
            <Link to="/vault">
              <Library className="mr-1.5 h-4 w-4" /> {t("exam.openVault")}
            </Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  /* ---------------------------- RUNNING ---------------------------- */
  const current = questions[index];
  if (!current) return null;
  const lowTime = remaining <= 60;

  return (
    <AppShell>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold">{t("exam.title")}</h2>
          <p className="truncate text-sm text-muted-foreground">
            {t("exam.questionN", { i: index + 1, n: questions.length })}
          </p>
        </div>
        <div
          className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2 font-mono text-sm font-bold ${
            lowTime
              ? "animate-pulse border-destructive/50 bg-destructive/10 text-destructive"
              : "border-primary/30 bg-primary/10 text-primary"
          }`}
        >
          <Clock className="h-4 w-4" />
          {formatClock(remaining)}
        </div>
      </div>

      <Card className="glass-card">
        <CardContent className="space-y-3 py-4">
          <p className="text-xs font-semibold text-muted-foreground">{t("exam.navigator")}</p>
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
            {questions.map((q, i) => {
              const state = i === index ? "current" : answers[i] !== null ? "answered" : "blank";
              return (
                <button
                  key={q.id}
                  onClick={() => setIndex(i)}
                  className={`grid h-9 place-items-center rounded-lg border text-xs font-bold transition-colors ${
                    state === "current"
                      ? "border-primary bg-primary text-primary-foreground"
                      : state === "answered"
                        ? "border-success/50 bg-success/15 text-success"
                        : "border-border bg-surface/60 text-muted-foreground"
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-success/60" /> {t("exam.answered")} (
              {answeredCount})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-muted" /> {t("exam.blank")} ({blankCount})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-primary" /> {t("exam.current")}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-primary/15 text-primary">{term(current.subject)}</Badge>
            <Badge variant="outline">{current.topic}</Badge>
            <Badge variant="outline">{term(current.difficulty)}</Badge>
          </div>
          <CardTitle className="text-base leading-relaxed">{current.question}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-2">
            {current.choices.map((c, i) => (
              <button
                key={c}
                onClick={() =>
                  setAnswers((prev) => prev.map((a, j) => (j === index ? (a === i ? null : i) : a)))
                }
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                  answers[index] === i
                    ? "border-primary bg-primary/10"
                    : "border-border bg-surface/60 hover:border-primary/50"
                }`}
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg border border-border text-xs font-bold">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="min-w-0">{c}</span>
                {answers[index] === i && (
                  <CheckCircle2 className="ml-auto h-4 w-4 shrink-0 text-primary" />
                )}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              disabled={index === 0}
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" /> {t("exam.prev")}
            </Button>
            <Button
              variant="outline"
              disabled={index === questions.length - 1}
              onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}
            >
              {t("exam.next")} <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              disabled={answers[index] === null}
              onClick={() =>
                setAnswers((prev) => prev.map((a, j) => (j === index ? null : a)))
              }
            >
              <Eraser className="mr-1.5 h-4 w-4" /> {t("exam.clear")}
            </Button>
            <Button className="ml-auto" onClick={() => setConfirmOpen(true)}>
              <Flag className="mr-1.5 h-4 w-4" /> {t("exam.finish")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-accent" /> {t("exam.finishTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("exam.finishDesc", { answered: answeredCount, blank: blankCount })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              {t("exam.cancel")}
            </Button>
            <Button onClick={() => finish(false)}>
              <XCircle className="mr-1.5 h-4 w-4" /> {t("exam.confirmFinish")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "primary" | "success" | "destructive" | "accent" | "muted";
}) {
  const toneClass =
    tone === "primary"
      ? "text-primary"
      : tone === "success"
        ? "text-success"
        : tone === "destructive"
          ? "text-destructive"
          : tone === "accent"
            ? "text-accent"
            : "text-muted-foreground";
  return (
    <div className="rounded-xl border border-border bg-surface/60 p-3 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 text-lg font-bold ${toneClass}`}>{value}</p>
    </div>
  );
}
