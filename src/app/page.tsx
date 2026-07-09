"use client";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useLanguage, UI } from "@/lib/i18n";
import { LanguageToggle } from "@/components/language-toggle";

export default function Home() {
  const { lang } = useLanguage();
  const t = UI[lang];
  return (
    <main className="mx-auto flex min-h-dvh max-w-200 flex-col justify-center px-4 py-10 sm:px-6">
      <div className="mb-4 flex justify-end">
        <LanguageToggle />
      </div>
      <Card className="rounded-[1.5rem] shadow-soft border border-border">
        <CardHeader>
          <CardTitle className="text-2xl">{t.landingTitle}</CardTitle>
          <CardDescription className="leading-relaxed">{t.landingDesc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {t.landingBullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
          <Link href="/survey" className={cn(buttonVariants(), "w-full")}>
            {t.start}
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
