import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  Shuffle,
  Sparkles,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell, TopHeader } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateSimilarQuestion, type Mistake } from "@/lib/quiz-data";
import { useQuiz } from "@/lib/quiz-store";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/practice")({
  validateSearch: (search: Record<string, unknown>) => ({
    id: typeof search['id'] === "string" ? (search['id'] as string) : undefined,
    mode: search['mode'] === "smart" ? ("smart" as const) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Socratic Practice — QuizForge" },
      {
        name: "description",
        content:
          "Practice your saved mistakes with progressive Socratic hints, AI-style question variations and a detailed solution after each answer.",
      },
      { property: "og:title", content: "Socratic Practice — QuizForge" },
      {
        property: "og:description",
        content: "Progressive hints that guide you instead of handing over the answer.",
      },
    ],
  }),
  component: PracticePage,
});

function PracticePage() {
  const { id, mode } = Route.useSearch();
  const { mistakes, dueIds, awardXp, toggleMastery, registerAttempt } = useQuiz();
  const { t, term, localizeMistake } = useI18n();

  const queue = useMemo(() => {
    const list =
      mode === "smart"
        ? mistakes.filter((m) => dueIds.includes(m.id))
        : mistakes.filter((m) => m.mastery === "Unresolved");
    const pool = list.length ? list : mistakes;
    const start = Math.max(
      0,
      pool.findIndex((m) => m.id === id),
    );
    return [...pool.slice(start), ...pool.slice(0, start)];
  }, [mistakes, dueIds, mode, id]);

  const [index, setIndex] = useState(0);
  const [variant, setVariant] = useState<Mistake | null>(null);
  const [hintLevel, setHintLevel] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const rawBase = queue[index % Math.max(queue.length, 1)];
  const rawCurrent = variant ?? rawBase;

  function resetQuestion() {
    setHintLevel(0);
    setSelected(null);
    setSubmitted(false);
  }

  if (!rawBase || !rawCurrent) {
    return (
      <AppShell>
        <TopHeader />
        <Card className="glass-card">
          <CardContent className="py-16 text-center text-sm text-muted-foreground">
            {t("practice.emptyVault")}
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  const base = localizeMistake(rawBase);
  const current = localizeMistake(rawCurrent);
  const correct = selected === current.correctIndex;

  return (
    <AppShell>
      <TopHeader />

      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-xl font-bold">{t("practice.title")}</h2>
          <p className="truncate text-sm text-muted-foreground">
            {t("practice.progress", { i: index + 1, n: queue.length })}
          </p>
        </div>
        <Badge className="shrink-0 bg-primary/15 text-primary">
          {variant
            ? t("practice.variation")
            : mode === "smart"
              ? t("srs.smartMode")
              : t("practice.fromVault")}
        </Badge>
      </div>

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
            {current.choices.map((c, i) => {
              const isCorrect = submitted && i === current.correctIndex;
              const isWrongPick = submitted && i === selected && !correct;
              return (
                <button
                  key={c}
                  disabled={submitted}
                  onClick={() => setSelected(i)}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                    isCorrect
                      ? "border-success/60 bg-success/10 text-success"
                      : isWrongPick
                        ? "border-destructive/60 bg-destructive/10 text-destructive"
                        : selected === i
                          ? "border-primary bg-primary/10"
                          : "border-border bg-surface/60 hover:border-primary/50"
                  }`}
                >
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg border border-border text-xs font-bold">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="min-w-0">{c}</span>
                  {isCorrect && <CheckCircle2 className="ml-auto h-4 w-4 shrink-0" />}
                  {isWrongPick && <XCircle className="ml-auto h-4 w-4 shrink-0" />}
                </button>
              );
            })}
          </div>

          {hintLevel > 0 && (
            <div className="space-y-2">
              {current.hints.slice(0, hintLevel).map((h, i) => (
                <div
                  key={h}
                  className="flex gap-3 rounded-xl border border-accent/30 bg-accent/10 p-3 text-sm"
                >
                  <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <p>
                    <span className="font-semibold text-accent">
                      {t("practice.hint")} {i + 1}:{" "}
                    </span>
                    {h}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                if (hintLevel >= current.hints.length) {
                  toast(t("practice.noMoreHints"));
                  return;
                }
                setHintLevel((h) => h + 1);
                toast(t("practice.hintUnlocked"), {
                  description: t("practice.hintUnlockedDesc"),
                });
              }}
            >
              <Lightbulb className="mr-1.5 h-4 w-4 text-accent" />
              {t("practice.getHint")} ({hintLevel}/{current.hints.length})
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setVariant(generateSimilarQuestion(rawBase, (index % 3) + 1));
                resetQuestion();
                toast.success(t("practice.similarToast"), {
                  description: t("practice.similarToastDesc"),
                });
              }}
            >
              <Sparkles className="mr-1.5 h-4 w-4 text-primary" />
              {t("practice.generateSimilar")}
            </Button>
          </div>

          {!submitted ? (
            <Button
              className="w-full"
              disabled={selected === null}
              onClick={() => {
                setSubmitted(true);
                registerAttempt(rawBase.id);
                if (selected === current.correctIndex) {
                  const gain = Math.max(10, 40 - hintLevel * 10);
                  awardXp(gain);
                  toast.success(t("practice.correctToast", { n: gain }));
                } else {
                  toast.error(t("practice.wrongToast"));
                }
              }}
            >
              {t("practice.submit")}
            </Button>
          ) : (
            <div className="space-y-4">
              <div
                className={`rounded-xl border p-4 ${
                  correct
                    ? "border-success/40 bg-success/10"
                    : "border-destructive/40 bg-destructive/10"
                }`}
              >
                <p className={`text-sm font-bold ${correct ? "text-success" : "text-destructive"}`}>
                  {correct ? t("practice.correct") : t("practice.incorrect")}
                </p>
                <p className="mt-2 text-sm text-foreground/90">{current.solution}</p>
                {base.notes && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    {t("practice.originalNote")} {base.notes}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => {
                    setVariant(null);
                    setIndex((i) => (i + 1) % queue.length);
                    resetQuestion();
                  }}
                >
                  {t("practice.next")} <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setVariant(generateSimilarQuestion(rawBase, ((index + 1) % 3) + 1));
                    resetQuestion();
                  }}
                >
                  <Shuffle className="mr-1.5 h-4 w-4" /> {t("practice.tryVariation")}
                </Button>
                {rawBase.mastery === "Unresolved" && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      toggleMastery(rawBase.id);
                      awardXp(50);
                      toast.success(t("practice.masteredToast"));
                    }}
                  >
                    <CheckCircle2 className="mr-1.5 h-4 w-4 text-success" />{" "}
                    {t("vault.markMastered")}
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
