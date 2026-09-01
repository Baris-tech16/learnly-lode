import { Link } from "@tanstack/react-router";
import { BrainCircuit, Flame, LayoutDashboard, Library, Trophy, Zap } from "lucide-react";
import type { ReactNode } from "react";
import { useQuiz } from "@/lib/quiz-store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/vault", label: "Vault", icon: Library },
  { to: "/practice", label: "Practice", icon: BrainCircuit },
  { to: "/leaderboard", label: "Ranks", icon: Trophy },
] as const;

function SideNav() {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-border bg-sidebar p-5 md:flex">
      <div className="flex items-center gap-3">
        <div className="gradient-primary grid h-10 w-10 shrink-0 place-items-center rounded-xl">
          <Zap className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-display text-base font-bold">QuizForge</p>
          <p className="truncate text-xs text-muted-foreground">Mistake Vault</p>
        </div>
      </div>

      <nav className="mt-8 flex flex-col gap-1">
        {NAV.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: to === "/" }}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            activeProps={{
              className:
                "!bg-primary/15 !text-primary ring-1 ring-primary/30",
            }}
          >
            <Icon className="h-4.5 w-4.5 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto rounded-2xl border border-border bg-surface p-4">
        <p className="text-xs text-muted-foreground">Socratic Coach</p>
        <p className="mt-1 text-sm font-semibold">
          Never get the answer. Get the next question.
        </p>
      </div>
    </aside>
  );
}

function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-border bg-sidebar/95 backdrop-blur md:hidden">
      {NAV.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          activeOptions={{ exact: to === "/" }}
          className="flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-muted-foreground"
          activeProps={{ className: "!text-primary" }}
        >
          <Icon className="h-5 w-5" />
          {label}
        </Link>
      ))}
    </nav>
  );
}

export function TopHeader() {
  const { level, xp, streak, xpIntoLevel, xpForLevel } = useQuiz();
  return (
    <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:flex-wrap sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar className="h-11 w-11 shrink-0 ring-2 ring-primary/50">
          <AvatarFallback className="gradient-primary font-bold text-primary-foreground">
            BV
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm text-muted-foreground">Welcome back,</p>
          <h1 className="truncate text-lg font-bold sm:text-xl">Barış</h1>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <div className="rounded-xl border border-primary/30 bg-primary/10 px-3 py-2">
          <p className="text-xs font-semibold text-primary">
            Level {level} · {xp.toLocaleString()} XP
          </p>
          <Progress
            value={(xpIntoLevel / xpForLevel) * 100}
            className="mt-1.5 h-1.5 w-24 bg-primary/20 sm:w-32"
          />
        </div>
        <div className="flex items-center gap-1.5 rounded-xl border border-accent/30 bg-accent/10 px-3 py-2.5">
          <Flame className="h-4 w-4 text-flame" />
          <span className="text-xs font-bold text-accent">{streak} Day</span>
        </div>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <SideNav />
      <BottomNav />
      <div className="md:pl-64">
        <main className="mx-auto w-full max-w-5xl px-4 pt-6 pb-24 md:px-8 md:pb-10">
          <div className="space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
