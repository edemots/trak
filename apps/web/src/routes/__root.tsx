import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type { AppRouter } from "@trak/api/routers/index";
import type { TRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import appCss from "../index.css?url";

export interface RouterAppContext {
	trpc: TRPCOptionsProxy<AppRouter>;
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "My App",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
			{
				rel: "preload",
				href: "/fonts/GeistMono-VariableFont_wght.ttf",
				as: "font",
				type: "font/ttf",
				crossOrigin: "anonymous",
			},
		],
	}),

	component: RootDocument,
});

function RootDocument() {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body className="font-sans antialiased">
				<ThemeProvider>
					<div className="grid h-svh grid-rows-1">
						<Outlet />
					</div>
					<Toaster richColors />
				</ThemeProvider>
				<TanStackRouterDevtools position="bottom-left" />
				<ReactQueryDevtools buttonPosition="bottom-right" position="bottom" />
				<Scripts />
			</body>
		</html>
	);
}
