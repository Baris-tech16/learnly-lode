import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Flag, MessagesSquare, Reply, Send, Users, X } from "lucide-react";
import { toast } from "sonner";

import { AppShell, TopHeader } from "@/components/AppShell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CURRENT_USER,
  MEMBERS,
  MEMBER_COUNT,
  MENTION_RE,
  ONLINE_COUNT,
  SCRIPTED_MENTIONS,
  SEED_MESSAGES,
  type ChatMessage,
  type ChatUser,
  type ServerId,
} from "@/lib/community-data";
import { useI18n } from "@/lib/i18n";
import { useQuiz } from "@/lib/quiz-store";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Community Global Chat — QuizForge" },
      {
        name: "description",
        content:
          "Join the Turkish and Global study servers: share vault questions, mention classmates and get help on the exact question you missed.",
      },
      { property: "og:title", content: "Community Global Chat — QuizForge" },
      {
        property: "og:description",
        content: "Multi-server student chat with question sharing and @mention alerts.",
      },
    ],
  }),
  component: CommunityPage,
});

function CommunityPage() {
  const { t, term, localizeMistake } = useI18n();
  const { mistakes } = useQuiz();
  const navigate = useNavigate();

  const [server, setServer] = useState<ServerId>("tr");
  const [messages, setMessages] = useState<Record<ServerId, ChatMessage[]>>(() => ({
    tr: [...SEED_MESSAGES.tr],
    global: [...SEED_MESSAGES.global],
  }));
  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [attachedId, setAttachedId] = useState<string | null>(null);
  const [actionsFor, setActionsFor] = useState<ChatMessage | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const feedEndRef = useRef<HTMLDivElement>(null);

  const members = MEMBERS[server];
  const list = messages[server];

  const byHandle = useMemo(() => {
    const map: Record<string, ChatUser> = {};
    for (const m of members) map[m.handle] = m;
    return map;
  }, [members]);

  const mentionQuery = useMemo(() => {
    const match = /(?:^|\s)@([A-Za-z0-9_]*)$/.exec(draft);
    return match ? (match[1] ?? "") : null;
  }, [draft]);

  const mentionMatches = useMemo(() => {
    if (mentionQuery === null) return [];
    const q = mentionQuery.toLowerCase();
    return members.filter(
      (m) => m.handle !== CURRENT_USER.handle && m.handle.toLowerCase().startsWith(q),
    );
  }, [mentionQuery, members]);

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ block: "end" });
  }, [list.length, server]);

  // Simulated incoming @mention push notification for the signed-in student.
  useEffect(() => {
    const script = SCRIPTED_MENTIONS[server];
    const timer = window.setTimeout(() => {
      const author = MEMBERS[server].find((m) => m.handle === script.handle);
      const incoming: ChatMessage = {
        id: `${server}-mention-${Date.now()}`,
        handle: script.handle,
        minutesAgo: 0,
        text: script.text,
      };
      setMessages((prev) => ({ ...prev, [server]: [...prev[server], incoming] }));
      toast(t("chat.mentionTitle"), {
        description: t("chat.mentionToast", {
          name: author?.name ?? script.handle,
          text: script.text.length > 60 ? `${script.text.slice(0, 60)}…` : script.text,
        }),
        duration: 6000,
      });
    }, 9000);
    return () => window.clearTimeout(timer);
  }, [server, t]);

  const insertMention = (handle: string) => {
    setDraft((d) => d.replace(/(^|\s)@([A-Za-z0-9_]*)$/, `$1@${handle} `));
    inputRef.current?.focus();
  };

  const send = () => {
    const text = draft.trim();
    if (!text && !attachedId) return;
    const message: ChatMessage = {
      id: `${server}-${Date.now()}`,
      handle: CURRENT_USER.handle,
      minutesAgo: 0,
      text: text || (attachedId ? "👇" : ""),
      ...(replyTo ? { replyToId: replyTo.id } : {}),
      ...(attachedId ? { questionId: attachedId } : {}),
    };
    setMessages((prev) => ({ ...prev, [server]: [...prev[server], message] }));
    setDraft("");
    setReplyTo(null);
    setAttachedId(null);

    const mentioned = [...text.matchAll(MENTION_RE)]
      .map((m) => m[1] ?? "")
      .filter((h) => h !== CURRENT_USER.handle && byHandle[h]);
    if (mentioned[0]) {
      const target = byHandle[mentioned[0]];
      toast.success(t("chat.sentMention", { name: target?.name ?? mentioned[0] }));
    }
  };

  const attached = attachedId ? mistakes.find((m) => m.id === attachedId) : undefined;

  return (
    <AppShell>
      <TopHeader />

      <div>
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <MessagesSquare className="h-5 w-5 text-primary" /> {t("chat.title")}
        </h2>
        <p className="text-sm text-muted-foreground">{t("chat.subtitle")}</p>
      </div>

      <Tabs value={server} onValueChange={(v) => setServer(v as ServerId)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tr" className="text-xs sm:text-sm">
            {t("chat.serverTr")}
          </TabsTrigger>
          <TabsTrigger value="global" className="text-xs sm:text-sm">
            {t("chat.serverEn")}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="glass-card">
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge className="bg-success/15 text-success">
              ● {t("chat.online", { n: ONLINE_COUNT[server] })}
            </Badge>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> {t("chat.members", { n: MEMBER_COUNT[server] })}
            </span>
            <span className="hidden sm:inline">· {t("chat.longPressHint")}</span>
          </div>

          <ScrollArea className="h-[52vh] min-h-72 pr-2 sm:h-[58vh]">
            <div className="space-y-4">
              {list.map((m) => {
                const author = byHandle[m.handle] ?? CURRENT_USER;
                const isMe = m.handle === CURRENT_USER.handle;
                const parent = m.replyToId ? list.find((x) => x.id === m.replyToId) : undefined;
                const shared = m.questionId
                  ? mistakes.find((q) => q.id === m.questionId)
                  : undefined;
                const localized = shared ? localizeMistake(shared) : undefined;
                return (
                  <MessageRow
                    key={m.id}
                    onLongPress={() => setActionsFor(m)}
                  >
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarFallback className={`text-xs font-bold ${author.color}`}>
                        {author.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-sm font-semibold">
                          {isMe ? t("chat.you") : author.name}
                        </span>
                        <Badge variant="outline" className="border-primary/40 text-[10px] text-primary">
                          {t("chat.level")} {author.level}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground">
                          {m.minutesAgo === 0
                            ? t("chat.now")
                            : t("chat.minutesAgo", { n: m.minutesAgo })}
                        </span>
                      </div>

                      {parent && (
                        <div className="truncate rounded-lg border-l-2 border-primary/50 bg-surface/60 px-2 py-1 text-[11px] text-muted-foreground">
                          {(byHandle[parent.handle]?.name ?? parent.handle)}: {parent.text}
                        </div>
                      )}

                      <p
                        className={`rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                          isMe
                            ? "bg-primary/15 text-foreground"
                            : "bg-surface/70 text-foreground"
                        }`}
                      >
                        <MentionText text={m.text} />
                      </p>

                      {localized && (
                        <div className="rounded-2xl border border-border bg-surface/70 p-3">
                          <p className="text-[11px] font-semibold tracking-wide text-primary uppercase">
                            {t("chat.questionCard")}
                          </p>
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            <Badge className="bg-primary/15 text-primary">
                              {term(localized.subject)}
                            </Badge>
                            <Badge variant="outline">{localized.topic}</Badge>
                            <Badge variant="outline">{term(localized.difficulty)}</Badge>
                          </div>
                          <p className="mt-2 text-sm">{localized.question}</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                navigate({
                                  to: "/practice",
                                  search: { id: localized.id, mode: undefined },
                                })
                              }
                            >
                              {t("chat.practiceThis")}
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => navigate({ to: "/vault" })}
                            >
                              {t("chat.openInVault")}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </MessageRow>
                );
              })}
              <div ref={feedEndRef} />
            </div>
          </ScrollArea>

          <div className="space-y-2">
            {replyTo && (
              <div className="flex items-center justify-between gap-2 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-xs">
                <span className="truncate">
                  {t("chat.replyingTo", {
                    name: byHandle[replyTo.handle]?.name ?? replyTo.handle,
                  })}
                </span>
                <Button size="sm" variant="ghost" onClick={() => setReplyTo(null)}>
                  {t("chat.cancelReply")}
                </Button>
              </div>
            )}

            {attached && (
              <div className="flex items-center justify-between gap-2 rounded-xl border border-border bg-surface/70 px-3 py-2 text-xs">
                <span className="truncate">
                  <span className="font-semibold">{t("chat.attached")}: </span>
                  {localizeMistake(attached).question}
                </span>
                <Button size="icon" variant="ghost" onClick={() => setAttachedId(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {mentionMatches.length > 0 && (
              <div className="rounded-xl border border-border bg-surface p-1.5">
                {mentionMatches.map((u) => (
                  <button
                    key={u.handle}
                    type="button"
                    onClick={() => insertMention(u.handle)}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-primary/10"
                  >
                    <span className="font-medium text-primary">@{u.handle}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {u.name} · {t("chat.level")} {u.level}
                    </span>
                  </button>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <Dialog open={shareOpen} onOpenChange={setShareOpen}>
                <DialogTrigger asChild>
                  <Button variant="secondary" size="sm" className="shrink-0">
                    {t("chat.shareQuestion")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{t("chat.shareTitle")}</DialogTitle>
                    <DialogDescription>{t("chat.subtitle")}</DialogDescription>
                  </DialogHeader>
                  {mistakes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t("chat.shareEmpty")}</p>
                  ) : (
                    <div className="space-y-2">
                      {mistakes.map((q) => {
                        const lq = localizeMistake(q);
                        return (
                          <button
                            key={q.id}
                            type="button"
                            onClick={() => {
                              setAttachedId(q.id);
                              setShareOpen(false);
                              inputRef.current?.focus();
                            }}
                            className="w-full rounded-xl border border-border bg-surface/70 p-3 text-left transition-colors hover:border-primary/50"
                          >
                            <div className="flex flex-wrap gap-1.5">
                              <Badge className="bg-primary/15 text-primary">
                                {term(lq.subject)}
                              </Badge>
                              <Badge variant="outline">{lq.topic}</Badge>
                            </div>
                            <p className="mt-1.5 text-sm">{lq.question}</p>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              <Input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder={t("chat.placeholder")}
                className="min-w-40 flex-1"
              />
              <Button onClick={send} className="shrink-0">
                <Send className="mr-1.5 h-4 w-4" /> {t("chat.send")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={actionsFor !== null} onOpenChange={(o) => !o && setActionsFor(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("chat.actions")}</DialogTitle>
            <DialogDescription className="line-clamp-3">{actionsFor?.text}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => {
                if (actionsFor) {
                  setReplyTo(actionsFor);
                  const handle = actionsFor.handle;
                  if (handle !== CURRENT_USER.handle) setDraft((d) => `@${handle} ${d}`.trimEnd() + " ");
                }
                setActionsFor(null);
                inputRef.current?.focus();
              }}
            >
              <Reply className="mr-1.5 h-4 w-4" /> {t("chat.reply")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setActionsFor(null);
                toast.error(t("chat.reportToast"), { description: t("chat.reportToastDesc") });
              }}
            >
              <Flag className="mr-1.5 h-4 w-4" /> {t("chat.report")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

/** Wraps a message row and turns a long-press (or right-click) into an actions request. */
function MessageRow({
  children,
  onLongPress,
}: {
  children: React.ReactNode;
  onLongPress: () => void;
}) {
  const timer = useRef<number | null>(null);

  const clear = () => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  };

  useEffect(() => clear, []);

  return (
    <div
      className="flex gap-3 rounded-2xl p-1 transition-colors select-none hover:bg-surface/40"
      onPointerDown={() => {
        clear();
        timer.current = window.setTimeout(onLongPress, 500);
      }}
      onPointerUp={clear}
      onPointerLeave={clear}
      onPointerCancel={clear}
      onContextMenu={(e) => {
        e.preventDefault();
        clear();
        onLongPress();
      }}
    >
      {children}
    </div>
  );
}

/** Renders @handles in an accent colour. */
function MentionText({ text }: { text: string }) {
  const parts = text.split(/(@[A-Za-z0-9_]+)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("@") ? (
          <span
            key={i}
            className="rounded bg-accent/15 px-1 font-semibold text-accent"
          >
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}
