import { Context, Next } from "hono";
import { deleteCookie, getCookie } from "hono/cookie";
import { SessionStore } from "../models/session-store";

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME!;
const MAX_AGE = 24 * 60 * 60 * 1000;

export const authMiddleware = async (c: Context, next: Next) => {
  const sessionStore = SessionStore.getInstance();
  const sessionId = getCookie(c, process.env.SESSION_COOKIE_NAME!);

  if (!sessionId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const session = sessionStore.get(sessionId);
  if (!session) {
    deleteCookie(c, process.env.SESSION_COOKIE_NAME!);
    return c.json({ error: "Invalid session" }, 401);
  }

  if (Date.now() - session.createdAt > MAX_AGE) {
    sessionStore.delete(sessionId);
    deleteCookie(c, SESSION_COOKIE_NAME);
    return c.json({ error: "Session expired" }, 401);
  }

  c.set(SESSION_COOKIE_NAME, sessionId);
  await next();
};
