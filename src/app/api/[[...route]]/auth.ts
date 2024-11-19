import { Context, Hono } from "hono";
import { genSaltSync, hashSync, compareSync } from "bcrypt-ts";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";

import { db } from "@/db";
import { zValidator } from "@hono/zod-validator";
import { insertUserSchema, users } from "@/db/schema";
import { SessionStore } from "@/features/auth/models/session-store";
import { authMiddleware } from "@/features/auth/api/middleware";

const SALT_ROUNDS = 10;
const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME!;
const SESSION_COOKIE_MAX_AGE = 24 * 60 * 60 * 1000; // Expire after 24 hours

/**
 * Hono application instance with configured authentication routes.
 *
 * This application provides the following routes for user authentication:
 *
 * - POST /register: Registers a new user with an email and password.
 * - POST /login: Authenticates an existing user and creates a session.
 * - POST /logout: Ends the user session and clears the session data.
 * - GET /protected: Verifies the authentication status of the user.
 *
 * Each route is protected by middleware to ensure that only authenticated
 * users can access certain functionalities.
 */
const app = new Hono()
  /**
   * Retrieves the authenticated user's information.
   *
   * This route checks if the user is authenticated by retrieving the user ID
   * from the context. If the user is not authenticated, it returns a 401
   * Unauthorized response. If authenticated, it fetches the user's data
   * from the database and returns it in the response.
   *
   * @param {Context} c - The Hono context object containing request and response information.
   * @returns {Promise<Response>} - A JSON response containing the user's data or an error message.
   */
  .get("/", authMiddleware, async (c: Context) => {
    const userId = getUser(c);
    if (!userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const [result] = await db
      .select({
        id: users.id,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, userId));

    return c.json({ data: result }, 200);
  })
  /**
   * Registers a new user.
   *
   * This route validates the provided email and password, checks if the
   * user already exists, and if not, creates a new user in the database.
   * It also creates a session for the new user upon successful registration.
   *
   * @param {Context} c - The Hono context object containing request and response information.
   * @returns {Promise<Response>} - A JSON response indicating success or an error message.
   */
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
  /**
   * Authenticates an existing user.
   *
   * This route validates the provided email and password, checks if the
   * user exists in the database, and if the password matches. Upon successful
   * authentication, it creates a session for the user.
   *
   * @param {Context} c - The Hono context object containing request and response information.
   * @returns {Promise<Response>} - A JSON response indicating success or an error message.
   */
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
  /**
   * Logs out the authenticated user.
   *
   * This route clears the user's session and returns a success response.
   *
   * @param {Context} c - The Hono context object containing request and response information.
   * @returns {Promise<Response>} - A JSON response indicating success.
   */
  .post("/logout", authMiddleware, (c) => {
    clearSession(c);
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
    console.log("sessionId", sessionId);
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

/**
 * Retrieves the user ID from the context.
 *
 * This function accesses the Hono context to retrieve the user ID
 * that was previously set during the authentication process. The user ID
 * is stored in the context under the key "userId". If the user ID is not
 * present, this function will return undefined.
 *
 * @param {Context} c - The Hono context object containing request and response information.
 * @returns {string | undefined} - The user ID if it exists, otherwise undefined.
 */
const getUser = (c: Context): string | undefined => {
  return c.get("userId");
};

export default app;
