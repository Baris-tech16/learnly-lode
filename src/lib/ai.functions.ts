import { createServerFn } from "@tanstack/react-start";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "openai/gpt-6-astra";

type ContentBlock =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

async function askAi(system: string, content: ContentBlock[]): Promise<string> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is not configured (missing key).");

  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key,
    },
    body: JSON.stringify({
      model: MODEL,
      reasoning_effort: "low",
      messages: [
        { role: "system", content: system },
        { role: "user", content },
      ],
    }),
  });

  const raw = await res.text();
  if (!res.ok) {
    if (res.status === 429) throw new Error("RATE_LIMIT");
    if (res.status === 402 || res.status === 403) throw new Error("AI_UNAVAILABLE");
    throw new Error(`AI request failed (${res.status}): ${raw.slice(0, 300)}`);
  }

  const payload = JSON.parse(raw) as {
    choices?: { message?: { content?: string } }[];
  };
  return payload.choices?.[0]?.message?.content ?? "";
}

function parseJson<T>(text: string): T {
  const cleaned = text
    .replace(/^\s*```(?:json)?/i, "")
    .replace(/```\s*$/, "")
    .trim();
  const start = cleaned.search(/[[{]/);
  const end = Math.max(cleaned.lastIndexOf("}"), cleaned.lastIndexOf("]"));
  if (start === -1 || end === -1) throw new Error("AI returned an unreadable answer.");
  return JSON.parse(cleaned.slice(start, end + 1)) as T;
}

export type ExtractedQuestion = {
  question: string;
  choices: string[];
  correctIndex: number;
  subject: string;
  topic: string;
  difficulty: string;
  confidence: number;
};

/** Reads a photo of a question (textbook / notes) and extracts its structure. */
export const aiExtractQuestion = createServerFn({ method: "POST" })
  .inputValidator((input: { imageDataUrl: string; lang: "en" | "tr" }) => {
    if (!input?.imageDataUrl?.startsWith("data:image/")) throw new Error("Invalid image");
    return input;
  })
  .handler(async ({ data }): Promise<ExtractedQuestion> => {
    const language = data.lang === "tr" ? "Turkish" : "English";
    const text = await askAi(
      `You are an OCR + exam-question parser. Read the photo of a school/exam question and return ONLY JSON:
{"question":string,"choices":string[],"correctIndex":number,"subject":"Math"|"Physics"|"Chemistry"|"Biology"|"History","topic":string,"difficulty":"Easy"|"Medium"|"Hard","confidence":number}
Rules: keep the original wording of the question, transcribe every visible choice (2-5 items) in order, drop the "A)"/"B)" prefixes, solve the question yourself to set correctIndex (0-based), and write subject/topic in ${language}. confidence is 0-100.`,
      [
        { type: "text", text: `Extract this question. Respond in ${language} where free text is needed.` },
        { type: "image_url", image_url: { url: data.imageDataUrl } },
      ],
    );
    const parsed = parseJson<ExtractedQuestion>(text);
    return {
      question: String(parsed.question ?? "").trim(),
      choices: (parsed.choices ?? []).map((c) => String(c)).filter(Boolean).slice(0, 5),
      correctIndex: Number.isInteger(parsed.correctIndex) ? parsed.correctIndex : 0,
      subject: parsed.subject ?? "Math",
      topic: parsed.topic ?? "General",
      difficulty: parsed.difficulty ?? "Medium",
      confidence: Math.min(100, Math.max(0, Math.round(Number(parsed.confidence) || 90))),
    };
  });

export type GeneratedExamQuestion = {
  subject: string;
  topic: string;
  difficulty: string;
  question: string;
  choices: string[];
  correctIndex: number;
  explanation: string[];
};

export type GenerateExamInput = {
  lang: "en" | "tr";
  topic?: string | undefined;
  imageDataUrl?: string | undefined;
  vaultSamples?: { subject: string; topic: string; question: string }[] | undefined;
  count?: number | undefined;
};

/** Generates a fresh timed practice exam from a topic, a photo of notes, or vault material. */
export const aiGenerateExam = createServerFn({ method: "POST" })
  .inputValidator((input: GenerateExamInput) => input)
  .handler(async ({ data }): Promise<GeneratedExamQuestion[]> => {
    const count = data.count ?? 10;
    const language = data.lang === "tr" ? "Turkish" : "English";
    const samples = (data.vaultSamples ?? [])
      .slice(0, 12)
      .map((s, i) => `${i + 1}. [${s.subject} / ${s.topic}] ${s.question}`)
      .join("\n");

    const blocks: ContentBlock[] = [
      {
        type: "text",
        text: [
          `Build a ${count}-question multiple-choice practice exam entirely in ${language}.`,
          data.topic ? `Requested topic/focus: ${data.topic}` : "",
          samples ? `Base the exam on the weaknesses shown by these saved wrong questions:\n${samples}` : "",
          data.imageDataUrl ? "Also use the attached photo of the student's notes/textbook page as the source material." : "",
        ]
          .filter(Boolean)
          .join("\n\n"),
      },
    ];
    if (data.imageDataUrl?.startsWith("data:image/")) {
      blocks.push({ type: "image_url", image_url: { url: data.imageDataUrl } });
    }

    const text = await askAi(
      `You are an exam author for high-school / university-entrance students. Return ONLY a JSON array of exactly ${count} objects:
{"subject":"Math"|"Physics"|"Chemistry"|"Biology"|"History","topic":string,"difficulty":"Easy"|"Medium"|"Hard","question":string,"choices":[4 strings],"correctIndex":number,"explanation":[3-5 strings]}
Rules: questions must be new (not copies), solvable without a calculator where possible, exactly 4 choices, correctIndex is 0-based and truly correct, explanation is a numbered step-by-step solution written in ${language}. All text in ${language}. No markdown, no commentary.`,
      blocks,
    );

    const parsed = parseJson<GeneratedExamQuestion[]>(text);
    const cleaned = (Array.isArray(parsed) ? parsed : [])
      .filter((q) => q && typeof q.question === "string" && Array.isArray(q.choices) && q.choices.length >= 2)
      .map((q) => ({
        subject: q.subject ?? "Math",
        topic: q.topic ?? "General",
        difficulty: q.difficulty ?? "Medium",
        question: String(q.question).trim(),
        choices: q.choices.map((c) => String(c)),
        correctIndex:
          Number.isInteger(q.correctIndex) && q.correctIndex >= 0 && q.correctIndex < q.choices.length
            ? q.correctIndex
            : 0,
        explanation: (Array.isArray(q.explanation) ? q.explanation : []).map((s) => String(s)),
      }));

    if (!cleaned.length) throw new Error("The AI could not build an exam from that material.");
    return cleaned.slice(0, count);
  });
