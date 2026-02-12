import { db } from "@trak/db";
import * as schema from "@trak/db/schema/auth";
import { env } from "@trak/env/server";
import { betterAuth, logger } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema,
  }),
  logger: {
    disabled: false,
    disableColors: false,
    level: env.ENV === "production" ? "warn" : "debug",
    log: (level, message, ...args) => {
      // Custom logging implementation
      console.log(`[${level}] ${message}`, ...args);
    },
  },
  telemetry: {
    enabled: false,
  },
  trustedOrigins: env.CORS_ORIGIN.split(","),
  emailAndPassword: {
    enabled: false,
  },
  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  session: {
    cookieCache: {
      enabled: env.ENV !== "development",
      maxAge: 60,
    },
  },
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  advanced: {
    defaultCookieAttributes: {
      sameSite: "lax",
      secure: true,
      httpOnly: true,
    },
    crossSubDomainCookies: {
      enabled: env.ENV !== "development",
      domain: `.${env.CROSS_SUBDOMAIN_COOKIE_DOMAIN}`,
    },
  },
  onAPIError: {
    errorURL: "/error",
    onError: (error) => {
      if (error instanceof Error && error.message) {
        logger.error(error.message, { error });
      }
      logger.error("An API error occurred", { error });
    },
    throw: false,
  },
});
