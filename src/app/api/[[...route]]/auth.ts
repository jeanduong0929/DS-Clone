import { Context, Hono } from "hono";
import { genSaltSync, hashSync, compareSync } from "bcrypt-ts";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

import { db } from "@/db";
import { zValidator } from "@hono/zod-validator";
import { insertUserSchema, users } from "@/db/schema";
import { SessionStore } from "@/features/auth/models/session-store";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { authMiddleware } from "@/features/auth/api/middleware";

const SALT_ROUNDS = 10;
const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME!;
const SESSION_COOKIE_MAX_AGE = 24 * 60 * 60 * 1000; // Expire after 24 hours

const app = new Hono()
  .post(
    "/register",
    zValidator(
      "json",
      insertUserSchema.pick({
        email: true,
        password: true,
      })
    ),
    async (c) => {
      const { email, password } = c.req.valid("json");
      if (!isValidEmail(email)) {
        return c.json({ error: "Invalid email" }, 400);
      }
      if (!isValidPassword(password)) {
        return c.json({ error: "Invalid password" }, 400);
      }

      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, email));

      if (existingUser) {
        return c.json({ error: "User already exists" }, 409);
      }

      const salt = genSaltSync(SALT_ROUNDS);
      const hashedPassword = hashSync(password, salt);

      const [newUser] = await db
        .insert(users)
        .values({
          email,
          password: hashedPassword,
        })
        .returning();

      createSession(c, newUser.id);

      return c.json({ success: true }, 201);
    }
  )
  .post(
    "/login",
    zValidator(
      "json",
      insertUserSchema.pick({
        email: true,
        password: true,
      })
    ),
    async (c) => {
      const { email, password } = c.req.valid("json");

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email));

      if (!user || !compareSync(password, user.password)) {
        return c.json({ error: "Invalid email or password" }, 400);
      }

      createSession(c, user.id);

      return c.json({ success: true }, 200);
    }
  )
  .post("/logout", authMiddleware, (c) => {
    clearSession(c);
    return c.json({ success: true }, 200);
  })
  .get("/protected", authMiddleware, (c) => {
    const sessionId = getCookie(c, SESSION_COOKIE_NAME);
    if (!sessionId) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    return c.json({ success: true }, 200);
  });

/**
 * Creates a session for a user and stores it in the session store.
 *
 * This function generates a unique session ID using the `nanoid` library,
 * stores the session data (user ID and creation timestamp) in the
 * `SessionStore`, and sets a secure HTTP-only cookie with the session ID.
 *
 * @param {Context} c - The context object containing request and response
 *                      information, used to set the cookie.
 * @param {string} userId - The unique identifier of the user for whom
 *                          the session is being created.
 *
 * @returns {void} - This function does not return a value.
 */
const createSession = (c: Context, userId: string): void => {
  const sessionStore = SessionStore.getInstance();
  const sessionId = nanoid();

  sessionStore.set(sessionId, {
    id: userId,
    createdAt: Date.now(),
  });

  setCookie(c, SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: true,
    path: "/",
    sameSite: "Lax",
    maxAge: SESSION_COOKIE_MAX_AGE / 1000,
  });
};

/**
 * Clears the session for the current user by deleting the session data
 * from the session store and removing the associated cookie.
 *
 * This function retrieves the session ID from the request cookies,
 * checks if a session exists for that ID, and if so, deletes the session
 * from the `SessionStore`. It also removes the session cookie from the
 * client's browser to ensure that the user is logged out.
 *
 * @param {Context} c - The context object containing request and response
 *                      information, used to access cookies and modify
 *                      the response.
 *
 * @returns {void} - This function does not return a value.
 */
const clearSession = (c: Context): void => {
  const sessionStore = SessionStore.getInstance();
  const sessionId = getCookie(c, SESSION_COOKIE_NAME);
  if (sessionId) {
    sessionStore.delete(sessionId);
    deleteCookie(c, SESSION_COOKIE_NAME);
  }
};

/**
 * Validates an email address against a standard email format.
 *
 * The function uses a regular expression to check if the provided email
 * matches the typical structure of an email address, which includes:
 * - A local part (before the '@' symbol)
 * - An '@' symbol
 * - A domain part (after the '@' symbol) that includes a top-level domain
 *
 * @param {string} email - The email address to validate.
 * @returns {boolean} - Returns true if the email is valid, false otherwise.
 */
const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates a password against specified criteria.
 *
 * The function checks if the provided password meets the following requirements:
 * - At least 8 characters long
 * - Contains at least one uppercase letter
 * - Contains at least one lowercase letter
 * - Contains at least one digit
 * - Contains at least one special character (e.g., @$!%*?&)
 *
 * @param {string} password - The password to validate.
 * @returns {boolean} - Returns true if the password is valid, false otherwise.
 */
const isValidPassword = (password: string) => {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export default app;
