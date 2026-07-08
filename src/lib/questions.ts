export type Role = "student" | "advisor" | "committee";
export type AgeBand = "<40" | "41-50" | "51-60" | ">60";

export const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "student", label: "นักศึกษา" },
  { value: "advisor", label: "อาจารย์ที่ปรึกษา" },
  { value: "committee", label: "กรรมการ" },
];

export const AGE_OPTIONS: { value: AgeBand; label: string }[] = [
  { value: "<40", label: "น้อยกว่า 40 ปี" },
  { value: "41-50", label: "41–50 ปี" },
  { value: "51-60", label: "51–60 ปี" },
  { value: ">60", label: "มากกว่า 60 ปี" },
];

export const SCALE_LABELS: Record<number, string> = {
  5: "มากที่สุด", 4: "มาก", 3: "ปานกลาง", 2: "น้อย", 1: "น้อยที่สุด",
};

export const LIKERT_SECTIONS = [
  {
    key: "sq", title: "คุณภาพระบบและการใช้งาน (System Quality & Usability)",
    items: [
      { key: "sq_1", th: "[PLACEHOLDER] ข้อ 1 คุณภาพระบบ" },
      { key: "sq_2", th: "[PLACEHOLDER] ข้อ 2 คุณภาพระบบ" },
      { key: "sq_3", th: "[PLACEHOLDER] ข้อ 3 คุณภาพระบบ" },
      { key: "sq_4", th: "[PLACEHOLDER] ข้อ 4 คุณภาพระบบ" },
      { key: "sq_5", th: "[PLACEHOLDER] ข้อ 5 คุณภาพระบบ" },
    ],
  },
  {
    key: "wf", title: "การทำงานและฟังก์ชัน (Workflow & Functionality)",
    items: [
      { key: "wf_1", th: "[PLACEHOLDER] ข้อ 1 การทำงาน" },
      { key: "wf_2", th: "[PLACEHOLDER] ข้อ 2 การทำงาน" },
      { key: "wf_3", th: "[PLACEHOLDER] ข้อ 3 การทำงาน" },
      { key: "wf_4", th: "[PLACEHOLDER] ข้อ 4 การทำงาน" },
      { key: "wf_5", th: "[PLACEHOLDER] ข้อ 5 การทำงาน" },
    ],
  },
  {
    key: "pu", title: "การรับรู้ประโยชน์ (Perceived Usefulness)",
    items: [
      { key: "pu_1", th: "[PLACEHOLDER] ข้อ 1 ประโยชน์" },
      { key: "pu_2", th: "[PLACEHOLDER] ข้อ 2 ประโยชน์" },
      { key: "pu_3", th: "[PLACEHOLDER] ข้อ 3 ประโยชน์" },
      { key: "pu_4", th: "[PLACEHOLDER] ข้อ 4 ประโยชน์" },
      { key: "pu_5", th: "[PLACEHOLDER] ข้อ 5 ประโยชน์" },
    ],
  },
  {
    key: "ss", title: "บริการสนับสนุน (Support Service)",
    items: [
      { key: "ss_1", th: "[PLACEHOLDER] ข้อ 1 บริการสนับสนุน" },
      { key: "ss_2", th: "[PLACEHOLDER] ข้อ 2 บริการสนับสนุน" },
      { key: "ss_3", th: "[PLACEHOLDER] ข้อ 3 บริการสนับสนุน" },
    ],
  },
] as const;

export const OPEN_QUESTIONS = [
  { key: "open_1", th: "[PLACEHOLDER] จุดเด่นของระบบที่ท่านประทับใจคืออะไร" },
  { key: "open_2", th: "[PLACEHOLDER] สิ่งที่ควรปรับปรุงคืออะไร" },
  { key: "open_3", th: "[PLACEHOLDER] ข้อเสนอแนะเพิ่มเติม" },
] as const;

export const SUS_ITEMS = [
  { key: "sus_1", th: "ฉันคิดว่าฉันอยากใช้ระบบนี้บ่อย ๆ", en: "I think that I would like to use this system frequently." },
  { key: "sus_2", th: "ฉันพบว่าระบบนี้ซับซ้อนเกินความจำเป็น", en: "I found the system unnecessarily complex." },
  { key: "sus_3", th: "ฉันคิดว่าระบบนี้ใช้งานง่าย", en: "I thought the system was easy to use." },
  { key: "sus_4", th: "ฉันคิดว่าฉันต้องขอความช่วยเหลือจากผู้เชี่ยวชาญจึงจะใช้ระบบนี้ได้", en: "I think that I would need the support of a technical person to be able to use this system." },
  { key: "sus_5", th: "ฉันพบว่าฟังก์ชันต่าง ๆ ในระบบนี้ทำงานเชื่อมโยงกันได้ดี", en: "I found the various functions in this system were well integrated." },
  { key: "sus_6", th: "ฉันคิดว่าระบบนี้มีความไม่สอดคล้องกันมากเกินไป", en: "I thought there was too much inconsistency in this system." },
  { key: "sus_7", th: "ฉันคิดว่าคนส่วนใหญ่จะเรียนรู้การใช้ระบบนี้ได้อย่างรวดเร็ว", en: "I would imagine that most people would learn to use this system very quickly." },
  { key: "sus_8", th: "ฉันพบว่าระบบนี้ใช้งานยุ่งยากมาก", en: "I found the system very cumbersome to use." },
  { key: "sus_9", th: "ฉันรู้สึกมั่นใจมากเมื่อใช้ระบบนี้", en: "I felt very confident using the system." },
  { key: "sus_10", th: "ฉันต้องเรียนรู้หลายอย่างก่อนที่จะเริ่มใช้ระบบนี้ได้", en: "I needed to learn a lot of things before I could get going with this system." },
] as const;

export const LIKERT_KEYS = LIKERT_SECTIONS.flatMap((s) => s.items.map((i) => i.key));
export const SUS_KEYS = SUS_ITEMS.map((i) => i.key);
export const OPEN_KEYS = OPEN_QUESTIONS.map((i) => i.key);
