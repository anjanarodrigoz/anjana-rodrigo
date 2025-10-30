"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-full glass" />
    )
  }

  const isDark = theme === "dark"

  return (
    <motion.button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative w-14 h-8 rounded-full glass border border-border p-1 transition-colors hover:border-emerald"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
    >
      {/* Toggle slider */}
      <motion.div
        className="absolute w-6 h-6 rounded-full bg-gradient-to-br from-emerald to-amber flex items-center justify-center"
        animate={{
          x: isDark ? 22 : 2,
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
  )
}
