import { Hono } from "hono";
import { z } from "zod";

import { db } from "@/db";
import { zValidator } from "@hono/zod-validator";
import { selectProductImageSchema } from "@/db/schema";

/**
 * API routes for managing products.
 *
 * This Hono application provides endpoints to retrieve product information.
 * It includes the following routes:
 *
 * - `GET /`: Fetches a list of all products along with their associated images,
 *   ordered by the display order.
 * - `GET /ids`: Fetches details for multiple products identified by a comma-separated
 *   list of product IDs. Validates the `ids` query parameter using Zod schema.
 * - `GET /:productId`: Fetches details for a specific product identified by
 *   the `productId` parameter. Validates the `productId` using Zod schema.
 *
 * @module products
 */
const app = new Hono()
  /**
   * Fetches all products.
   *
   * This route retrieves all products from the database, including their
   * associated images, and returns them in a JSON response.
   *
   * @param {Context} c - The Hono context object containing request and response information.
   * @returns {Promise<Response>} A JSON response containing the list of products.
   */
  .get("/", async (c) => {
    const result = await db.query.products.findMany({
      with: {
        productImages: {
          orderBy: (productImages, { asc }) => [
            asc(productImages.displayOrder),
          ],
        },
      },
    });

    return c.json({ data: result }, 200);
  })
  /**
   * Fetches products by their IDs.
   *
   * This route retrieves products from the database based on a comma-separated
   * list of product IDs provided in the query parameter. It validates the `ids`
   * query parameter using Zod schema.
   *
   * @param {Context} c - The Hono context object containing request and response information.
   * @returns {Promise<Response>} A JSON response containing the list of products matching the provided IDs.
   */
  .get(
    "/ids",
    zValidator(
      "query",
      z.object({
        ids: z.string(),
      })
    ),
    async (c) => {
      const { ids } = c.req.valid("query");
      const parsedIds = ids.split(",");
      const result = await db.query.products.findMany({
        where: (products, { inArray }) => inArray(products.id, parsedIds),
        with: {
          productImages: {
            orderBy: (productImages, { asc }) => [
              asc(productImages.displayOrder),
            ],
          },
        },
      });
      return c.json({ data: result }, 200);
    }
  )
  /**
   * Fetches a product by its ID.
   *
   * This route retrieves a specific product from the database identified by
   * the `productId` parameter. It validates the `productId` using Zod schema.
   *
   * @param {Context} c - The Hono context object containing request and response information.
   * @returns {Promise<Response>} A JSON response containing the details of the requested product.
   */
  .get(
    "/:productId",
    zValidator(
      "param",
      selectProductImageSchema.pick({
        productId: true,
      })
    ),
    async (c) => {
      const { productId } = c.req.valid("param");
      const result = await db.query.products.findFirst({
        where: (products, { eq }) => eq(products.id, productId),
        with: {
          productImages: {
            orderBy: (productImages, { asc }) => [
              asc(productImages.displayOrder),
            ],
          },
        },
      });
      return c.json({ data: result }, 200);
    }
  );

export default app;
