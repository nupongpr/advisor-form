export const SESSION_COOKIE = "tf_session";
const PAYLOAD = "admin-authenticated";
const enc = new TextEncoder();

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function hmacHex(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return toHex(await crypto.subtle.sign("HMAC", key, enc.encode(value)));
}
export async function makeSessionToken(secret: string): Promise<string> {
  if (!secret) throw new Error("COOKIE_SECRET is not set");
  return hmacHex(PAYLOAD, secret);
}
export async function verifySessionToken(token: string, secret: string): Promise<boolean> {
  if (!token || !secret) return false;
  const expected = await hmacHex(PAYLOAD, secret);
  if (token.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}
