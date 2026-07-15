import { createHmac, timingSafeEqual } from "crypto";

export { SESSION_COOKIE, createSessionToken, sessionCookieOptions, verifySessionToken } from "./session";

function hmac(value: string, key: string): Buffer {
  return createHmac("sha256", key).update(value).digest();
}

export function checkPassword(candidate: string): boolean {
  const expected = process.env.INTERNAL_PASSWORD;
  const secret = process.env.SESSION_SECRET;
  if (!expected || !secret) return false;

  const candidateDigest = hmac(candidate, secret);
  const expectedDigest = hmac(expected, secret);
  return timingSafeEqual(candidateDigest, expectedDigest);
}
