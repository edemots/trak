import path from "node:path";
import alchemy from "alchemy";
import { D1Database, TanStackStart, Worker } from "alchemy/cloudflare";
import { GitHubComment } from "alchemy/github";
import { CloudflareStateStore, FileSystemStateStore } from "alchemy/state";
import { config } from "dotenv";

const stage = process.env.STAGE || undefined;

const app = await alchemy("trak", {
	stage,
	stateStore:
		stage && process.env.CI === "true"
			? (scope) => new CloudflareStateStore(scope)
			: (scope) =>
					new FileSystemStateStore(scope, {
						rootDir: path.resolve(import.meta.dirname, ".alchemy"),
					}),
});

config({ path: "./.env" });
config({ path: "../../apps/web/.env" });
config({ path: "../../apps/server/.env" });

const db = await D1Database("database", {
	migrationsDir: "../../packages/db/src/migrations",
});

export const web = await TanStackStart("web", {
	cwd: "../../apps/web",
	bindings: {
		VITE_SERVER_URL: alchemy.env.VITE_SERVER_URL!,
		DB: db,
		CORS_ORIGIN: alchemy.env.CORS_ORIGIN!,
		BETTER_AUTH_SECRET: alchemy.secret.env.BETTER_AUTH_SECRET!,
		BETTER_AUTH_URL: alchemy.env.BETTER_AUTH_URL!,
	},
});

export const server = await Worker("server", {
	cwd: "../../apps/server",
	entrypoint: "src/index.ts",
	compatibility: "node",
	bindings: {
		DB: db,
		CORS_ORIGIN: alchemy.env.CORS_ORIGIN!,
		BETTER_AUTH_SECRET: alchemy.secret.env.BETTER_AUTH_SECRET!,
		BETTER_AUTH_URL: alchemy.env.BETTER_AUTH_URL!,
	},
	dev: {
		port: 8000,
	},
});

if (process.env.CI === "true" && process.env.PULL_REQUEST) {
	await GitHubComment("preview-comment", {
		owner: "edemots",
		repository: "trak",
		issueNumber: Number(process.env.PULL_REQUEST),
		body: `## 🚀 Preview Deployed

Your changes have been deployed to a preview environment:

**🌐 Web:** ${web.url}
**⚙️ Server:** ${server.url}

Built from commit ${process.env.GITHUB_SHA?.slice(0, 7)}

---
<sub>🤖 This comment updates automatically with each push.</sub>`,
	});
} else {
	console.log(`Web    -> ${web.url}`);
	console.log(`Server -> ${server.url}`);
}

await app.finalize();
