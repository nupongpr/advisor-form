"use client";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useLanguage, UI } from "@/lib/i18n";

export default function ThankYou() {
  const { lang } = useLanguage();
  const t = UI[lang];
  return (
    <main className="mx-auto flex min-h-dvh max-w-200 flex-col justify-center px-4">
      <Card className="rounded-[1.5rem] shadow-soft border border-border text-center">
        <CardHeader><CardTitle className="text-2xl">{t.thankTitle}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{t.thankBody}</p>
          <Link href="/" className={cn(buttonVariants({ variant: "default" }))}>{t.home}</Link>
        </CardContent>
      </Card>
    </main>
  );
}
