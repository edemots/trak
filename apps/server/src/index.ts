import { trpcServer } from "@hono/trpc-server";
import { createContext } from "@trak/api/context";
import { appRouter } from "@trak/api/routers/index";
import { auth } from "@trak/auth";
import { env } from "@trak/env/server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

const app = new Hono();

const corsAllowList = env.CORS_ORIGIN.split(",")
  .map((item) => item.trim())
  .filter(Boolean);

const escapeRegExp = (value: string): string => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const getAllowedOrigin = (origin: string | undefined): string | undefined => {
  if (!origin || corsAllowList.length === 0) {
    return corsAllowList[0];
  }

  const isAllowed = corsAllowList.some((pattern) => {
    if (pattern === "*") {
      return true;
    }

    if (!pattern.includes("*")) {
      return origin === pattern;
    }

    const regexSource = `^${pattern.split("*").map(escapeRegExp).join(".*")}$`;
    return new RegExp(regexSource).test(origin);
  });

  return isAllowed ? origin : corsAllowList[0];
};

app.use(logger());
app.use(
  "/*",
  cors({
    origin: (origin) => {
      return getAllowedOrigin(origin);
    },
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    credentials: true,
  }),
);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext: (_opts, context) => {
      return createContext({ context });
    },
  }),
);

app.get("/", (c) => {
  return c.text("OK");
});

export default app;
