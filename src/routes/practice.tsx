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

export const Route = createFileRoute("/practice")({
  validateSearch: (search: Record<string, unknown>) => ({
    id: typeof search['id'] === "string" ? (search['id'] as string) : undefined,
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
  const { id } = Route.useSearch();
  const { mistakes, awardXp, toggleMastery, registerAttempt } = useQuiz();

  const queue = useMemo(() => {
    const list = mistakes.filter((m) => m.mastery === "Unresolved");
    const pool = list.length ? list : mistakes;
    const start = Math.max(
      0,
      pool.findIndex((m) => m.id === id),
    );
    return [...pool.slice(start), ...pool.slice(0, start)];
  }, [mistakes, id]);

  const [index, setIndex] = useState(0);
  const [variant, setVariant] = useState<Mistake | null>(null);
  const [hintLevel, setHintLevel] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const base = queue[index % Math.max(queue.length, 1)];
  const current = variant ?? base;

  function resetQuestion() {
    setHintLevel(0);
    setSelected(null);
    setSubmitted(false);
  }

  if (!base || !current) {
    return (
      <AppShell>
        <TopHeader />
        <Card className="glass-card">
          <CardContent className="py-16 text-center text-sm text-muted-foreground">
            Your vault is empty — add a wrong question to start practicing.
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  const correct = selected === current.correctIndex;

  return (
    <AppShell>
      <TopHeader />

      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-xl font-bold">Socratic practice</h2>
          <p className="truncate text-sm text-muted-foreground">
            Question {index + 1} of {queue.length} in your review queue
          </p>
        </div>
        <Badge className="shrink-0 bg-primary/15 text-primary">
          {variant ? "AI variation" : "From vault"}
        </Badge>
      </div>

      <Card className="glass-card">
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-primary/15 text-primary">{current.subject}</Badge>
            <Badge variant="outline">{current.topic}</Badge>
            <Badge variant="outline">{current.difficulty}</Badge>
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
                    <span className="font-semibold text-accent">Hint {i + 1}: </span>
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
                  toast("No more hints — try reasoning it through now.");
                  return;
                }
                setHintLevel((h) => h + 1);
                toast("Socratic hint unlocked", {
                  description: "Think it through before asking for the next one.",
                });
              }}
            >
              <Lightbulb className="mr-1.5 h-4 w-4 text-accent" />
              Get Socratic hint ({hintLevel}/{current.hints.length})
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setVariant(generateSimilarQuestion(base, (index % 3) + 1));
                resetQuestion();
                toast.success("Similar question generated", {
                  description: "Same concept, different numbers and scenario.",
                });
              }}
            >
              <Sparkles className="mr-1.5 h-4 w-4 text-primary" />
              Generate similar question
            </Button>
          </div>

          {!submitted ? (
            <Button
              className="w-full"
              disabled={selected === null}
              onClick={() => {
                setSubmitted(true);
                registerAttempt(base.id);
                if (selected === current.correctIndex) {
                  const gain = Math.max(10, 40 - hintLevel * 10);
                  awardXp(gain);
                  toast.success(`Correct! +${gain} XP`);
                } else {
                  toast.error("Not quite — read the detailed solution below.");
                }
              }}
            >
              Submit answer
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
                  {correct ? "Correct answer" : "Incorrect answer"}
                </p>
                <p className="mt-2 text-sm text-foreground/90">{current.solution}</p>
                {base.notes && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Your original note: {base.notes}
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
                  Next question <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setVariant(generateSimilarQuestion(base, ((index + 1) % 3) + 1));
                    resetQuestion();
                  }}
                >
                  <Shuffle className="mr-1.5 h-4 w-4" /> Try a variation
                </Button>
                {base.mastery === "Unresolved" && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      toggleMastery(base.id);
                      awardXp(50);
                      toast.success("Marked as mastered (+50 XP)");
                    }}
                  >
                    <CheckCircle2 className="mr-1.5 h-4 w-4 text-success" /> Mark mastered
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
