"use client";

import { MoonIcon, SunIcon, SunMoonIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";

import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";

const THEME_KEYBOARD_SHORTCUT = "t";
const THEMES = ["light", "dark", "system"] as const;
type ThemeName = (typeof THEMES)[number];

function normalizeTheme(theme: string | undefined): ThemeName {
  return THEMES.includes(theme as ThemeName) ? (theme as ThemeName) : "system";
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const cycleTheme = useCallback(() => {
    const currentTheme = normalizeTheme(theme);
    const nextTheme = THEMES[(THEMES.indexOf(currentTheme) + 1) % THEMES.length];
    setTheme(nextTheme);
  }, [theme, setTheme]);

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

  if (!isMounted) {
    return <Skeleton className="size-8" />;
  }

  const currentTheme = normalizeTheme(theme);

  return (
    <Button aria-label="Set theme" onClick={cycleTheme} variant="outline" size="icon">
      {currentTheme === "light" && <SunIcon />}
      {currentTheme === "dark" && <MoonIcon />}
      {currentTheme === "system" && <SunMoonIcon />}
    </Button>
  );
}
