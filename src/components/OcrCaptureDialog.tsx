import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  Camera,
  Check,
  ImagePlus,
  Loader2,
  RotateCw,
  ScanLine,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DIFFICULTIES, SUBJECTS, type Difficulty, type Subject } from "@/lib/quiz-data";
import { aiExtractQuestion } from "@/lib/ai.functions";
import { useQuiz } from "@/lib/quiz-store";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";


/* ------------------------------------------------------------------ */
/* AI OCR extraction result                                            */
/* ------------------------------------------------------------------ */

type Extracted = {
  question: string;
  choices: string[];
  subject: Subject;
  topic: string;
  difficulty: Difficulty;
  correctIndex: number;
  confidence: number;
};


const LETTERS = ["A", "B", "C", "D", "E"];
const DEFAULT_CROP = { x: 8, y: 8, w: 84, h: 84 };

type Step = "source" | "crop" | "scanning" | "verify";
type Corner = "nw" | "ne" | "sw" | "se" | "move";

export function OcrCaptureDialog({ trigger }: { trigger: ReactNode }) {
  const { addMistake } = useQuiz();
  const { t, term, lang } = useI18n();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("source");
  const [src, setSrc] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [crop, setCrop] = useState(DEFAULT_CROP);
  const [dragging, setDragging] = useState<Corner | null>(null);
  const [dropActive, setDropActive] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [data, setData] = useState<Extracted | null>(null);
  const [notes, setNotes] = useState("");

  const stageRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const dragStart = useRef({ x: 0, y: 0, crop: DEFAULT_CROP });

  const reset = useCallback(() => {
    setStep("source");
    setSrc(null);
    setRotation(0);
    setZoom(1);
    setCrop(DEFAULT_CROP);
    setScanStep(0);
    setPreview(null);
    setData(null);
    setNotes("");
    setDropActive(false);
  }, []);

  function loadFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error(t("ocr.errType"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setSrc(String(reader.result));
      setRotation(0);
      setZoom(1);
      setCrop(DEFAULT_CROP);
      setStep("crop");
    };
    reader.readAsDataURL(file);
  }

  /* ------------------------- crop interactions ------------------------- */

  function onHandleDown(corner: Corner, e: React.PointerEvent) {
    e.preventDefault();
    e.stopPropagation();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    dragStart.current = { x: e.clientX, y: e.clientY, crop };
    setDragging(corner);
  }

  useEffect(() => {
    if (!dragging) return;
    const d = dragging;
    function move(e: PointerEvent) {
      const box = stageRef.current?.getBoundingClientRect();
      if (!box) return;
      const dx = ((e.clientX - dragStart.current.x) / box.width) * 100;
      const dy = ((e.clientY - dragStart.current.y) / box.height) * 100;
      const s = dragStart.current.crop;
      const min = 12;
      let next = { ...s };
      if (d === "move") {
        next.x = clamp(s.x + dx, 0, 100 - s.w);
        next.y = clamp(s.y + dy, 0, 100 - s.h);
      } else {
        if (d.includes("w")) {
          const x = clamp(s.x + dx, 0, s.x + s.w - min);
          next.w = s.w + (s.x - x);
          next.x = x;
        }
        if (d.includes("e")) next.w = clamp(s.w + dx, min, 100 - s.x);
        if (d.startsWith("n")) {
          const y = clamp(s.y + dy, 0, s.y + s.h - min);
          next.h = s.h + (s.y - y);
          next.y = y;
        }
        if (d.startsWith("s")) next.h = clamp(s.h + dy, min, 100 - s.y);
      }
      setCrop(next);
    }
    function up() {
      setDragging(null);
    }
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [dragging]);

  /* ----------------------------- processing ---------------------------- */

  function renderCrop(): string | null {
    const stage = stageRef.current;
    const img = imgRef.current;
    if (!stage || !img || !img.naturalWidth) return null;
    const cw = stage.clientWidth;
    const ch = stage.clientHeight;
    const canvas = document.createElement("canvas");
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const fit = Math.min(cw / img.naturalWidth, ch / img.naturalHeight);
    const w = img.naturalWidth * fit;
    const h = img.naturalHeight * fit;
    ctx.translate(cw / 2, ch / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    const out = document.createElement("canvas");
    const sx = (crop.x / 100) * cw;
    const sy = (crop.y / 100) * ch;
    const sw = Math.max(1, (crop.w / 100) * cw);
    const sh = Math.max(1, (crop.h / 100) * ch);
    out.width = sw;
    out.height = sh;
    out.getContext("2d")?.drawImage(canvas, sx, sy, sw, sh, 0, 0, sw, sh);
    return out.toDataURL("image/png");
  }

  async function process() {
    const cropped = renderCrop();
    setPreview(cropped);
    setStep("scanning");
    setScanStep(0);
    const timers = [1, 2, 3].map((i) => window.setTimeout(() => setScanStep(i), i * 900));
    try {
      if (!cropped) throw new Error("no-image");
      const result = await aiExtractQuestion({ data: { imageDataUrl: cropped, lang } });
      const choices = result.choices.length ? result.choices : ["", "", "", ""];
      setData({
        question: result.question,
        choices,
        subject: (SUBJECTS as string[]).includes(result.subject)
          ? (result.subject as Subject)
          : "Math",
        topic: result.topic,
        difficulty: (DIFFICULTIES as string[]).includes(result.difficulty)
          ? (result.difficulty as Difficulty)
          : "Medium",
        correctIndex: Math.min(Math.max(result.correctIndex, 0), choices.length - 1),
        confidence: result.confidence,
      });
      setStep("verify");
    } catch (err) {
      toast.error(t("exam.ocrError"), { description: (err as Error).message });
      setStep("crop");
    } finally {
      timers.forEach((id) => window.clearTimeout(id));
    }
  }


  function save() {
    if (!data) return;
    if (data.question.trim().length < 5) {
      toast.error(t("ocr.errQuestion"));
      return;
    }
    if (data.correctIndex < 0) {
      toast.error(t("ocr.errCorrect"));
      return;
    }
    addMistake({
      subject: data.subject,
      topic: data.topic,
      difficulty: data.difficulty,
      question: data.question.trim(),
      notes: notes.trim(),
      choices: data.choices.map((c) => c.trim()).filter(Boolean),
      correctIndex: data.correctIndex,
    });
    toast.success(t("ocr.saved"), { description: t("ocr.savedDesc") });
    reset();
    setOpen(false);
  }

  const scanLines = [t("ocr.scanStep1"), t("ocr.scanStep2"), t("ocr.scanStep3"), t("ocr.scanStep4")];

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanLine className="h-5 w-5 text-primary" /> {t("ocr.title")}
          </DialogTitle>
          <DialogDescription>
            {step === "verify" ? t("ocr.verifyDesc") : t("ocr.sourceDesc")}
          </DialogDescription>
        </DialogHeader>

        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => loadFile(e.target.files?.[0])}
        />
        <input
          ref={galleryRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => loadFile(e.target.files?.[0])}
        />

        {/* ---------------------------- step 1 ---------------------------- */}
        {step === "source" && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <SourceButton
                icon={<Camera className="h-5 w-5" />}
                title={t("ocr.takePhoto")}
                hint={t("ocr.takePhotoHint")}
                onClick={() => cameraRef.current?.click()}
              />
              <SourceButton
                icon={<ImagePlus className="h-5 w-5" />}
                title={t("ocr.gallery")}
                hint={t("ocr.galleryHint")}
                onClick={() => galleryRef.current?.click()}
              />
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDropActive(true);
              }}
              onDragLeave={() => setDropActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDropActive(false);
                loadFile(e.dataTransfer.files?.[0]);
              }}
              onClick={() => galleryRef.current?.click()}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed px-4 py-10 text-center transition-colors",
                dropActive
                  ? "border-primary bg-primary/10"
                  : "border-border bg-surface/50 hover:border-primary/60",
              )}
            >
              <UploadCloud className="h-7 w-7 text-muted-foreground" />
              <p className="text-sm font-medium">
                {dropActive ? t("ocr.dropActive") : t("ocr.dropTitle")}
              </p>
              <p className="text-xs text-muted-foreground">{t("ocr.dropHint")}</p>
            </div>
          </div>
        )}

        {/* ---------------------------- step 2 ---------------------------- */}
        {step === "crop" && src && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold">{t("ocr.cropTitle")}</h3>
              <p className="text-xs text-muted-foreground">{t("ocr.cropDesc")}</p>
            </div>

            <div
              ref={stageRef}
              className="relative h-72 touch-none overflow-hidden rounded-2xl border border-border bg-black/40 select-none sm:h-80"
            >
              <img
                ref={imgRef}
                src={src}
                alt="Captured question"
                draggable={false}
                className="pointer-events-none absolute inset-0 h-full w-full object-contain"
                style={{ transform: `rotate(${rotation}deg) scale(${zoom})` }}
              />
              <div className="pointer-events-none absolute inset-0 bg-background/60" />
              <div
                onPointerDown={(e) => onHandleDown("move", e)}
                className="absolute cursor-move rounded-lg border-2 border-primary shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]"
                style={{
                  left: `${crop.x}%`,
                  top: `${crop.y}%`,
                  width: `${crop.w}%`,
                  height: `${crop.h}%`,
                  backdropFilter: "brightness(1.9)",
                }}
              >
                {(["nw", "ne", "sw", "se"] as const).map((c) => (
                  <span
                    key={c}
                    onPointerDown={(e) => onHandleDown(c, e)}
                    className={cn(
                      "absolute h-5 w-5 rounded-full border-2 border-primary bg-background",
                      c === "nw" && "-top-2.5 -left-2.5 cursor-nwse-resize",
                      c === "ne" && "-top-2.5 -right-2.5 cursor-nesw-resize",
                      c === "sw" && "-bottom-2.5 -left-2.5 cursor-nesw-resize",
                      c === "se" && "-right-2.5 -bottom-2.5 cursor-nwse-resize",
                    )}
                  />
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-[auto_1fr_auto] sm:items-center">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setRotation((r) => (r + 90) % 360)}
              >
                <RotateCw className="mr-1.5 h-4 w-4" /> {t("ocr.rotate")}
              </Button>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">{t("ocr.zoom")}</span>
                <Slider
                  value={[zoom]}
                  min={0.5}
                  max={2.5}
                  step={0.05}
                  onValueChange={(v) => setZoom(v[0] ?? 1)}
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCrop(DEFAULT_CROP);
                  setZoom(1);
                  setRotation(0);
                }}
              >
                {t("ocr.reset")}
              </Button>
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="ghost" onClick={reset}>
                {t("ocr.back")}
              </Button>
              <Button onClick={() => void process()}>
                <Sparkles className="mr-1.5 h-4 w-4" /> {t("ocr.process")}
              </Button>
            </div>
          </div>
        )}

        {/* ---------------------------- step 3 ---------------------------- */}
        {step === "scanning" && (
          <div className="space-y-6 py-6">
            <div className="relative mx-auto h-44 w-full max-w-sm overflow-hidden rounded-2xl border border-primary/40 bg-black/40">
              {preview && (
                <img
                  src={preview}
                  alt="Cropped question"
                  className="h-full w-full object-contain opacity-70"
                />
              )}
              <div className="absolute inset-x-0 h-1 animate-[scan_1.6s_ease-in-out_infinite] bg-primary/80 shadow-[0_0_18px_4px_var(--primary)]" />
            </div>
            <div className="space-y-3 text-center">
              <p className="flex items-center justify-center gap-2 text-sm font-medium">
                <Loader2 className="h-4 w-4 animate-spin text-primary" /> {t("ocr.scanning")}
              </p>
              <ul className="mx-auto max-w-sm space-y-1.5 text-left">
                {scanLines.map((line, i) => (
                  <li
                    key={line}
                    className={cn(
                      "flex items-center gap-2 text-xs transition-opacity",
                      i <= scanStep ? "text-foreground" : "text-muted-foreground/50",
                    )}
                  >
                    {i < scanStep ? (
                      <Check className="h-3.5 w-3.5 text-success" />
                    ) : i === scanStep ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                    ) : (
                      <span className="h-3.5 w-3.5 rounded-full border border-border" />
                    )}
                    {line}
                  </li>
                ))}
              </ul>
            </div>
            <style>{`@keyframes scan{0%{top:4%}50%{top:92%}100%{top:4%}}`}</style>
          </div>
        )}

        {/* ---------------------------- step 4 ---------------------------- */}
        {step === "verify" && data && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-success/15 text-success">
                <Check className="mr-1 h-3 w-3" /> {t("ocr.detected")}
              </Badge>
              <Badge variant="outline">{t("ocr.confidence", { n: data.confidence })}</Badge>
              <Badge className="bg-primary/15 text-primary">
                {term(data.subject)} · {term(data.topic)}
              </Badge>
            </div>

            {preview && (
              <img
                src={preview}
                alt="Cropped question"
                className="max-h-40 w-full rounded-xl border border-border object-contain"
              />
            )}

            <div className="space-y-2">
              <Label htmlFor="ocr-q">{t("ocr.questionText")}</Label>
              <Textarea
                id="ocr-q"
                rows={3}
                value={data.question}
                onChange={(e) => setData({ ...data, question: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>{t("ocr.choices")}</Label>
              <p className="text-xs text-muted-foreground">{t("ocr.pickCorrect")}</p>
              <div className="space-y-2">
                {data.choices.map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setData({ ...data, correctIndex: i })}
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-sm font-semibold transition-colors",
                        data.correctIndex === i
                          ? "border-success bg-success/15 text-success"
                          : "border-border text-muted-foreground hover:border-primary/60",
                      )}
                      aria-label={`${t("ocr.correctAnswer")} ${LETTERS[i]}`}
                    >
                      {LETTERS[i]}
                    </button>
                    <Input
                      value={c}
                      onChange={(e) => {
                        const choices = [...data.choices];
                        choices[i] = e.target.value;
                        setData({ ...data, choices });
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>{t("ocr.subject")}</Label>
                <Select
                  value={data.subject}
                  onValueChange={(v) => setData({ ...data, subject: v as Subject })}
                >
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
                <Label htmlFor="ocr-topic">{t("ocr.topic")}</Label>
                <Input
                  id="ocr-topic"
                  value={data.topic}
                  onChange={(e) => setData({ ...data, topic: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("ocr.difficulty")}</Label>
                <Select
                  value={data.difficulty}
                  onValueChange={(v) => setData({ ...data, difficulty: v as Difficulty })}
                >
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
              <Label htmlFor="ocr-notes">{t("ocr.notes")}</Label>
              <Textarea
                id="ocr-notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="ghost" onClick={() => setStep("crop")}>
                {t("ocr.rescan")}
              </Button>
              <Button onClick={save}>{t("ocr.save")}</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function SourceButton({
  icon,
  title,
  hint,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 rounded-2xl border border-border bg-surface/60 p-4 text-left transition-colors hover:border-primary/60 hover:bg-surface"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold">{title}</span>
        <span className="block truncate text-xs text-muted-foreground">{hint}</span>
      </span>
    </button>
  );
}

function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max);
}
