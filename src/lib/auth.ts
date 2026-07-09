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

// Constant-time compare of two equal-length hex strings.
function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// Timing-safe equality of two secrets. HMAC both then compare fixed-length digests,
// so neither timing nor length of the inputs leaks. Works in edge and node runtimes.
export async function safeEqual(a: string, b: string, secret: string): Promise<boolean> {
  const [ha, hb] = await Promise.all([hmacHex(a, secret), hmacHex(b, secret)]);
  return timingSafeEqualHex(ha, hb);
}

// Session token = `${exp}.${sig}` where exp is a unix-seconds expiry and
// sig = HMAC(`${PAYLOAD}.${exp}`, secret). The token is per-issue and expires.
export async function makeSessionToken(secret: string, ttlSec: number): Promise<string> {
  if (!secret) throw new Error("COOKIE_SECRET is not set");
  const exp = Math.floor(Date.now() / 1000) + ttlSec;
  const sig = await hmacHex(`${PAYLOAD}.${exp}`, secret);
  return `${exp}.${sig}`;
}

export async function verifySessionToken(token: string, secret: string): Promise<boolean> {
  if (!token || !secret) return false;
  const dot = token.indexOf(".");
  if (dot <= 0) return false;
  const expStr = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp * 1000 <= Date.now()) return false; // missing/expired
  const expected = await hmacHex(`${PAYLOAD}.${expStr}`, secret);
  return timingSafeEqualHex(sig, expected);
}
