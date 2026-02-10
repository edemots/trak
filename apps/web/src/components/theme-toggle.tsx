"use client";

import { Moon, Sun, SunMoon } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";

export function ThemeToggle() {
	const { theme, setTheme, themes } = useTheme();
	const { isPending } = authClient.useSession();
	const [themeQueue, setThemeQueue] = useState(() => themes);

	if (isPending) {
		return <Skeleton className="h-8 w-9" />;
	}

	function cycleTheme() {
		const nextTheme = themeQueue[0];
		setTheme(nextTheme);
		setThemeQueue((prevQueue) => [...prevQueue.slice(1), nextTheme]);
	}

	return (
		<Button aria-label="Set theme" onClick={cycleTheme} variant="outline">
			{theme === "light" && <Sun />}
			{theme === "dark" && <Moon />}
			{theme === "system" && <SunMoon />}
		</Button>
	);
}
