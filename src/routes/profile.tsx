import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  AtSign,
  CalendarCheck,
  Flame,
  KeyRound,
  LogOut,
  Phone,
  ShieldAlert,
  Sparkles,
  Trash2,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell, TopHeader } from "@/components/AppShell";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";
import { useQuiz } from "@/lib/quiz-store";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your Profile & Security — QuizForge" },
      {
        name: "description",
        content:
          "Manage your QuizForge account: email, account type, phone, password, streak tracking, sign out and account deletion.",
      },
      { property: "og:title", content: "Your Profile & Security — QuizForge" },
      {
        property: "og:description",
        content:
          "Account details, streak tracking and security settings for your QuizForge Mistake Vault.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

const ACCOUNT = {
  name: "Barış Vatansever",
  email: "baris.vatansever@quizforge.app",
  phone: "+90 532 000 00 00",
  memberSince: "2026-03-14",
  daysActive: 68,
};

function Row({
  icon: Icon,
  label,
  value,
  action,
}: {
  icon: typeof AtSign;
  label: string;
  value: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3.5">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10">
        <Icon className="h-4.5 w-4.5 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-semibold">{value}</p>
      </div>
      {action}
    </div>
  );
}

function ProfilePage() {
  const { t } = useI18n();
  const { streak, level, xp } = useQuiz();
  const navigate = useNavigate();

  const [pwOpen, setPwOpen] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const submitPassword = () => {
    if (current.length < 6 || next.length < 8) {
      toast.error(t("profile.pwErrShort"));
      return;
    }
    if (next !== confirm) {
      toast.error(t("profile.pwErrMatch"));
      return;
    }
    setPwOpen(false);
    setCurrent("");
    setNext("");
    setConfirm("");
    toast.success(t("profile.pwUpdated"), { description: t("profile.pwUpdatedDesc") });
  };

  return (
    <AppShell>
      <TopHeader />

      <Card className="glass-card overflow-hidden">
        <CardContent className="flex flex-wrap items-center gap-4 p-5">
          <div className="gradient-primary grid h-14 w-14 shrink-0 place-items-center rounded-2xl">
            <UserRound className="h-7 w-7 text-primary-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-xl font-bold">{ACCOUNT.name}</h1>
            <p className="truncate text-sm text-muted-foreground">{ACCOUNT.email}</p>
          </div>
          <Badge className="gap-1.5 bg-accent/15 text-accent">
            <Sparkles className="h-3.5 w-3.5" />
            {t("profile.plan")}
          </Badge>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base">{t("profile.account")}</CardTitle>
          <p className="text-sm text-muted-foreground">{t("profile.accountSub")}</p>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Row icon={AtSign} label={t("profile.email")} value={ACCOUNT.email} />
          <Row icon={Sparkles} label={t("profile.type")} value={t("profile.plan")} />
          <Row
            icon={Phone}
            label={`${t("profile.phone")} (${t("profile.optional")})`}
            value={ACCOUNT.phone}
          />
          <Row icon={CalendarCheck} label={t("profile.since")} value={ACCOUNT.memberSince} />
          <div className="sm:col-span-2">
            <Button variant="outline" className="w-full gap-2" onClick={() => setPwOpen(true)}>
              <KeyRound className="h-4 w-4" />
              {t("profile.changePw")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base">{t("profile.usage")}</CardTitle>
          <p className="text-sm text-muted-foreground">{t("profile.usageSub")}</p>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-surface p-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarCheck className="h-4 w-4" />
              <p className="text-xs">{t("profile.daysActive")}</p>
            </div>
            <p className="mt-2 font-display text-3xl font-bold">{ACCOUNT.daysActive}</p>
            <p className="text-xs text-muted-foreground">{t("profile.daysActiveHint")}</p>
          </div>
          <div className="rounded-2xl border border-accent/30 bg-accent/10 p-4">
            <div className="flex items-center gap-2 text-accent">
              <Flame className="h-4 w-4 text-flame" />
              <p className="text-xs">{t("profile.consecutive")}</p>
            </div>
            <p className="mt-2 font-display text-3xl font-bold text-accent">{streak}</p>
            <p className="text-xs text-muted-foreground">{t("profile.consecutiveHint")}</p>
          </div>
          <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="h-4 w-4" />
              <p className="text-xs">
                {t("header.level")} · {t("header.xp")}
              </p>
            </div>
            <p className="mt-2 font-display text-3xl font-bold text-primary">{level}</p>
            <p className="text-xs text-muted-foreground">
              {xp.toLocaleString()} {t("header.xp")}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldAlert className="h-4 w-4 text-destructive" />
            {t("profile.security")}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{t("profile.securitySub")}</p>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Button variant="outline" className="w-full gap-2" onClick={() => setLogoutOpen(true)}>
            <LogOut className="h-4 w-4" />
            {t("profile.logout")}
          </Button>
          <Button variant="destructive" className="w-full gap-2" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-4 w-4" />
            {t("profile.delete")}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={pwOpen} onOpenChange={setPwOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("profile.changePw")}</DialogTitle>
            <DialogDescription>{t("profile.changePwDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="pw-current">{t("profile.currentPw")}</Label>
              <Input
                id="pw-current"
                type="password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pw-new">{t("profile.newPw")}</Label>
              <Input
                id="pw-new"
                type="password"
                value={next}
                onChange={(e) => setNext(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pw-confirm">{t("profile.confirmPw")}</Label>
              <Input
                id="pw-confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPwOpen(false)}>
              {t("add.cancel")}
            </Button>
            <Button onClick={submitPassword}>{t("profile.savePw")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("profile.logoutConfirm")}</AlertDialogTitle>
            <AlertDialogDescription>{t("profile.logoutConfirmDesc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("add.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                toast.success(t("profile.loggedOut"));
                void navigate({ to: "/" });
              }}
            >
              {t("profile.logout")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("profile.deleteConfirm")}</AlertDialogTitle>
            <AlertDialogDescription>{t("profile.deleteConfirmDesc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("add.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() =>
                toast.error(t("profile.deleteQueued"), {
                  description: t("profile.deleteQueuedDesc"),
                })
              }
            >
              {t("profile.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
