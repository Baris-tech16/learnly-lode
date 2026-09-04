export type ServerId = "tr" | "global";

export type ChatUser = {
  handle: string;
  name: string;
  level: number;
  color: string;
  initials: string;
};

export type ChatMessage = {
  id: string;
  handle: string;
  minutesAgo: number;
  text: string;
  replyToId?: string;
  questionId?: string;
};

export const CURRENT_USER: ChatUser = {
  handle: "Baris",
  name: "Barış",
  level: 8,
  color: "bg-primary/20 text-primary",
  initials: "BV",
};

export const MEMBERS: Record<ServerId, ChatUser[]> = {
  tr: [
    CURRENT_USER,
    { handle: "ZeynepK", name: "Zeynep K.", level: 12, color: "bg-accent/20 text-accent", initials: "ZK" },
    { handle: "MertA", name: "Mert A.", level: 6, color: "bg-success/20 text-success", initials: "MA" },
    { handle: "ElifDemir", name: "Elif Demir", level: 15, color: "bg-destructive/20 text-destructive", initials: "ED" },
    { handle: "CanTutor", name: "Can (Koç)", level: 21, color: "bg-primary/20 text-primary", initials: "CT" },
  ],
  global: [
    CURRENT_USER,
    { handle: "Amara", name: "Amara O.", level: 11, color: "bg-accent/20 text-accent", initials: "AO" },
    { handle: "Lukas", name: "Lukas M.", level: 9, color: "bg-success/20 text-success", initials: "LM" },
    { handle: "Priya", name: "Priya S.", level: 17, color: "bg-destructive/20 text-destructive", initials: "PS" },
    { handle: "MsChen", name: "Ms. Chen", level: 24, color: "bg-primary/20 text-primary", initials: "MC" },
  ],
};

export const ONLINE_COUNT: Record<ServerId, number> = { tr: 128, global: 412 };
export const MEMBER_COUNT: Record<ServerId, number> = { tr: 2140, global: 9876 };

export const SEED_MESSAGES: Record<ServerId, ChatMessage[]> = {
  tr: [
    {
      id: "tr1",
      handle: "CanTutor",
      minutesAgo: 42,
      text: "Günaydın herkese! Bugün kinematik çalışıyoruz, takıldığınız soruyu buraya atın 🚀",
    },
    {
      id: "tr2",
      handle: "ZeynepK",
      minutesAgo: 31,
      text: "Logaritma sorularında tanım kümesini sürekli unutuyorum, tüyo var mı?",
    },
    {
      id: "tr3",
      handle: "ElifDemir",
      minutesAgo: 27,
      replyToId: "tr2",
      text: "@ZeynepK önce içerideki ifadeyi > 0 yaz, sonra çöz. Ben hep böyle kontrol ediyorum 💡",
    },
    {
      id: "tr4",
      handle: "MertA",
      minutesAgo: 14,
      text: "Defterimden bir soru paylaşıyorum, ikinci şıkkı neden eledik anlamadım 👇",
      questionId: "m1",
    },
    {
      id: "tr5",
      handle: "ZeynepK",
      minutesAgo: 6,
      text: "@Baris senin seri 7 gün olmuş, nasıl başardın? 🔥",
    },
  ],
  global: [
    {
      id: "g1",
      handle: "MsChen",
      minutesAgo: 55,
      text: "Welcome newcomers! Share the question you got wrong — we solve it together, Socratic style 🎯",
    },
    {
      id: "g2",
      handle: "Lukas",
      minutesAgo: 38,
      text: "Stoichiometry is destroying me. Anyone has a clean mole-ratio checklist?",
    },
    {
      id: "g3",
      handle: "Priya",
      minutesAgo: 33,
      replyToId: "g2",
      text: "@Lukas balance first, grams → moles, then apply the ratio. Never skip the balancing step 🙂",
    },
    {
      id: "g4",
      handle: "Amara",
      minutesAgo: 12,
      text: "Sharing one from my vault — I keep picking the wrong distractor here 👇",
      questionId: "m3",
    },
    {
      id: "g5",
      handle: "Priya",
      minutesAgo: 3,
      text: "@Baris nice streak! Want to join our weekend review sprint? 🔥",
    },
  ],
};

/** Scripted follow-up used to simulate an incoming @mention push notification. */
export const SCRIPTED_MENTIONS: Record<ServerId, { handle: string; text: string }> = {
  tr: {
    handle: "CanTutor",
    text: "@Baris bu soruyu bir de sen dener misin? Yaklaşımını merak ediyorum 🎯",
  },
  global: {
    handle: "MsChen",
    text: "@Baris could you explain your approach on this one? Others would learn a lot 🎯",
  },
};

export const MENTION_RE = /@([A-Za-z0-9_]+)/g;
