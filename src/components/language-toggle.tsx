"use client";
import { useLanguage, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const OPTIONS: { value: Lang; label: string }[] = [
  { value: "th", label: "TH" },
  { value: "en", label: "EN" },
];

/** TH/EN pill toggle. Reads/writes the shared language state. */
export function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang } = useLanguage();
  return (
    <div
      role="group"
      aria-label="Language / ภาษา"
      className={cn(
        "inline-flex select-none rounded-full border border-border bg-card p-0.5 text-xs font-semibold",
        className,
      )}
    >
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => setLang(o.value)}
          aria-pressed={lang === o.value}
          className={cn(
            "rounded-full px-3 py-1 transition-colors",
            lang === o.value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
