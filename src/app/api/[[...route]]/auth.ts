import { Hono } from "hono";
import { genSaltSync, hashSync } from "bcrypt-ts";

import { db } from "@/db";
import { zValidator } from "@hono/zod-validator";
import { insertAccountSchema, users } from "@/db/schema";
import { eq } from "drizzle-orm";

const SALT_ROUNDS = 10;

const app = new Hono()
  .post(
    "/register",
    zValidator(
      "json",
      insertAccountSchema.pick({
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

      await db
        .insert(users)
        .values({
          email,
          password: hashedPassword,
        })
        .returning();

      return c.json({ success: true }, 201);
    }
  )
  .get("/", (c) => {
    return c.json({ message: "Auth" });
  });

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
