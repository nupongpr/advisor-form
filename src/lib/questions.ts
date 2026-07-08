export type Role = "student" | "advisor" | "staff";
export type Frequency = "daily" | "weekly" | "monthly" | "rarely";

export const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "student", label: "นักศึกษา" },
  { value: "advisor", label: "อาจารย์ที่ปรึกษา" },
  { value: "staff", label: "เจ้าหน้าที่บัณฑิตศึกษา" },
];

export const FREQUENCY_OPTIONS: { value: Frequency; label: string }[] = [
  { value: "daily", label: "ทุกวัน" },
  { value: "weekly", label: "1-2 ครั้ง/สัปดาห์" },
  { value: "monthly", label: "1-2 ครั้ง/เดือน" },
  { value: "rarely", label: "น้อยกว่าเดือนละครั้ง" },
];

export const SCALE_LABELS: Record<number, string> = {
  5: "มากที่สุด", 4: "มาก", 3: "ปานกลาง", 2: "น้อย", 1: "น้อยที่สุด",
};

export const LIKERT_SECTIONS = [
  {
    key: "sq", title: "ความง่ายในการใช้งานและการออกแบบ (System Quality & Usability)",
    items: [
      { key: "sq_1", th: "ระบบมีการออกแบบหน้าจอที่สวยงาม ทันสมัย และน่าใช้งาน" },
      { key: "sq_2", th: "เมนูและปุ่มคำสั่งต่างๆ สื่อความหมายชัดเจน เข้าใจง่าย" },
      { key: "sq_3", th: "ท่านสามารถเข้าถึงข้อมูลที่ต้องการได้อย่างรวดเร็ว ไม่ซับซ้อน" },
      { key: "sq_4", th: "ระบบมีความเสถียร รวดเร็วในการประมวลผล และไม่เกิดข้อผิดพลาด (Error) บ่อยครั้ง" },
      { key: "sq_5", th: "ระบบรองรับการใช้งานผ่านอุปกรณ์ที่หลากหลาย (เช่น คอมพิวเตอร์, แท็บเล็ต, สมาร์ตโฟน) ได้ดี" },
    ],
  },
  {
    key: "wf", title: "กระบวนการและขั้นตอนการทำงาน (Workflow & Functionality)",
    items: [
      { key: "wf_1", th: "ลำดับขั้นตอนในระบบสอดคล้องกับกระบวนการทำวิทยานิพนธ์จริงของคณะ/มหาวิทยาลัย" },
      { key: "wf_2", th: "ระบบแสดงสถานะปัจจุบันของวิทยานิพนธ์ (Status Tracking) ได้อย่างถูกต้องและเป็นปัจจุบัน" },
      { key: "wf_3", th: "ระบบการแจ้งเตือน (Notification) ช่วยให้ท่านไม่พลาดกำหนดการสำคัญหรือการส่งงาน" },
      { key: "wf_4", th: "การอัปโหลดและดาวน์โหลดเอกสาร/ไฟล์วิทยานิพนธ์ ทำได้สะดวกและรวดเร็ว" },
      { key: "wf_5", th: "ฟังก์ชันการอนุมัติหรือให้ความเห็น (สำหรับอาจารย์) ใช้งานได้สะดวก" },
    ],
  },
  {
    key: "pu", title: "ประโยชน์ที่ได้รับ (Perceived Usefulness)",
    items: [
      { key: "pu_1", th: "ระบบช่วยลดความซ้ำซ้อนและลดขั้นตอนการเดินเอกสารได้จริง" },
      { key: "pu_2", th: "ระบบช่วยให้ท่านประหยัดเวลาในการติดตามงานหรือประสานงาน" },
      { key: "pu_3", th: "ระบบช่วยให้ท่านเห็นภาพรวมความก้าวหน้าของการทำวิทยานิพนธ์ได้ชัดเจนขึ้น" },
      { key: "pu_4", th: "ข้อมูลในระบบมีความถูกต้อง เชื่อถือได้ สามารถนำไปใช้อ้างอิงได้" },
      { key: "pu_5", th: "โดยรวมแล้ว ระบบนี้ช่วยส่งเสริมให้กระบวนการทำวิทยานิพนธ์มีประสิทธิภาพมากขึ้น" },
    ],
  },
  {
    key: "ss", title: "การสนับสนุนและการแก้ไขปัญหา (Support Service)",
    items: [
      { key: "ss_1", th: "มีคู่มือการใช้งานหรือคำแนะนำที่ชัดเจน" },
      { key: "ss_2", th: "มีคลิปวิดีโอแนะนำการใช้งานที่ชัดเจน" },
      { key: "ss_3", th: "มีช่องในการติดต่อสอบถามขอคำปรึกษาที่ชัดเจน" },
    ],
  },
] as const;

export const OPEN_QUESTIONS = [
  { key: "open_1", th: "ปัญหาหรืออุปสรรคสำคัญที่สุด ที่ท่านพบจากการใช้งานระบบนี้คืออะไร?" },
  { key: "open_2", th: "ฟังก์ชันหรือเครื่องมือใด ที่ท่านอยากให้เพิ่มเข้ามาในระบบเพื่อให้ทำงานง่ายขึ้น" },
  { key: "open_3", th: "ข้อเสนอแนะอื่นๆ" },
] as const;

export const SUS_ITEMS = [
  { key: "sus_1", th: "ฉันคิดว่าฉันจะใช้งานระบบนี้อย่างสม่ำเสมอ", en: "I think that I would like to use this system frequently." },
  { key: "sus_2", th: "ฉันพบว่าระบบนี้มีความซับซ้อนโดยไม่จำเป็น", en: "I found the system unnecessarily complex." },
  { key: "sus_3", th: "ฉันคิดว่าระบบนี้ใช้งานง่าย", en: "I thought the system was easy to use." },
  { key: "sus_4", th: "ฉันคิดว่าฉันต้องได้รับความช่วยเหลือจากผู้เชี่ยวชาญ/เจ้าหน้าที่เทคนิค จึงจะใช้งานระบบนี้ได้", en: "I think that I would need the support of a technical person to be able to use this system." },
  { key: "sus_5", th: "ฉันพบว่าฟังก์ชันต่างๆ ในระบบนี้ทำงานร่วมกันได้ดี/มีการบูรณาการที่ดี", en: "I found the various functions in this system were well integrated." },
  { key: "sus_6", th: "ฉันคิดว่าระบบนี้มีความไม่สอดคล้องกันมากเกินไป", en: "I thought there was too much inconsistency in this system." },
  { key: "sus_7", th: "ฉันคิดว่าคนส่วนใหญ่จะเรียนรู้วิธีใช้ระบบนี้ได้อย่างรวดเร็ว", en: "I would imagine that most people would learn to use this system very quickly." },
  { key: "sus_8", th: "ฉันพบว่าระบบนี้ใช้งานยุ่งยาก", en: "I found the system very cumbersome to use." },
  { key: "sus_9", th: "ฉันรู้สึกมั่นใจเมื่อใช้งานระบบนี้", en: "I felt very confident using the system." },
  { key: "sus_10", th: "ฉันจำเป็นต้องเรียนรู้หลายอย่างก่อนที่จะเริ่มใช้งานระบบนี้ได้", en: "I needed to learn a lot of things before I could get going with this system." },
] as const;

export const LIKERT_KEYS = LIKERT_SECTIONS.flatMap((s) => s.items.map((i) => i.key));
export const SUS_KEYS = SUS_ITEMS.map((i) => i.key);
export const OPEN_KEYS = OPEN_QUESTIONS.map((i) => i.key);
