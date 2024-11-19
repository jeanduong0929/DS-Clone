import { Context, Next } from "hono";
import { deleteCookie, getCookie } from "hono/cookie";
import { SessionStore } from "../models/session-store";

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME!;
const MAX_AGE = 24 * 60 * 60 * 1000; // Duration: 1 day

/**
 * Middleware to authenticate users based on session cookies.
 *
 * This middleware checks for a valid session cookie in the request.
 * If the session cookie is missing, it responds with a 401 Unauthorized error.
 * If the session cookie is present but invalid, it deletes the cookie and
 * responds with a 401 Invalid session error. If the session has expired,
 * it deletes the session from the store and responds with a 401 Session expired error.
 *
 * If the session is valid and not expired, it sets the session cookie in the context
 * and calls the next middleware in the stack.
 *
 * @param {Context} c - The Hono context object containing request and response information.
 * @param {Next} next - The next middleware function to call if authentication is successful.
 *
 * @returns {Promise<void>} A promise that resolves when the next middleware is called,
 * or rejects with an error response if authentication fails.
 */
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
