"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timeout);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      aria-label="Ganti tema"
      className="interactive-button inline-flex size-11 items-center justify-center rounded-md border border-slate-200 bg-white/80 text-slate-700 shadow-sm backdrop-blur transition dark:border-white/10 dark:bg-white/10 dark:text-slate-100"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      type="button"
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}
