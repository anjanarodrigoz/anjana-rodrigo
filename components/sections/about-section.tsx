"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { SkillOrbs } from "@/components/features/skill-orbs";
import { Timeline3D } from "@/components/features/timeline-3d";
import { Briefcase, GraduationCap, Code, Lightbulb } from "lucide-react";

const milestones = [
  {
    year: "2019-2023",
    title: "Mining & Mineral Processing Engineer",
    icon: Briefcase,
    description:
      "Started career in mining industry, optimizing processes and implementing systematic improvements.",
    color: "emerald" as const,
  },
  {
    year: "2021-2023",
    title: "Transition to Technology",
    icon: Lightbulb,
    description:
      "Discovered passion for software development. Self-taught programming and built first applications.",
    color: "amber" as const,
  },
  {
    year: "2023-2024",
    title: "Full-Stack Development",
    icon: Code,
    description:
      "Mastered modern web & mobile technologies: React, Node.js, Flutter. Built production-grade applications.",
    color: "coral" as const,
  },
  {
    year: "2025-Present",
    title: "Software Innovator & Educator",
    icon: GraduationCap,
    description:
      "Leading projects, mentoring developers, and creating systems that transform manual workflows.",
    color: "emerald" as const,
  },
];

const skills = [
  { name: "Flutter", level: 95, color: "#02569B" },
  { name: "React", level: 90, color: "#61DAFB" },
  { name: "Node.js", level: 88, color: "#339933" },
  { name: "Firebase", level: 85, color: "#FFCA28" },
  { name: "Redux", level: 87, color: "#764ABC" },
  { name: "Clean Architecture", level: 92, color: "#10B981" },
  { name: "WSO2", level: 80, color: "#FF7300" },
  { name: "PostgreSQL", level: 85, color: "#336791" },
  { name: "MongoDB", level: 83, color: "#47A248" },
  { name: "AWS", level: 82, color: "#FF9900" },
];

export function AboutSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [0.8, 1, 1, 0.8]
  );

  return (
    <section
      id="about"
      ref={containerRef}
      className="relative min-h-screen py-20 overflow-hidden"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/50 to-background" />
      <div className="watercolor-overlay absolute inset-0 opacity-30" />

      <motion.div
        style={{ opacity, scale }}
        className="container relative z-10 mx-auto px-4"
      >
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-4">
            <span className="gradient-text">My Journey</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From mining engineering to software innovation — a transformation
            driven by passion, curiosity, and the desire to create meaningful
            technology
          </p>
        </motion.div>

        {/* Story Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-20 max-w-4xl mx-auto"
        >
          <div className="glass p-8 rounded-2xl border border-border">
            <p className="text-lg leading-relaxed mb-4">
              My journey into technology began in an unexpected place — the
              mining industry. As a{" "}
              <strong className="text-emerald">
                Mining & Mineral Processing Engineer
              </strong>
              , I spent years optimizing complex industrial processes, solving
              problems, and implementing systematic improvements.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              But I discovered something profound:{" "}
              <em className="text-amber">
                the principles of engineering excellence translate beautifully
                to software development
              </em>
              . The same analytical thinking, systematic approach, and passion
              for optimization that drove my work in mining became the
              foundation for building elegant, efficient software solutions.
            </p>
            <p className="text-lg leading-relaxed">
              Today, I'm a{" "}
              <strong className="text-coral">
                Software Innovator, Engineer, and Educator
              </strong>
              , specializing in creating systems that transform manual workflows
              into automated, intelligent solutions. I mentor developers, lead
              projects, and continue learning — because in technology, the
              journey never ends.
            </p>
          </div>
        </motion.div>

        {/* 3D Timeline */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-20"
        >
          <h3 className="text-3xl font-bold text-center mb-12">
            Timeline of Transformation
          </h3>
          <Timeline3D milestones={milestones} />
        </motion.div>

        {/* Skills Section with 3D Orbs */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h3 className="text-3xl font-bold text-center mb-12">
            Technical Expertise
          </h3>
          <SkillOrbs skills={skills} />
        </motion.div>

        {/* Achievements Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="glass p-6 rounded-xl text-center hover:scale-105 transition-transform">
            <div className="text-4xl font-bold text-emerald mb-2">10+</div>
            <div className="text-muted-foreground">Production Apps</div>
          </div>
          <div className="glass p-6 rounded-xl text-center hover:scale-105 transition-transform">
            <div className="text-4xl font-bold text-amber mb-2">50+</div>
            <div className="text-muted-foreground">Projects Completed</div>
          </div>
          <div className="glass p-6 rounded-xl text-center hover:scale-105 transition-transform">
            <div className="text-4xl font-bold text-coral mb-2">100+</div>
            <div className="text-muted-foreground">Developers Mentored</div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
