import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function ThankYou() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-200 flex-col justify-center px-4">
      <Card className="rounded-[1.5rem] shadow-soft border border-border text-center">
        <CardHeader><CardTitle className="text-2xl">ขอบคุณสำหรับการประเมิน 🎉</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">ระบบได้บันทึกคำตอบของท่านเรียบร้อยแล้ว</p>
          <Link href="/" className={cn(buttonVariants({ variant: "default" }))}>กลับสู่หน้าแรก</Link>
        </CardContent>
      </Card>
    </main>
  );
}
