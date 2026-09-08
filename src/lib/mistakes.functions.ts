import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type DbMistake = {
  id: string;
  subject: string;
  topic: string;
  difficulty: string;
  mastery: string;
  question: string;
  choices: string[];
  correct_index: number;
  hints: string[];
  solution: string;
  notes: string;
  attempts: number;
  last_practiced_at: string | null;
  created_at: string;
};

export type NewDbMistake = {
  subject: string;
  topic: string;
  difficulty: string;
  question: string;
  choices: string[];
  correctIndex: number;
  hints?: string[];
  solution?: string;
  notes?: string;
  source?: string;
};

export const listMistakes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("mistakes")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as DbMistake[];
  });

export const saveMistakes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { items: NewDbMistake[] }) => input)
  .handler(async ({ data, context }) => {
    const rows = data.items.map((m) => ({
      user_id: context.userId,
      subject: m.subject,
      topic: m.topic || "General",
      difficulty: m.difficulty,
      question: m.question,
      choices: m.choices,
      correct_index: m.correctIndex,
      hints: m.hints ?? [],
      solution: m.solution ?? "",
      notes: m.notes ?? "",
      source: m.source ?? "manual",
    }));
    const { data: inserted, error } = await context.supabase
      .from("mistakes")
      .insert(rows)
      .select("*");
    if (error) throw new Error(error.message);
    return (inserted ?? []) as unknown as DbMistake[];
  });

export const updateMistake = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: { id: string; mastery?: string; attempts?: number; lastPracticedAt?: string }) => input,
  )
  .handler(async ({ data, context }) => {
    const patch: { mastery?: string; attempts?: number; last_practiced_at?: string } = {};
    if (data.mastery) patch.mastery = data.mastery;
    if (typeof data.attempts === "number") patch.attempts = data.attempts;
    if (data.lastPracticedAt) patch.last_practiced_at = data.lastPracticedAt;
    const { error } = await context.supabase.from("mistakes").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
