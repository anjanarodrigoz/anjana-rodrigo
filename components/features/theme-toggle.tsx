"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-10 h-10 rounded-full glass" />;
  }

  const isDark = theme === "dark";

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.button
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="relative w-14 h-8 rounded-full glass border-2 border-border transition-colors hover:border-emerald shadow-md"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Toggle theme"
      >
        {/* Toggle slider */}
        <motion.div
          className="absolute top-0.5 w-6 h-6 rounded-full bg-gradient-to-br from-emerald to-amber flex items-center justify-center shadow-lg"
          animate={{
            left: isDark ? "calc(100% - 28px)" : "4px",
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {isDark ? (
            <Moon className="w-4 h-4 text-white" />
          ) : (
            <Sun className="w-4 h-4 text-white" />
          )}
        </motion.div>
      </motion.button>

      {/* Theme label below button */}
      <motion.span
        className="text-xs font-medium text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {isDark ? "Dark" : "Light"}
      </motion.span>
    </div>
  );
}
