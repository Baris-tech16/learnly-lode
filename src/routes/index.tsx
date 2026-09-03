import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  BrainCircuit,
  CalendarCheck,
  Plus,
  Sparkles,
  Target,
  TrendingDown,
} from "lucide-react";
import { toast } from "sonner";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell, TopHeader } from "@/components/AppShell";
import { AddMistakeDialog } from "@/components/AddMistakeDialog";
import { ReviewAlerts } from "@/components/ReviewAlerts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { weaknessStats, weeklyActivity } from "@/lib/quiz-data";
import { useQuiz } from "@/lib/quiz-store";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "QuizForge Dashboard — AI Mistake Vault & Socratic Coach" },
      {
        name: "description",
        content:
          "Track weak topics, review wrong questions and earn XP with QuizForge's AI Socratic coach for exam prep.",
      },
      { property: "og:title", content: "QuizForge Dashboard — AI Mistake Vault" },
      {
        property: "og:description",
        content: "Turn every wrong answer into mastery with Socratic hints, streaks and XP.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { mistakes, awardXp } = useQuiz();
  const { t, term } = useI18n();
  const navigate = useNavigate();
  const unresolved = mistakes.filter((m) => m.mastery === "Unresolved").length;
  const mastered = mistakes.length - unresolved;

  const chartData = weeklyActivity.map((d) => ({ ...d, day: term(d.day) }));

  return (
    <AppShell>
      <TopHeader />

      <ReviewAlerts />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label={t("dash.openMistakes")}
          value={String(unresolved)}
          hint={t("dash.openMistakesHint")}
          icon={<Target className="h-4 w-4 text-primary" />}
        />
        <StatCard
          label={t("dash.mastered")}
          value={String(mastered)}
          hint={t("dash.masteredHint")}
          icon={<Sparkles className="h-4 w-4 text-success" />}
        />
        <StatCard
          label={t("dash.weeklyXp")}
          value="+480"
          hint={t("dash.weeklyXpHint")}
          icon={<TrendingDown className="h-4 w-4 rotate-180 text-accent" />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="glass-card lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">{t("dash.weakness")}</CardTitle>
            <p className="text-sm text-muted-foreground">{t("dash.weaknessSub")}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {weaknessStats.map((s) => (
              <div key={s.topic} className="space-y-1.5">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                  <p className="truncate text-sm font-medium">
                    {term(s.subject)} — {term(s.topic)}
                  </p>
                  <span
                    className={`shrink-0 text-sm font-bold ${
                      s.accuracy < 60 ? "text-destructive" : "text-success"
                    }`}
                  >
                    {s.accuracy}%
                  </span>
                </div>
                <Progress
                  value={s.accuracy}
                  className={s.accuracy < 60 ? "h-2 bg-destructive/20" : "h-2 bg-success/20"}
                />
                <p className="text-xs text-muted-foreground">
                  {s.attempts} {t("dash.attempts")}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="glass-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">{t("dash.resolvedChart")}</CardTitle>
            <p className="text-sm text-muted-foreground">{t("dash.last7")}</p>
          </CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} width={24} />
                <Tooltip
                  cursor={{ fill: "var(--muted)" }}
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: "0.75rem",
                    color: "var(--popover-foreground)",
                  }}
                />
                <Bar dataKey="solved" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base">{t("dash.quickActions")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <AddMistakeDialog
            trigger={
              <Button className="h-auto justify-start gap-3 py-4">
                <Plus className="h-5 w-5 shrink-0" />
                <span className="text-left text-sm font-semibold">{t("dash.upload")}</span>
              </Button>
            }
          />
          <Button
            variant="secondary"
            className="h-auto justify-start gap-3 py-4"
            onClick={() => {
              awardXp(20);
              toast.success(t("dash.reviewToast"), {
                description: t("dash.reviewToastDesc"),
              });
              navigate({ to: "/practice", search: { id: undefined, mode: undefined } });
            }}
          >
            <CalendarCheck className="h-5 w-5 shrink-0 text-accent" />
            <span className="text-left text-sm font-semibold">{t("dash.startReview")}</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto justify-start gap-3 py-4"
            onClick={() => {
              toast(t("dash.quizToast"), {
                description: t("dash.quizToastDesc"),
              });
              navigate({ to: "/practice", search: { id: undefined, mode: undefined } });
            }}
          >
            <BrainCircuit className="h-5 w-5 shrink-0 text-primary" />
            <span className="text-left text-sm font-semibold">{t("dash.generateQuiz")}</span>
          </Button>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <CardTitle className="truncate text-base">{t("dash.todayFocus")}</CardTitle>
          <Badge className="shrink-0 bg-accent/15 text-accent">{t("dash.socraticMode")}</Badge>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>{t("dash.focusLine", { n: unresolved })}</p>
          <Button variant="link" className="px-0" onClick={() => navigate({ to: "/vault" })}>
            {t("dash.openVault")}
          </Button>
        </CardContent>
      </Card>
    </AppShell>
  );
}

function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="glass-card">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {icon}
          {label}
        </div>
        <p className="mt-2 font-display text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}
