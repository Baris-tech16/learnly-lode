import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Eraser,
  Flag,
  ImagePlus,
  Loader2,
  Sparkles,
  Timer,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { EXAM_DURATIONS, formatClock } from "@/lib/exam-data";
import { aiGenerateExam, type GeneratedExamQuestion } from "@/lib/ai.functions";
import { useQuiz } from "@/lib/quiz-store";
import { useI18n } from "@/lib/i18n";
import type { Difficulty, Subject } from "@/lib/quiz-data";

type Phase = "setup" | "generating" | "running" | "results";
type Material = "photo" | "vault" | "topic";

const SUBJECT_SET = new Set(["Math", "Physics", "Chemistry", "Biology", "History"]);

function readFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("read-failed"));
    reader.readAsDataURL(file);
  });
}

export function VaultExamDialog({ trigger }: { trigger: ReactNode }) {
  const { t, term, lang } = useI18n();
  const { mistakes, addMistakes, awardXp, signedIn } = useQuiz();

  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("setup");
  const [material, setMaterial] = useState<Material>("vault");
  const [topic, setTopic] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [minutes, setMinutes] = useState(10);

  const [questions, setQuestions] = useState<GeneratedExamQuestion[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [startedAt, setStartedAt] = useState(0);
  const [usedSeconds, setUsedSeconds] = useState(0);
  const finishedRef = useRef(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const answeredCount = answers.filter((a) => a !== null).length;
  const blankCount = answers.length - answeredCount;

  const finish = useCallback(
    (auto = false) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      setConfirmOpen(false);
      setUsedSeconds(startedAt ? Math.round((Date.now() - startedAt) / 1000) : 0);

      const missed = questions.filter((q, i) => answers[i] !== q.correctIndex);
      setSavedCount(missed.length);
      awardXp((questions.length - missed.length) * 15);
      setPhase("results");
      if (auto) toast.error(t("exam.timeUpTitle"), { description: t("exam.timeUpDesc") });

      if (missed.length) {
        void addMistakes(
          missed.map((q) => ({
            subject: (SUBJECT_SET.has(q.subject) ? q.subject : "Math") as Subject,
            topic: q.topic,
            difficulty: (["Easy", "Medium", "Hard"].includes(q.difficulty)
              ? q.difficulty
              : "Medium") as Difficulty,
            question: q.question,
            notes: q.explanation[q.explanation.length - 1] ?? "",
            choices: q.choices,
            correctIndex: q.correctIndex,
            hints: q.explanation.slice(0, -1),
            solution: q.explanation.join(" "),
            source: "exam",
          })),
        ).catch(() => {});
      }
    },
    [questions, answers, addMistakes, awardXp, t, startedAt],
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

  async function pickPhoto(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error(t("ocr.errType"));
      return;
    }
    setPhoto(await readFile(file));
    setMaterial("photo");
  }

  async function start() {
    if (material === "topic" && !topic.trim()) {
      toast.error(t("exam.needMaterial"));
      return;
    }
    if (material === "photo" && !photo) {
      toast.error(t("exam.needMaterial"));
      return;
    }
    if (material === "vault" && !mistakes.length) {
      toast.error(t("exam.needMaterial"));
      return;
    }

    setPhase("generating");
    try {
      const built = await aiGenerateExam({
        data: {
          lang,
          topic: topic.trim() || undefined,
          imageDataUrl: material === "photo" && photo ? photo : undefined,
          vaultSamples:
            material === "vault" || material === "topic"
              ? mistakes.slice(0, 12).map((m) => ({
                  subject: m.subject,
                  topic: m.topic,
                  question: m.question,
                }))
              : [],
          count: 10,
        },
      });
      finishedRef.current = false;
      setQuestions(built);
      setAnswers(Array(built.length).fill(null));
      setIndex(0);
      setSavedCount(0);
      setRemaining(minutes * 60);
      setStartedAt(Date.now());
      setPhase("running");
    } catch (err) {
      setPhase("setup");
      toast.error(t("exam.aiError"), { description: (err as Error).message });
    }
  }

  function reset() {
    setPhase("setup");
    setQuestions([]);
    setAnswers([]);
    setPhoto(null);
    finishedRef.current = false;
  }

  const current = questions[index];
  const correct = questions.filter((q, i) => answers[i] === q.correctIndex).length;
  const blanks = answers.filter((a) => a === null).length;
  const incorrect = questions.length - correct - blanks;
  const accuracy = questions.length ? Math.round((correct / questions.length) * 100) : 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[92dvh] gap-4 overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-5 w-5 text-primary" /> {t("exam.title")}
          </DialogTitle>
          <DialogDescription>{t("exam.vaultCtaDesc")}</DialogDescription>
        </DialogHeader>

        {/* --------------------------- SETUP --------------------------- */}
        {phase === "setup" && (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label>{t("exam.materialLabel")}</Label>
              <div className="grid gap-2 sm:grid-cols-3">
                {(["photo", "vault", "topic"] as Material[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMaterial(m)}
                    className={`rounded-xl border px-3 py-3 text-sm font-medium transition-colors ${
                      material === m
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-surface/60 hover:border-primary/50"
                    }`}
                  >
                    {t(
                      m === "photo"
                        ? "exam.materialPhoto"
                        : m === "vault"
                          ? "exam.materialVault"
                          : "exam.materialTopic",
                    )}
                  </button>
                ))}
              </div>
            </div>

            {material === "photo" && (
              <div className="space-y-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => void pickPhoto(e.target.files?.[0])}
                />
                {photo ? (
                  <div className="space-y-2">
                    <img
                      src={photo}
                      alt={t("exam.photoAttached")}
                      className="max-h-52 w-full rounded-xl border border-border object-contain"
                    />
                    <Button variant="secondary" size="sm" onClick={() => setPhoto(null)}>
                      <X className="mr-1.5 h-4 w-4" /> {t("exam.photoRemove")}
                    </Button>
                  </div>
                ) : (
                  <Button variant="secondary" className="w-full" onClick={() => fileRef.current?.click()}>
                    <ImagePlus className="mr-1.5 h-4 w-4" /> {t("exam.photoPick")}
                  </Button>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="vault-exam-topic">{t("exam.topicLabel")}</Label>
              <Input
                id="vault-exam-topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={t("exam.topicPlaceholder")}
              />
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

            {!signedIn && <p className="text-xs text-muted-foreground">{t("exam.signInHint")}</p>}

            <Button className="w-full" onClick={() => void start()}>
              <Sparkles className="mr-1.5 h-4 w-4" /> {t("exam.start")}
            </Button>
          </div>
        )}

        {/* ------------------------- GENERATING ------------------------ */}
        {phase === "generating" && (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-primary/30" />
              <div className="gradient-primary relative grid h-16 w-16 place-items-center rounded-full">
                <Sparkles className="h-7 w-7 animate-pulse text-primary-foreground" />
              </div>
            </div>
            <p className="text-base font-bold">{t("exam.generating")}</p>
            <p className="max-w-sm text-sm text-muted-foreground">{t("exam.generatingDesc")}</p>
            <Progress value={66} className="h-1.5 w-48" />
          </div>
        )}

        {/* --------------------------- RUNNING ------------------------- */}
        {phase === "running" && current && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold">
                {t("exam.questionN", { i: index + 1, n: questions.length })}
              </p>
              <div
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 font-mono text-sm font-bold ${
                  remaining <= 60
                    ? "animate-pulse border-destructive/50 bg-destructive/10 text-destructive"
                    : "border-primary/30 bg-primary/10 text-primary"
                }`}
              >
                <Clock className="h-4 w-4" />
                {formatClock(remaining)}
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
              {questions.map((q, i) => {
                const state = i === index ? "current" : answers[i] !== null ? "answered" : "blank";
                return (
                  <button
                    key={`${q.question}-${i}`}
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

            <Card className="glass-card">
              <CardContent className="space-y-4 pt-5">
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-primary/15 text-primary">{term(current.subject)}</Badge>
                  <Badge variant="outline">{current.topic}</Badge>
                  <Badge variant="outline">{term(current.difficulty)}</Badge>
                </div>
                <p className="text-sm leading-relaxed font-semibold">{current.question}</p>
                <div className="grid gap-2">
                  {current.choices.map((c, i) => (
                    <button
                      key={`${c}-${i}`}
                      onClick={() =>
                        setAnswers((prev) =>
                          prev.map((a, j) => (j === index ? (a === i ? null : i) : a)),
                        )
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
              </CardContent>
            </Card>

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
                onClick={() => setAnswers((prev) => prev.map((a, j) => (j === index ? null : a)))}
              >
                <Eraser className="mr-1.5 h-4 w-4" /> {t("exam.clear")}
              </Button>
              <Button className="ml-auto" onClick={() => setConfirmOpen(true)}>
                <Flag className="mr-1.5 h-4 w-4" /> {t("exam.finish")}
              </Button>
            </div>
          </div>
        )}

        {/* --------------------------- RESULTS ------------------------- */}
        {phase === "results" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {savedCount > 0 ? t("exam.autoSaved", { n: savedCount }) : t("exam.autoSavedNone")}
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <Stat label={t("exam.score")} value={`${correct}/${questions.length}`} />
              <Stat label={t("exam.accuracy")} value={`${accuracy}%`} />
              <Stat label={t("exam.correct")} value={String(correct)} tone="text-success" />
              <Stat label={t("exam.incorrect")} value={String(incorrect)} tone="text-destructive" />
              <Stat label={t("exam.blanks")} value={String(blanks)} />
              <Stat label={t("exam.timeTaken")} value={formatClock(usedSeconds)} tone="text-accent" />
            </div>

            <div className="space-y-3">
              <p className="text-sm font-bold">{t("exam.breakdown")}</p>
              {questions.filter((q, i) => answers[i] !== q.correctIndex).length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">{t("exam.perfect")}</p>
              )}
              {questions.map((q, i) =>
                answers[i] === q.correctIndex ? null : (
                  <div key={`${q.question}-${i}`} className="rounded-xl border border-border bg-surface/60 p-4">
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
                        {q.explanation.map((step, k) => (
                          <li key={`${step}-${k}`}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                ),
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={reset}>
                <Sparkles className="mr-1.5 h-4 w-4" /> {t("exam.retake")}
              </Button>
              <Button variant="outline" onClick={() => setOpen(false)}>
                {t("exam.close")}
              </Button>
            </div>
          </div>
        )}

        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("exam.finishTitle")}</DialogTitle>
              <DialogDescription>
                {t("exam.finishDesc", { answered: answeredCount, blank: blankCount })}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-2">
              <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                {t("exam.cancel")}
              </Button>
              <Button onClick={() => finish(false)}>
                {savedCount === 0 ? t("exam.confirmFinish") : <Loader2 className="h-4 w-4 animate-spin" />}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface/60 p-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className={`text-lg font-bold ${tone ?? "text-foreground"}`}>{value}</p>
    </div>
  );
}
