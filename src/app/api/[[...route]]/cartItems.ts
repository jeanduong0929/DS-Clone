import { z } from "zod";
import { Context, Hono } from "hono";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { authMiddleware } from "@/features/auth/api/middleware";
import { zValidator } from "@hono/zod-validator";
import { cartItems, carts, insertCartItemSchema, users } from "@/db/schema";

const app = new Hono()
  /**
   * Handles the GET request to retrieve cart items for the authenticated user.
   *
   * This endpoint first retrieves the user information from the context. If the user is not found,
   * it throws an error. Then, it fetches the user's cart based on their ID. If the cart is not found,
   * it throws an error. Finally, it retrieves the cart items associated with the cart and returns
   * the product details in a JSON response.
   *
   * @param {Context} c - The Hono context object containing request and response information.
   * @returns {Promise<Response>} - A promise that resolves to a JSON response containing the cart items.
   * @throws {Error} - Throws an error if the user or cart is not found.
   */
  .get("/", authMiddleware, async (c) => {
    const users = await getUser(c);
    if (!users) {
      throw new Error("User not found");
    }
    const cart = await getCart(users.id);
    if (!cart) {
      throw new Error("Cart not found");
    }

    const result = await getCartItems(cart.id);

    return c.json({ data: result.map((item) => item.products) }, 200);
  })
  /**
   * Handles the POST request to add a product to the user's cart.
   *
   * This endpoint first validates the request using the `zValidator` to ensure that the `productId`
   * is provided in the query. It then retrieves the user information from the context. If the user
   * is not found, it throws an error. Next, it fetches the user's cart based on their ID. If the cart
   * is not found, it throws an error. The function checks if the product is already in the cart. If it
   * is, it returns a 409 Conflict response. If the product is not in the cart, it inserts the new cart
   * item into the database and returns a success response.
   *
   * @param {Context} c - The Hono context object containing request and response information.
   * @returns {Promise<Response>} - A promise that resolves to a JSON response indicating success or error.
   * @throws {Error} - Throws an error if the user or cart is not found, or if the product is already in the cart.
   */
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
  )
  /**
   * Deletes a cart item from the user's cart.
   *
   * This endpoint first validates the request using the `zValidator` to ensure that the `productId`
   * is provided in the query. It then retrieves the user information from the context. If the user
   * is not found, it throws an error. Next, it fetches the user's cart based on their ID. If the cart
   * is not found, it throws an error. Finally, it deletes the specified cart item from the database
   * and returns a success response.
   *
   * @param {Context} c - The Hono context object containing request and response information.
   * @returns {Promise<Response>} - A promise that resolves to a JSON response indicating success.
   * @throws {Error} - Throws an error if the user or cart is not found.
   */
  .delete(
    "/:productId",
    authMiddleware,
    zValidator(
      "param",
      z.object({
        productId: z.string(),
      })
    ),
    async (c) => {
      const { productId } = c.req.valid("param");

      const user = await getUser(c);
      if (!user) {
        throw new Error("User not found");
      }
      const cart = await getCart(user.id);
      if (!cart) {
        throw new Error("Cart not found");
      }

      const [deletedItem] = await db
        .delete(cartItems)
        .where(
          and(eq(cartItems.cartId, cart.id), eq(cartItems.productId, productId))
        )
        .returning({
          id: cartItems.id,
        });

      if (!deletedItem) {
        return c.json({ error: "Cart item not found" }, 404);
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
 * Retrieves the items in a specific cart from the database.
 *
 * This function queries the database to find all items associated with the given cart ID.
 * It returns an array of cart items, each including details about the products and their images.
 *
 * @param {string} cartId - The unique identifier of the cart whose items are to be retrieved.
 * @returns {Promise<Array<{
 *   id: string;
 *   name: string;
 *   price: number;
 *   productImages: Array<{ url: string }>
 * }>>} - A promise that resolves to an array of cart items, each containing product details and associated images.
 */
const getCartItems = async (cartId: string) => {
  return db.query.cartItems.findMany({
    where: eq(cartItems.cartId, cartId),
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
            },
          },
        },
      },
    },
  });
};

export default app;
