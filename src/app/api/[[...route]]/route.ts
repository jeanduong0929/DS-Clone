import { Hono } from "hono";
import { handle } from "hono/vercel";

import auth from "./auth";
import users from "./users";
import products from "./products";
import cartItems from "./cartItems";

export const runtime = "edge";

const app = new Hono().basePath("/api");

const routes = app
  .route("/auth", auth)
  .route("/users", users)
  .route("/products", products)
  .route("/cartItems", cartItems);

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;
