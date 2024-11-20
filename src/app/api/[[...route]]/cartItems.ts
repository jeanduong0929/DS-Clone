import { Context, Hono } from "hono";
import { and, eq } from "drizzle-orm";

import { authMiddleware } from "@/features/auth/api/middleware";
import { zValidator } from "@hono/zod-validator";
import {
  cartItems,
  carts,
  insertCartItemSchema,
  products,
  users,
} from "@/db/schema";
import { db } from "@/db";

const app = new Hono()
  .get("/", authMiddleware, async (c) => {
    const users = await getUser(c);
    if (!users) {
      throw new Error("User not found");
    }
    const cart = await getCart(users.id);
    if (!cart) {
      throw new Error("Cart not found");
    }

    const result = await db.query.cartItems.findMany({
      where: eq(cartItems.cartId, cart.id),
      columns: {},
      with: {
        products: {
          columns: {
            id: true,
            name: true,
            price: true,
          },
          with: {
            productImages: {
              orderBy: (productImages, { asc }) => [
                asc(productImages.displayOrder),
              ],
              columns: {
                url: true,
                displayOrder: true,
              },
            },
          },
        },
      },
    });

    return c.json({ data: result.map((item) => item.products) }, 200);
  })
  .post(
    "/add",
    authMiddleware,
    zValidator(
      "query",
      insertCartItemSchema.pick({
        productId: true,
      })
    ),
    async (c) => {
      const { productId } = c.req.valid("query");
      const users = await getUser(c);
      if (!users) {
        throw new Error("User not found");
      }
      const cart = await getCart(users.id);
      if (!cart) {
        throw new Error("Cart not found");
      }

      const [existingCartItem] = await db
        .select()
        .from(cartItems)
        .where(
          and(eq(cartItems.cartId, cart.id), eq(cartItems.productId, productId))
        );

      if (existingCartItem) {
        return c.json({ error: "Product already in cart" }, 409);
      }

      await db.insert(cartItems).values({
        cartId: cart.id,
        productId: productId,
      });

      return c.json({ success: true }, 201);
    }
  );

/**
 * Retrieves the user information from the database based on the user ID stored in the context.
 *
 * This function accesses the Hono context to get the user ID, then queries the database
 * to fetch the user's details, including their ID and email address. If the user is found,
 * it returns the user object; otherwise, it returns undefined.
 *
 * @param {Context} c - The Hono context object containing request and response information.
 * @returns {Promise<{ id: string; email: string } | undefined>} - A promise that resolves to the user object
 * or undefined if the user is not found.
 */
const getUser = async (
  c: Context
): Promise<{ id: string; email: string } | undefined> => {
  const userId = c.get("userId");
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
    })
    .from(users)
    .where(eq(users.id, userId));
  return user;
};

/**
 * Retrieves the cart information for a specific user from the database.
 *
 * This function queries the database to find the cart associated with the given user ID.
 * If a cart is found, it returns an object containing the cart's details, including:
 * - `id`: The unique identifier of the cart.
 * - `createdAt`: The date and time when the cart was created.
 * - `updatedAt`: The date and time when the cart was last updated.
 * - `userId`: The ID of the user to whom the cart belongs.
 *
 * If no cart is found for the specified user ID, the function returns undefined.
 *
 * @param {string} userId - The unique identifier of the user whose cart is to be retrieved.
 * @returns {Promise<{ id: string; createdAt: Date; updatedAt: Date; userId: string } | undefined>}
 * A promise that resolves to the cart object if found, or undefined if not found.
 */
const getCart = async (
  userId: string
): Promise<
  | {
      id: string;
      createdAt: Date;
      updatedAt: Date;
      userId: string;
    }
  | undefined
> => {
  const [cart] = await db.select().from(carts).where(eq(carts.userId, userId));
  return cart;
};

export default app;
