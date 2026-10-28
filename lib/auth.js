import crypto from "crypto";
import { cookies } from "next/headers";
import { readDb } from "./db";

const COOKIE = "mr_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const SECRET = process.env.SESSION_SECRET || "dev-only-secret-change-me";

export function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { salt, hash };
}

export function verifyPassword(password, salt, hash) {
  const test = Buffer.from(crypto.scryptSync(password, salt, 64).toString("hex"));
  const real = Buffer.from(hash);
  return test.length === real.length && crypto.timingSafeEqual(test, real);
}

function sign(value) {
  return crypto.createHmac("sha256", SECRET).update(value).digest("hex");
}

export function startSession(userId) {
  const exp = Date.now() + MAX_AGE * 1000;
  const payload = `${userId}.${exp}`;
  cookies().set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export function endSession() {
  cookies().set(COOKIE, "", { path: "/", maxAge: 0 });
}

export function currentUser() {
  const raw = cookies().get(COOKIE)?.value;
  if (!raw) return null;
  const parts = raw.split(".");
  if (parts.length !== 3) return null;
  const [uid, exp, sig] = parts;
  const expected = sign(`${uid}.${exp}`);
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  if (Number(exp) < Date.now()) return null;
  const user = readDb().users.find((u) => u.id === uid);
  return user ? { id: user.id, name: user.name, email: user.email } : null;
}
