import { Check, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n, type Lang } from "@/lib/i18n";

const LANGS: { code: Lang; flag: string; labelKey: "lang.en" | "lang.tr" }[] = [
  { code: "en", flag: "🇺🇸", labelKey: "lang.en" },
  { code: "tr", flag: "🇹🇷", labelKey: "lang.tr" },
];

export function LanguageSwitcher() {
  const { lang, setLang, t } = useI18n();
  const active = LANGS.find((l) => l.code === lang) ?? LANGS[0]!;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          aria-label={t("lang.label")}
          className="h-auto shrink-0 gap-1.5 rounded-xl px-2.5 py-2"
        >
          <Globe className="h-4 w-4 text-muted-foreground" />
          <span className="text-base leading-none">{active.flag}</span>
          <span className="text-xs font-semibold uppercase">{active.code}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        <DropdownMenuLabel>{t("lang.label")}</DropdownMenuLabel>
        {LANGS.map((l) => (
          <DropdownMenuItem key={l.code} onSelect={() => setLang(l.code)} className="gap-2">
            <span className="text-base leading-none">{l.flag}</span>
            <span className="text-sm">{t(l.labelKey)}</span>
            {lang === l.code && <Check className="ml-auto h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
