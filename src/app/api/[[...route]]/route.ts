import { Hono } from "hono";
import { handle } from "hono/vercel";

import auth from "./auth";
import users from "./users";

export const runtime = "edge";

const app = new Hono().basePath("/api");

const routes = app.route("/auth", auth).route("/users", users);

export const GET = handle(app);
export const POST = handle(app);

export type AppType = typeof routes;
