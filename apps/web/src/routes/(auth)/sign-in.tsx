import { createFileRoute, redirect } from "@tanstack/react-router";
import { env } from "@trak/env/web";
import z from "zod";
import Logo from "@/components/logo";
import PixelBlast from "@/components/pixel-blast";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { getUser } from "@/functions/get-user";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/(auth)/sign-in")({
	ssr: true,
	validateSearch: z.object({
		redirect: z.string().optional(),
	}),
	beforeLoad: async () => {
		const session = await getUser();
		if (session) {
			throw redirect({
				to: "/dashboard",
			});
		}
	},
	component: RouteComponent,
});

function RouteComponent() {
	const search = Route.useSearch();

	const signIn = async () => {
		await authClient.signIn.social({
			provider: "google",
			callbackURL: `${env.VITE_WEB_URL}${search.redirect || "/dashboard"}`,
		});
	};

	return (
		<div className="relative isolate grid place-content-center">
			<div className="absolute top-4 right-4 z-10">
				<ThemeToggle />
			</div>
			<div className="absolute inset-0 z-0 hidden opacity-100 starting:opacity-0 duration-1500 dark:block">
				<PixelBlast
					color="#a1a1a1"
					edgeFade={0.25}
					enableRipples={false}
					patternDensity={1.25}
					patternScale={5}
					pixelSize={3}
					pixelSizeJitter={1}
					speed={0.1}
					variant="triangle"
				/>
			</div>
			<div className="absolute inset-0 z-0 block opacity-100 starting:opacity-0 duration-1500 dark:hidden">
				<PixelBlast
					color="#f5f5f5"
					edgeFade={0.25}
					enableRipples={false}
					patternDensity={1.25}
					patternScale={5}
					pixelSize={3}
					pixelSizeJitter={1}
					speed={0.1}
					variant="triangle"
				/>
			</div>
			<div className="grid-auto-rows relative isolate z-20 grid justify-items-center gap-8">
				<Logo />
				<h1 className="font-sans text-2xl">C'est l'heure des comptes !</h1>
				<Button onClick={signIn} size="lg" variant="secondary">
					<svg
						version="1.1"
						viewBox="0 0 48 48"
						xmlns="http://www.w3.org/2000/svg"
						xmlnsXlink="http://www.w3.org/1999/xlink"
					>
						<title>Google</title>
						<path
							d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
							fill="#EA4335"
						/>
						<path
							d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
							fill="#4285F4"
						/>
						<path
							d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
							fill="#FBBC05"
						/>
						<path
							d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
							fill="#34A853"
						/>
						<path d="M0 0h48v48H0z" fill="none" />
					</svg>
					<span className="mt-0.5">Continuer avec Google</span>
				</Button>
			</div>
		</div>
	);
}
