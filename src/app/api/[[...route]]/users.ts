import { Hono } from "hono";

const users = new Hono().get("/", (c) => {
  return c.json({
    message: "Hello Next.js!",
  });
});

export default users;
