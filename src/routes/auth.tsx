import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — QuizForge" },
      {
        name: "description",
        content:
          "Sign in to QuizForge to keep your mistake vault, AI exams and step-by-step explanations saved to your account.",
      },
      { property: "og:title", content: "Sign in — QuizForge" },
      { property: "og:description", content: "Save your mistake vault and AI exams to your account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) void navigate({ to: "/vault" });
    });
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) void navigate({ to: "/vault" });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "up") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success(t("auth.checkEmail"));
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success(t("auth.welcome"));
      }
    } catch (err) {
      toast.error(t("auth.error"), { description: (err as Error).message });
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error(t("auth.error"), { description: String(result.error) });
      return;
    }
    if (result.redirected) return;
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-background p-4">
      <div className="w-full max-w-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="gradient-primary grid h-10 w-10 place-items-center rounded-xl">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <p className="font-display text-lg font-bold">QuizForge</p>
          </div>
          <LanguageSwitcher />
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base">{t("auth.title")}</CardTitle>
            <p className="text-sm text-muted-foreground">{t("auth.subtitle")}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <form className="space-y-3" onSubmit={submit}>
              <div className="space-y-1.5">
                <Label htmlFor="email">{t("auth.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                {mode === "in" ? t("auth.signIn") : t("auth.signUp")}
              </Button>
            </form>

            <Button variant="secondary" className="w-full" onClick={google}>
              {t("auth.google")}
            </Button>

            <button
              type="button"
              className="w-full text-xs text-muted-foreground underline-offset-4 hover:underline"
              onClick={() => setMode((m) => (m === "in" ? "up" : "in"))}
            >
              {mode === "in" ? t("auth.toSignUp") : t("auth.toSignIn")}
            </button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
