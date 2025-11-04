"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Home,
  User,
  Briefcase,
  BookOpen,
  MessageSquare,
  Youtube,
  Moon,
  Sun,
  Laptop,
} from "lucide-react"

export function CommandPalette() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  const { setTheme } = useTheme()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem
            onSelect={() => runCommand(() => router.push("/"))}
          >
            <Home className="mr-2 h-4 w-4" />
            <span>Home</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => {
              document.getElementById("journey")?.scrollIntoView({ behavior: "smooth" })
            })}
          >
            <User className="mr-2 h-4 w-4" />
            <span>Journey</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => {
              document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })
            })}
          >
            <Briefcase className="mr-2 h-4 w-4" />
            <span>Projects</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => {
              document.getElementById("blog")?.scrollIntoView({ behavior: "smooth" })
            })}
          >
            <BookOpen className="mr-2 h-4 w-4" />
            <span>Blog</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => {
              document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })
            })}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>Contact</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => {
              document.getElementById("youtube")?.scrollIntoView({ behavior: "smooth" })
            })}
          >
            <Youtube className="mr-2 h-4 w-4" />
            <span>YouTube</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Theme">
          <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
            <Sun className="mr-2 h-4 w-4" />
            <span>Light</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
            <Moon className="mr-2 h-4 w-4" />
            <span>Dark</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme("system"))}>
            <Laptop className="mr-2 h-4 w-4" />
            <span>System</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
