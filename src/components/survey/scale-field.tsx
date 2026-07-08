"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const SCALE = [1, 2, 3, 4, 5] as const;

/**
 * DESIGN Likert scale field.
 * - แนวนอน ไล่ 1..5 ซ้าย -> ขวา
 * - label เฉพาะปลายทาง: น้อยที่สุด (ซ้าย) ... มากที่สุด (ขวา)
 * - แต่ละตัวเลือกเป็นวงกลม แตะง่าย เต็มความกว้างบนมือถือ; ที่เลือกใช้สี primary
 * - ข้อความคำถาม (`label`) แสดงเหนือสเกล
 */
export function ScaleField({
  name,
  label,
  value,
  onChange,
  lowLabel = "น้อยที่สุด",
  highLabel = "มากที่สุด",
}: {
  name: string;
  label: string;
  value?: number;
  onChange: (v: number) => void;
  lowLabel?: string;
  highLabel?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <p className="mb-4 text-base font-medium leading-relaxed text-foreground">
        {label}
      </p>

      <RadioGroup
        aria-label={label}
        value={value ? String(value) : ""}
        onValueChange={(v) => onChange(Number(v))}
        className="flex items-stretch gap-1.5 sm:gap-3"
      >
        {SCALE.map((n) => {
          const id = `${name}-${n}`;
          return (
            <Label
              key={n}
              htmlFor={id}
              className="group flex flex-1 cursor-pointer flex-col items-center gap-1.5 py-1"
            >
              <RadioGroupItem id={id} value={String(n)} className="peer sr-only" />
              <span className="flex aspect-square w-full max-w-11 items-center justify-center rounded-full border border-input bg-background text-sm font-semibold text-muted-foreground transition-colors group-hover:border-primary/60 peer-data-checked:border-primary peer-data-checked:bg-primary peer-data-checked:text-primary-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2">
                {n}
              </span>
            </Label>
          );
        })}
      </RadioGroup>

      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}
