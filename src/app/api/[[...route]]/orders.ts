import { z } from "zod";
import { eq } from "drizzle-orm";
import { Hono, Context } from "hono";

import { db } from "@/db";
import { cartItems, carts, orderItems, orders, users } from "@/db/schema";
import { authMiddleware } from "@/features/auth/api/middleware";
import { zValidator } from "@hono/zod-validator";

const app = new Hono().post(
  "/",
  authMiddleware,
  zValidator(
    "query",
    z.object({
      productId: z.string(),
    })
  ),
  async (c) => {
    const user = await getUser(c);
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const orderId = await createOrder(user.id);
    if (!orderId) {
      throw new Error("Failed to create order");
    }

    const { productId } = c.req.valid("query");
    const parsedProductId = productId.split(",");

    const orderItems = await createOrderItems(orderId, parsedProductId);
    if (orderItems.length !== parsedProductId.length) {
      throw new Error("Failed to create order items");
    }

    const cart = await getCart(user.id);
    if (!cart) {
      throw new Error("Cart not found");
    }

    const deletedCartItems = await clearCart(cart.id);
    if (deletedCartItems.length !== parsedProductId.length) {
      throw new Error("Failed to clear cart items");
    }

    return c.json({ success: true }, 200);
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
 * Creates a new order in the database for a specified user.
 *
 * This function inserts a new order record into the `orders` table
 * and returns the unique identifier of the created order.
 *
 * @param {string} userId - The unique identifier of the user for whom the order is being created.
 * @returns {Promise<string>} A promise that resolves to the ID of the newly created order.
 * @throws {Error} Throws an error if the order creation fails.
 */
const createOrder = async (userId: string) => {
  const [{ id: orderId }] = await db
    .insert(orders)
    .values({
      userId,
    })
    .returning({
      id: orders.id,
    });

  return orderId;
};

/**
 * Creates new order items in the database for a specified order.
 *
 * This function inserts multiple order items into the `orderItems` table
 * based on the provided order ID and an array of product IDs. It returns
 * an array of the unique identifiers of the created order items.
 *
 * @param {string} orderId - The unique identifier of the order for which the items are being created.
 * @param {string[]} productIds - An array of unique identifiers for the products being ordered.
 * @returns {Promise<Array<{ id: string }>>} A promise that resolves to an array of objects, each containing the ID of a newly created order item.
 * @throws {Error} Throws an error if the order item creation fails.
 */
const createOrderItems = async (orderId: string, productIds: string[]) => {
  const items = await db
    .insert(orderItems)
    .values(
      productIds.map((productId) => ({
        orderId,
        productId,
      }))
    )
    .returning({
      id: orderItems.id,
    });

  return items;
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

/**
 * Clears all items from the specified cart in the database.
 *
 * This function deletes all cart items associated with the given cart ID.
 * It returns an array of objects, each containing the ID of the deleted cart item.
 *
 * @param {string} cartId - The unique identifier of the cart whose items are to be deleted.
 * @returns {Promise<Array<{ id: string }>>} A promise that resolves to an array of objects, each containing the ID of a deleted cart item.
 * @throws {Error} Throws an error if the deletion fails.
 */
const clearCart = async (cartId: string) => {
  const items = await db
    .delete(cartItems)
    .where(eq(cartItems.cartId, cartId))
    .returning({
      id: cartItems.id,
    });

  return items;
};

export default app;
