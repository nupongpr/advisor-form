import { describe, it, expect } from "vitest";
import { makeSessionToken, verifySessionToken, safeEqual } from "./auth";

const SECRET = "s3cret";

describe("session token", () => {
  it("token ที่เพิ่งสร้าง (ยังไม่หมดอายุ) verify ผ่านด้วย secret เดียวกัน", async () => {
    const t = await makeSessionToken(SECRET, 3600);
    expect(await verifySessionToken(t, SECRET)).toBe(true);
  });
  it("token ที่หมดอายุแล้ว verify ไม่ผ่าน", async () => {
    const t = await makeSessionToken(SECRET, -1); // exp อยู่ในอดีต
    expect(await verifySessionToken(t, SECRET)).toBe(false);
  });
  it("ลายเซ็นผิด verify ไม่ผ่าน", async () => {
    const t = await makeSessionToken(SECRET, 3600);
    const exp = t.split(".")[0];
    expect(await verifySessionToken(`${exp}.deadbeef`, SECRET)).toBe(false);
  });
  it("secret ต่างกัน verify ไม่ผ่าน", async () => {
    const t = await makeSessionToken(SECRET, 3600);
    expect(await verifySessionToken(t, "other")).toBe(false);
  });
  it("token มั่ว ไม่ผ่าน", async () => {
    expect(await verifySessionToken("garbage", SECRET)).toBe(false);
  });
  it("secret ว่าง ปฏิเสธทุก token", async () => {
    const t = await makeSessionToken(SECRET, 3600);
    expect(await verifySessionToken(t, "")).toBe(false);
    expect(await verifySessionToken("anything", "")).toBe(false);
  });
  it("makeSessionToken ปฏิเสธ secret ว่าง (throw แทนที่จะออก token ที่คาดเดาได้)", async () => {
    await expect(makeSessionToken("", 3600)).rejects.toThrow();
  });
});

describe("safeEqual", () => {
  it("จริงเมื่อค่าตรงกัน", async () => expect(await safeEqual("hunter2", "hunter2", SECRET)).toBe(true));
  it("เท็จเมื่อค่าต่างกัน", async () => expect(await safeEqual("hunter2", "hunter3", SECRET)).toBe(false));
  it("เท็จเมื่อความยาวต่างกัน", async () => expect(await safeEqual("abc", "abcd", SECRET)).toBe(false));
});
