"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10" />
    );
  }

  return (
    <button
      onClick={() => {
        setTheme(resolvedTheme === "light" ? "dark" : "light");
      }}
      className="relative w-9 h-9 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-ink-2 hover:text-ink overflow-hidden"
      aria-label="Toggle theme"
      title={`Current theme: ${resolvedTheme}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={resolvedTheme}
          initial={{ y: -20, opacity: 0, rotate: -90, scale: 0.5 }}
          animate={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
          exit={{ y: 20, opacity: 0, rotate: 90, scale: 0.5 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          style={{ position: 'absolute' }}
        >
          {resolvedTheme === "light" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </motion.div>
      </AnimatePresence>
    </button>
  );
}
