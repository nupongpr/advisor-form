import { describe, it, expect } from "vitest";
import { makeSessionToken, verifySessionToken } from "./auth";

describe("session token", () => {
  it("secret เดียวกัน verify ผ่าน", async () => {
    const t = await makeSessionToken("s3cret");
    expect(await verifySessionToken(t, "s3cret")).toBe(true);
  });
  it("secret ต่างกัน verify ไม่ผ่าน", async () => {
    const t = await makeSessionToken("s3cret");
    expect(await verifySessionToken(t, "other")).toBe(false);
  });
  it("token มั่ว ไม่ผ่าน", async () => {
    expect(await verifySessionToken("garbage", "s3cret")).toBe(false);
  });
  it("secret ว่าง (COOKIE_SECRET ไม่ถูกตั้งค่า) verify ไม่ผ่าน แม้ token จะถูกต้องตามปกติ", async () => {
    const t = await makeSessionToken("s3cret");
    expect(await verifySessionToken(t, "")).toBe(false);
  });
  it("secret ว่าง ปฏิเสธทุก token รวมถึงค่าคงที่ HMAC(key=\"\") ที่คำนวณล่วงหน้าได้", async () => {
    expect(await verifySessionToken("anything", "")).toBe(false);
  });
  it("makeSessionToken ปฏิเสธ secret ว่าง (throw แทนที่จะออก token ที่คาดเดาได้)", async () => {
    await expect(makeSessionToken("")).rejects.toThrow();
  });
});
