import { db } from "@trak/db";
import * as schema from "@trak/db/schema/auth";
import { env } from "@trak/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "sqlite",
		schema,
	}),
	trustedOrigins: [env.CORS_ORIGIN],
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
			enabled: env.ENV === "production",
			maxAge: 60,
		},
	},
	secret: env.BETTER_AUTH_SECRET,
	baseURL: env.BETTER_AUTH_URL,
	advanced: {
		defaultCookieAttributes: {
			sameSite: "none",
			secure: true,
			httpOnly: true,
		},
		crossSubDomainCookies: {
			enabled: env.ENV === "production",
			domain: `.${env.CROSS_SUBDOMAIN_COOKIE_DOMAIN}`,
		},
	},
});
