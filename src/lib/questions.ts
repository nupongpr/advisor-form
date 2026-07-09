export type Role = "student" | "advisor" | "staff";
export type Frequency = "daily" | "weekly" | "monthly" | "rarely";

export const ROLE_OPTIONS: { value: Role; label: string; en: string }[] = [
  { value: "student", label: "นักศึกษา", en: "Student" },
  { value: "advisor", label: "อาจารย์ที่ปรึกษา", en: "Advisor" },
  { value: "staff", label: "เจ้าหน้าที่บัณฑิตศึกษา", en: "Graduate studies staff" },
];

export const FREQUENCY_OPTIONS: { value: Frequency; label: string; en: string }[] = [
  { value: "daily", label: "ทุกวัน", en: "Every day" },
  { value: "weekly", label: "1-2 ครั้ง/สัปดาห์", en: "1–2 times/week" },
  { value: "monthly", label: "1-2 ครั้ง/เดือน", en: "1–2 times/month" },
  { value: "rarely", label: "น้อยกว่าเดือนละครั้ง", en: "Less than once a month" },
];

export const SCALE_LABELS: Record<number, string> = {
  5: "มากที่สุด", 4: "มาก", 3: "ปานกลาง", 2: "น้อย", 1: "น้อยที่สุด",
};

export const LIKERT_SECTIONS = [
  {
    key: "sq", title: "ความง่ายในการใช้งานและการออกแบบ (System Quality & Usability)",
    titleEn: "System Quality & Usability",
    items: [
      { key: "sq_1", th: "ระบบมีการออกแบบหน้าจอที่สวยงาม ทันสมัย และน่าใช้งาน", en: "The system has an attractive, modern, and pleasant screen design." },
      { key: "sq_2", th: "เมนูและปุ่มคำสั่งต่างๆ สื่อความหมายชัดเจน เข้าใจง่าย", en: "The menus and command buttons convey clear meaning and are easy to understand." },
      { key: "sq_3", th: "ท่านสามารถเข้าถึงข้อมูลที่ต้องการได้อย่างรวดเร็ว ไม่ซับซ้อน", en: "You can access the information you need quickly and without complication." },
      { key: "sq_4", th: "ระบบมีความเสถียร รวดเร็วในการประมวลผล และไม่เกิดข้อผิดพลาด (Error) บ่อยครั้ง", en: "The system is stable, processes quickly, and does not produce errors frequently." },
      { key: "sq_5", th: "ระบบรองรับการใช้งานผ่านอุปกรณ์ที่หลากหลาย (เช่น คอมพิวเตอร์, แท็บเล็ต, สมาร์ตโฟน) ได้ดี", en: "The system works well across a variety of devices (e.g., computer, tablet, smartphone)." },
    ],
  },
  {
    key: "wf", title: "กระบวนการและขั้นตอนการทำงาน (Workflow & Functionality)",
    titleEn: "Workflow & Functionality",
    items: [
      { key: "wf_1", th: "ลำดับขั้นตอนในระบบสอดคล้องกับกระบวนการทำวิทยานิพนธ์จริงของคณะ/มหาวิทยาลัย", en: "The sequence of steps in the system aligns with the faculty/university's actual thesis process." },
      { key: "wf_2", th: "ระบบแสดงสถานะปัจจุบันของวิทยานิพนธ์ (Status Tracking) ได้อย่างถูกต้องและเป็นปัจจุบัน", en: "The system shows the current status of the thesis (status tracking) accurately and up to date." },
      { key: "wf_3", th: "ระบบการแจ้งเตือน (Notification) ช่วยให้ท่านไม่พลาดกำหนดการสำคัญหรือการส่งงาน", en: "The notification system helps you not miss important deadlines or submissions." },
      { key: "wf_4", th: "การอัปโหลดและดาวน์โหลดเอกสาร/ไฟล์วิทยานิพนธ์ ทำได้สะดวกและรวดเร็ว", en: "Uploading and downloading thesis documents/files is convenient and fast." },
      { key: "wf_5", th: "ฟังก์ชันการอนุมัติหรือให้ความเห็น (สำหรับอาจารย์) ใช้งานได้สะดวก", en: "The approval/commenting function (for advisors) is convenient to use." },
    ],
  },
  {
    key: "pu", title: "ประโยชน์ที่ได้รับ (Perceived Usefulness)",
    titleEn: "Perceived Usefulness",
    items: [
      { key: "pu_1", th: "ระบบช่วยลดความซ้ำซ้อนและลดขั้นตอนการเดินเอกสารได้จริง", en: "The system genuinely reduces redundancy and document-routing steps." },
      { key: "pu_2", th: "ระบบช่วยให้ท่านประหยัดเวลาในการติดตามงานหรือประสานงาน", en: "The system helps you save time in tracking work and coordinating." },
      { key: "pu_3", th: "ระบบช่วยให้ท่านเห็นภาพรวมความก้าวหน้าของการทำวิทยานิพนธ์ได้ชัดเจนขึ้น", en: "The system helps you see the overall progress of your thesis more clearly." },
      { key: "pu_4", th: "ข้อมูลในระบบมีความถูกต้อง เชื่อถือได้ สามารถนำไปใช้อ้างอิงได้", en: "The information in the system is accurate, reliable, and citable for reference." },
      { key: "pu_5", th: "โดยรวมแล้ว ระบบนี้ช่วยส่งเสริมให้กระบวนการทำวิทยานิพนธ์มีประสิทธิภาพมากขึ้น", en: "Overall, this system helps make the thesis process more efficient." },
    ],
  },
  {
    key: "ss", title: "การสนับสนุนและการแก้ไขปัญหา (Support Service)",
    titleEn: "Support Service",
    items: [
      { key: "ss_1", th: "มีคู่มือการใช้งานหรือคำแนะนำที่ชัดเจน", en: "There is a clear user manual or guidance." },
      { key: "ss_2", th: "มีคลิปวิดีโอแนะนำการใช้งานที่ชัดเจน", en: "There are clear video tutorials on how to use the system." },
      { key: "ss_3", th: "มีช่องในการติดต่อสอบถามขอคำปรึกษาที่ชัดเจน", en: "There is a clear channel to contact for inquiries and consultation." },
    ],
  },
] as const;

export const OPEN_QUESTIONS = [
  { key: "open_1", th: "ปัญหาหรืออุปสรรคสำคัญที่สุด ที่ท่านพบจากการใช้งานระบบนี้คืออะไร?", en: "What is the most significant problem or obstacle you encountered while using this system?" },
  { key: "open_2", th: "ฟังก์ชันหรือเครื่องมือใด ที่ท่านอยากให้เพิ่มเข้ามาในระบบเพื่อให้ทำงานง่ายขึ้น", en: "What function or tool would you like added to the system to make your work easier?" },
  { key: "open_3", th: "ข้อเสนอแนะอื่นๆ", en: "Any other suggestions?" },
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
