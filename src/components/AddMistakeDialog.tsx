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

export function AddMistakeDialog({ trigger }: { trigger: ReactNode }) {
  const { addMistake } = useQuiz();
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
      toast.error("Write the question first (at least a few words).");
      return;
    }
    if (mode === "image" && !imageName) {
      toast.error("Pick an image of the question.");
      return;
    }
    addMistake({
      subject,
      difficulty,
      topic: topic.trim(),
      question: question.trim() || "Question captured from image",
      notes: notes.trim(),
      imageName,
    });
    toast.success("Added to your Mistake Vault", {
      description: "The Socratic Coach prepared hints for it.",
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
          <DialogTitle>Add a wrong question</DialogTitle>
          <DialogDescription>
            Capture the mistake while it is fresh — and say why you missed it.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={mode} onValueChange={setMode}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text">
              <Type className="mr-1.5 h-4 w-4" /> Type it
            </TabsTrigger>
            <TabsTrigger value="image">
              <ImagePlus className="mr-1.5 h-4 w-4" /> Upload image
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-4">
          {mode === "text" ? (
            <div className="space-y-2">
              <Label htmlFor="q">Question</Label>
              <Textarea
                id="q"
                rows={4}
                placeholder="Paste or type the question you got wrong…"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="img">Question image</Label>
              <label
                htmlFor="img"
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-surface/60 px-4 py-8 text-center transition-colors hover:border-primary/60"
              >
                <ImagePlus className="h-6 w-6 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {imageName ?? "Tap to select a photo of the question"}
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
              <Label>Subject</Label>
              <Select value={subject} onValueChange={(v) => setSubject(v as Subject)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTIES.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic">Topic</Label>
            <Input
              id="topic"
              placeholder="e.g. Kinematics"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Why did you get it wrong?</Label>
            <Textarea
              id="notes"
              rows={3}
              placeholder="e.g. I forgot to check the domain of the logarithm."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>Save to Vault</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
