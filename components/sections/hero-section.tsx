"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ParticleSystem } from "@/components/features/particle-system";
import { TypewriterText } from "@/components/atoms/typewriter-text";
import { GlitchText } from "@/components/atoms/glitch-text";
import { Button } from "@/components/ui/button";
import { ArrowDown, Github, Linkedin, Mail } from "lucide-react";

export function HeroSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToJourney = () => {
    document.getElementById("journey")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-background">
      {/* Aurora Background */}
      <div className="absolute inset-0 aurora-bg opacity-20 dark:opacity-30" />

      {/* Particle System */}
      <div className="absolute inset-0 z-0">
        {mounted && <ParticleSystem />}
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center"
        >
          {/* Profile Photo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="mb-8 flex justify-center"
          >
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald via-amber to-coral rounded-full blur-lg opacity-75 group-hover:opacity-100 transition-opacity animate-pulse" />
              <div className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-background glass">
                <Image
                  src="/profile.jpg"
                  alt="Anjana Rodrigo"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 640px) 192px, (max-width: 768px) 224px, 256px"
                />
              </div>
            </div>
          </motion.div>

          {/* Animated Greeting */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              <TypewriterText
                text="Hi, I'm Anjana Rodrigo"
                className="gradient-text"
                speed={100}
              />
            </h1>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mb-6"
          >
            <h2 className="text-2xl font-semibold text-muted-foreground sm:text-3xl md:text-4xl">
              Innovator | Engineer | Educator | Developer
            </h2>
          </motion.div>

          {/* Tagline with Glitch Effect */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="mb-12"
          >
            <GlitchText
              text="Transforming ideas into technology that replaces manual systems"
              className="text-lg text-muted-foreground sm:text-xl md:text-2xl"
            />
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.6 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Button
              size="lg"
              variant="emerald"
              onClick={scrollToJourney}
              className="group"
            >
              Explore My Journey
              <ArrowDown className="ml-2 h-4 w-4 transition-transform group-hover:translate-y-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() =>
                document
                  .getElementById("contact")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Get In Touch
            </Button>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 2.0 }}
            className="mt-12 flex items-center justify-center gap-6"
          >
            <a
              href="https://github.com/anjanarodrigo"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-emerald"
              aria-label="GitHub Profile"
            >
              <Github className="h-6 w-6" />
            </a>
            <a
              href="https://linkedin.com/in/anjanarodrigo"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-amber"
              aria-label="LinkedIn Profile"
            >
              <Linkedin className="h-6 w-6" />
            </a>
            <a
              href="mailto:anjana@example.com"
              className="text-muted-foreground transition-colors hover:text-coral"
              aria-label="Email Contact"
            >
              <Mail className="h-6 w-6" />
            </a>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 2.4 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="cursor-pointer"
            onClick={scrollToJourney}
          >
            <div className="flex flex-col items-center gap-2 text-muted-foreground hover:text-emerald transition-colors">
              <span className="text-sm">Scroll to explore</span>
              <ArrowDown className="h-5 w-5" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
