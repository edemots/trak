"use client";

import { MoonIcon, SunIcon, SunMoonIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";

import { authClient } from "@/lib/auth-client";

import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";

const THEME_KEYBOARD_SHORTCUT = "t";

export function ThemeToggle() {
  const { theme, setTheme, themes } = useTheme();
  const { isPending } = authClient.useSession();
  const [themeQueue, setThemeQueue] = useState(() => themes);

  const cycleTheme = useCallback(() => {
    const nextTheme = themeQueue[0];
    setTheme(nextTheme);
    setThemeQueue((prevQueue) => [...prevQueue.slice(1), nextTheme]);
  }, [themeQueue, setThemeQueue, setTheme]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === THEME_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        cycleTheme();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cycleTheme]);

  if (isPending) {
    return <Skeleton className="size-8" />;
  }

  return (
    <Button aria-label="Set theme" onClick={cycleTheme} variant="outline" size="icon">
      {theme === "light" && <SunIcon />}
      {theme === "dark" && <MoonIcon />}
      {theme === "system" && <SunMoonIcon />}
    </Button>
  );
}
