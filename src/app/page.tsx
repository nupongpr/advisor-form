import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-200 flex-col justify-center px-4 py-10 sm:px-6">
      <Card className="rounded-[1.5rem] shadow-soft border border-border">
        <CardHeader>
          <CardTitle className="text-2xl">แบบประเมินระบบ AI thesis co-advisor</CardTitle>
          <CardDescription className="leading-relaxed">
            แบบสอบถามความพึงพอใจและการใช้งานระบบบริหารจัดการวิทยานิพนธ์ AI thesis co-advisor
            ใช้เวลาประมาณ 10–15 นาที คำตอบเป็นความลับและไม่เก็บข้อมูลที่ระบุตัวตน
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>ข้อมูลทั่วไป (บทบาทและความถี่ในการใช้งาน)</li>
            <li>แบบสอบถามความพึงพอใจการใช้งานระบบติดตามวิทยานิพนธ์ 4 ด้าน รวม 18 ข้อ</li>
            <li>คำถามปลายเปิด 3 ข้อ</li>
            <li>แบบประเมินความสามารถในการใช้งานระบบ (SUS) 10 ข้อ</li>
          </ul>
          <Link href="/survey" className={cn(buttonVariants(), "w-full")}>
            เริ่มทำแบบประเมิน
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
