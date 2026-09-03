import { useNavigate } from "@tanstack/react-router";
import { AlarmClock, BrainCircuit, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuiz } from "@/lib/quiz-store";
import { useI18n } from "@/lib/i18n";

export function ReviewAlerts({ showAllClear = false }: { showAllClear?: boolean }) {
  const { pendingFirstPractice, weekReviewDue, dueIds } = useQuiz();
  const { t } = useI18n();
  const navigate = useNavigate();

  const startSmartReview = () => {
    toast.success(t("srs.smartToast"), {
      description: t("srs.smartToastDesc", { n: dueIds.length }),
    });
    navigate({ to: "/practice", search: { id: undefined, mode: "smart" } });
  };

  if (pendingFirstPractice.length === 0 && weekReviewDue.length === 0) {
    if (!showAllClear) return null;
    return (
      <Card className="glass-card border-success/40">
        <CardContent className="py-4 text-sm text-muted-foreground">
          {t("srs.allClear")}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-3">
      {pendingFirstPractice.length > 0 && (
        <Card className="glass-card border-destructive/50 bg-destructive/5">
          <CardContent className="grid gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <div className="flex min-w-0 gap-3">
              <AlarmClock className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
              <div className="min-w-0 space-y-1">
                <p className="text-sm leading-relaxed font-semibold">{t("srs.pendingBody")}</p>
                <p className="text-xs text-muted-foreground">
                  {t("srs.pendingCount", { n: pendingFirstPractice.length })}
                </p>
              </div>
            </div>
            <Button className="w-full shrink-0 sm:w-auto" onClick={startSmartReview}>
              <Sparkles className="mr-1.5 h-4 w-4" /> {t("srs.startSmart")}
            </Button>
          </CardContent>
        </Card>
      )}

      {weekReviewDue.length > 0 && (
        <Card className="glass-card border-accent/50 bg-accent/5">
          <CardContent className="grid gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <div className="flex min-w-0 gap-3">
              <BrainCircuit className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <div className="min-w-0 space-y-1">
                <p className="text-sm leading-relaxed font-semibold">{t("srs.decayBody")}</p>
                <p className="text-xs text-muted-foreground">
                  {t("srs.decayCount", { n: weekReviewDue.length })}
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              className="w-full shrink-0 sm:w-auto"
              onClick={startSmartReview}
            >
              <Sparkles className="mr-1.5 h-4 w-4 text-accent" /> {t("srs.startSmart")}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
