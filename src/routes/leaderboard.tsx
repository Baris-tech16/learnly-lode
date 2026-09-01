import { createFileRoute } from "@tanstack/react-router";
import { Crown, Flame, Trophy } from "lucide-react";
import { AppShell, TopHeader } from "@/components/AppShell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { badges, leaderboard } from "@/lib/quiz-data";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard & Badges — QuizForge" },
      {
        name: "description",
        content:
          "Weekly XP leaderboard and achievement badges earned by resolving wrong questions in QuizForge.",
      },
      { property: "og:title", content: "Leaderboard & Badges — QuizForge" },
      {
        property: "og:description",
        content: "Compete weekly on XP earned from mastering your mistakes.",
      },
    ],
  }),
  component: LeaderboardPage,
});

function LeaderboardPage() {
  return (
    <AppShell>
      <TopHeader />

      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-xl font-bold">Weekly leaderboard</h2>
          <p className="truncate text-sm text-muted-foreground">Resets Sunday at midnight</p>
        </div>
        <Badge className="gradient-flame shrink-0 text-accent-foreground">
          <Trophy className="mr-1 h-3 w-3" /> Season 4
        </Badge>
      </div>

      <Card className="glass-card overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Student</TableHead>
                <TableHead className="text-right">XP</TableHead>
                <TableHead className="hidden text-right sm:table-cell">Resolved</TableHead>
                <TableHead className="hidden text-right sm:table-cell">Streak</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboard.map((r) => (
                <TableRow key={r.rank} className={r.isYou ? "bg-primary/10" : undefined}>
                  <TableCell className="font-bold">
                    {r.rank === 1 ? (
                      <Crown className="h-4 w-4 text-accent" />
                    ) : (
                      <span className="text-muted-foreground">{r.rank}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="bg-secondary text-xs font-bold">
                          {r.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate text-sm font-medium">
                        {r.name}
                        {r.isYou && <span className="ml-2 text-xs text-primary">You</span>}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-sm font-bold text-primary">
                    {r.xp.toLocaleString()}
                  </TableCell>
                  <TableCell className="hidden text-right text-sm sm:table-cell">
                    {r.resolved}
                  </TableCell>
                  <TableCell className="hidden text-right text-sm sm:table-cell">
                    <span className="inline-flex items-center gap-1 text-flame">
                      <Flame className="h-3.5 w-3.5" />
                      {r.streak}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base">Achievement badges</CardTitle>
          <p className="text-sm text-muted-foreground">
            Earned by resolving mistakes, not by grinding new questions.
          </p>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {badges.map((b) => (
            <div
              key={b.id}
              className={`rounded-2xl border p-4 ${
                b.earned ? "border-accent/40 bg-accent/10" : "border-border bg-surface/60 opacity-80"
              }`}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-background/60 text-xl">
                  {b.icon}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{b.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{b.description}</p>
                </div>
              </div>
              {b.earned ? (
                <Badge className="mt-3 bg-success/15 text-success">Unlocked</Badge>
              ) : (
                <div className="mt-3 space-y-1">
                  <Progress value={b.progress} className="h-1.5" />
                  <p className="text-xs text-muted-foreground">{b.progress}% complete</p>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </AppShell>
  );
}
