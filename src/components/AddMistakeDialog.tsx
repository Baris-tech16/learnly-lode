import { useState, type ReactNode } from "react";
import { ImagePlus, Type } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DIFFICULTIES, SUBJECTS, type Difficulty, type Subject } from "@/lib/quiz-data";
import { useQuiz } from "@/lib/quiz-store";
import { useI18n } from "@/lib/i18n";

export function AddMistakeDialog({ trigger }: { trigger: ReactNode }) {
  const { addMistake } = useQuiz();
  const { t, term } = useI18n();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("text");
  const [subject, setSubject] = useState<Subject>("Math");
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [topic, setTopic] = useState("");
  const [question, setQuestion] = useState("");
  const [notes, setNotes] = useState("");
  const [imageName, setImageName] = useState<string | undefined>();

  function reset() {
    setTopic("");
    setQuestion("");
    setNotes("");
    setImageName(undefined);
    setMode("text");
  }

  function submit() {
    if (mode === "text" && question.trim().length < 5) {
      toast.error(t("add.errQuestion"));
      return;
    }
    if (mode === "image" && !imageName) {
      toast.error(t("add.errImage"));
      return;
    }
    addMistake({
      subject,
      difficulty,
      topic: topic.trim(),
      question: question.trim() || t("add.fromImage"),
      notes: notes.trim(),
      imageName,
    });
    toast.success(t("add.saved"), {
      description: t("add.savedDesc"),
    });
    reset();
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("add.title")}</DialogTitle>
          <DialogDescription>{t("add.desc")}</DialogDescription>
        </DialogHeader>

        <Tabs value={mode} onValueChange={setMode}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text">
              <Type className="mr-1.5 h-4 w-4" /> {t("add.typeIt")}
            </TabsTrigger>
            <TabsTrigger value="image">
              <ImagePlus className="mr-1.5 h-4 w-4" /> {t("add.uploadImage")}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-4">
          {mode === "text" ? (
            <div className="space-y-2">
              <Label htmlFor="q">{t("add.question")}</Label>
              <Textarea
                id="q"
                rows={4}
                placeholder={t("add.questionPlaceholder")}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="img">{t("add.imageLabel")}</Label>
              <label
                htmlFor="img"
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-surface/60 px-4 py-8 text-center transition-colors hover:border-primary/60"
              >
                <ImagePlus className="h-6 w-6 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {imageName ?? t("add.imagePlaceholder")}
                </span>
              </label>
              <Input
                id="img"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setImageName(e.target.files?.[0]?.name)}
              />
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("add.subject")}</Label>
              <Select value={subject} onValueChange={(v) => setSubject(v as Subject)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {term(s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("add.difficulty")}</Label>
              <Select value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTIES.map((d) => (
                    <SelectItem key={d} value={d}>
                      {term(d)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic">{t("add.topic")}</Label>
            <Input
              id="topic"
              placeholder={t("add.topicPlaceholder")}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t("add.why")}</Label>
            <Textarea
              id="notes"
              rows={3}
              placeholder={t("add.whyPlaceholder")}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            {t("add.cancel")}
          </Button>
          <Button onClick={submit}>{t("add.save")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
