import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Plus, RotateCcw, Search } from "lucide-react";
import { AppShell, TopHeader } from "@/components/AppShell";
import { AddMistakeDialog } from "@/components/AddMistakeDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DIFFICULTIES, SUBJECTS } from "@/lib/quiz-data";
import { useQuiz } from "@/lib/quiz-store";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/vault")({
  head: () => ({
    meta: [
      { title: "Mistake Vault — QuizForge" },
      {
        name: "description",
        content:
          "Every wrong question in one place: filter by subject, difficulty and mastery status, and add notes on why you missed it.",
      },
      { property: "og:title", content: "Mistake Vault — QuizForge" },
      {
        property: "og:description",
        content: "Filter, annotate and master your saved wrong questions.",
      },
    ],
  }),
  component: VaultPage,
});

function VaultPage() {
  const { mistakes, toggleMastery } = useQuiz();
  const { t, term, localizeMistake } = useI18n();
  const navigate = useNavigate();
  const [subject, setSubject] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [mastery, setMastery] = useState("all");
  const [query, setQuery] = useState("");

  const filtered = mistakes
    .filter(
      (m) =>
        (subject === "all" || m.subject === subject) &&
        (difficulty === "all" || m.difficulty === difficulty) &&
        (mastery === "all" || m.mastery === mastery),
    )
    .map(localizeMistake)
    .filter(
      (m) =>
        query.trim() === "" ||
        `${m.question} ${m.topic} ${m.notes}`.toLowerCase().includes(query.toLowerCase()),
    );

  return (
    <AppShell>
      <TopHeader />

      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
        <div className="min-w-0">
          <h2 className="truncate text-xl font-bold">{t("vault.title")}</h2>
          <p className="truncate text-sm text-muted-foreground">
            {t("vault.count", { a: filtered.length, b: mistakes.length })}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <OcrCaptureDialog
            trigger={
              <Button variant="secondary" className="shrink-0">
                <ScanLine className="mr-1.5 h-4 w-4" /> {t("ocr.trigger")}
              </Button>
            }
          />
          <AddMistakeDialog
            trigger={
              <Button className="shrink-0">
                <Plus className="mr-1.5 h-4 w-4" /> {t("vault.addNew")}
              </Button>
            }
          />
        </div>

      </div>

      <Card className="glass-card">
        <CardContent className="grid gap-3 pt-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder={t("vault.search")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <FilterSelect
            value={subject}
            onChange={setSubject}
            label={t("vault.subject")}
            allLabel={t("vault.allSubject")}
            options={SUBJECTS}
          />
          <FilterSelect
            value={difficulty}
            onChange={setDifficulty}
            label={t("vault.difficulty")}
            allLabel={t("vault.allDifficulty")}
            options={DIFFICULTIES}
          />
          <FilterSelect
            value={mastery}
            onChange={setMastery}
            label={t("vault.status")}
            allLabel={t("vault.allStatus")}
            options={["Unresolved", "Mastered"]}
          />
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="py-14 text-center text-sm text-muted-foreground">
            {t("vault.empty")}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((m) => (
            <Card key={m.id} className="glass-card transition-colors hover:border-primary/40">
              <CardHeader className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-primary/15 text-primary">{term(m.subject)}</Badge>
                  <Badge variant="outline">{m.topic}</Badge>
                  <Badge
                    variant="outline"
                    className={
                      m.difficulty === "Hard"
                        ? "border-destructive/40 text-destructive"
                        : m.difficulty === "Medium"
                          ? "border-accent/40 text-accent"
                          : "border-success/40 text-success"
                    }
                  >
                    {term(m.difficulty)}
                  </Badge>
                  {m.mastery === "Mastered" && (
                    <Badge className="bg-success/15 text-success">
                      <CheckCircle2 className="mr-1 h-3 w-3" /> {t("vault.masteredBadge")}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-sm leading-relaxed font-medium">{m.question}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {m.notes && (
                  <p className="rounded-xl border border-border bg-surface/70 p-3 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{t("vault.yourNote")}</span>
                    {m.notes}
                  </p>
                )}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>{t("vault.meta", { n: m.attempts, d: m.addedAt })}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() => navigate({ to: "/practice", search: { id: m.id } })}
                  >
                    {t("vault.practice")}
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => toggleMastery(m.id)}>
                    {m.mastery === "Mastered" ? (
                      <>
                        <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> {t("vault.reopen")}
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> {t("vault.markMastered")}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}

function FilterSelect({
  value,
  onChange,
  label,
  allLabel,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  allLabel: string;
  options: readonly string[];
}) {
  const { term } = useI18n();
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{allLabel}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {term(o)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
