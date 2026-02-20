"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ProjectCard } from "@/components/features/project-card";
import { ProjectModal } from "@/components/features/project-modal";

export interface Project {
  id: string;
  title: string;
  description: string;
  problem: string;
  solution: string;
  image: string;
  tags: string[];
  techStack: Array<{ name: string; icon: string; color: string }>;
  liveUrl?: string;
  githubUrl?: string;
  stats: {
    users?: string;
    performance?: string;
    efficiency?: string;
  };
  features: string[];
  screenshots: string[];
}

const projects: Project[] = [
  {
    id: "mis",
    title: "Management Information System - UOM",
    description:
      "Comprehensive platform for online education with real-time collaboration, progress tracking, and AI-powered recommendations.",
    problem:
      "Educational institutions struggled with fragmented tools for course management, student engagement, and performance analytics.",
    solution:
      "Built a unified LMS with React admin,student dashboard, Node.js backend, and real-time WebSocket communication for live classes.",
    image: "/projects/lms.jpg",
    tags: ["Education", "Real-time", "AI"],
    techStack: [
      { name: "React", icon: "react", color: "#61DAFB" },
      { name: "JavaScript", icon: "javascript", color: "#f6df1d" },
      { name: "TypeScript", icon: "typescript", color: "#3178c5" },
      { name: "Material UI", icon: "material", color: "#017fff" },
      { name: "Node.js", icon: "nodejs", color: "#339933" },
      { name: "MongoDB", icon: "mongodb", color: "#336791" },
    ],
    // liveUrl: "https://lms-demo.example.com",
    stats: {
      users: "5,000+",
      performance: "99.9% uptime",
      efficiency: "40% faster course completion",
    },
    features: [
      "Manage informations of University",
      "Course enrollment",
      "View  ",
      "Progress tracking and analytics dashboard",
      "Gamification with badges and leaderboards",
    ],
    screenshots: [
      "/projects/lms-1.jpg",
      "/projects/lms-2.jpg",
      "/projects/lms-3.jpg",
    ],
  },
  {
    id: "zomoto",
    title: "Zomoto - Restaurant POS System",
    description:
      "Complete restaurant point-of-sale system built with Flutter, featuring multi-role order management, kitchen display, billing, and real-time synchronization across devices.",
    problem:
      "Small and mid-size restaurants in Sri Lanka relied on manual processes or expensive legacy POS systems that were disconnected, rigid, and difficult to customize.",
    solution:
      "Built Zomoto as my first Flutter project to learn the framework by solving a real problem. It evolved into a production POS system with Clean Architecture and Riverpod, now running in 3 restaurants in Sri Lanka.",
    image: "/projects/restaurant.jpg",
    tags: ["Business", "Mobile", "Real-time"],
    techStack: [
      { name: "Flutter", icon: "flutter", color: "#02569B" },
      { name: "Dart", icon: "dart", color: "#0175C2" },
      { name: "Firebase", icon: "firebase", color: "#FFCA28" },
      { name: "Riverpod", icon: "riverpod", color: "#0553B1" },
      { name: "Clean Architecture", icon: "architecture", color: "#10B981" },
    ],
    // githubUrl: "https://github.com/anjanarodrigoz/zomoto",
    stats: {
      users: "3 restaurants",
      performance: "Real-time sync",
      efficiency: "Active in Sri Lanka",
    },
    features: [
      "Multi-role access: Cashier, Kitchen, Waiter, Owner, Manager",
      "Real-time kitchen display with station filtering",
      "Multi-round dine-in order management",
      "Split billing and table management",
      "Menu management with modifiers and variants",
      "Sales analytics and reporting",
    ],
    screenshots: ["/projects/restaurant-1.jpg", "/projects/restaurant-2.jpg"],
  },
  {
    id: "arcon-travel",
    title: "Arcon Travel App",
    description:
      "Luxury travel management mobile application enabling customers to book, track, and manage their travel arrangements seamlessly with real-time updates, document management, and incident reporting.",
    problem:
      "Travel customers had no centralized way to view their itineraries, manage travel documents, report incidents on the go, or communicate with their travel agency in real time.",
    solution:
      "Built a full-featured Flutter mobile app with Dio-based API integration, GPS-enabled incident reporting, in-app PDF viewer for documents, and a chatbot for customer support — all tied together with a clean layered architecture using GetIt for dependency injection.",
    image: "/projects/arcon-travel.jpg",
    tags: ["Mobile", "Travel"],
    techStack: [
      { name: "Flutter", icon: "flutter", color: "#02569B" },
      { name: "Dart", icon: "dart", color: "#0175C2" },
      { name: "Dio", icon: "dio", color: "#EF4444" },
      { name: "GetIt", icon: "getit", color: "#10B981" },
      { name: "Google Maps", icon: "googlemaps", color: "#4285F4" },
    ],
    stats: {
      users: "12+ screens",
      performance: "Android & iOS",
      efficiency: "61+ Dart files",
    },
    features: [
      "Multi-step authentication with OTP and token persistence",
      "Travel tracking with flights, hotels, transfers, and itineraries",
      "Document upload and in-app PDF viewing by category",
      "GPS-enabled incident reporting with photo attachments",
      "Star rating feedback system for completed trips",
      "Chatbot for real-time customer support",
    ],
    screenshots: ["/projects/arcon-1.jpg", "/projects/arcon-2.jpg"],
  },
  {
    id: "melbourne-mover",
    title: "Melbourne Mover - Driver App",
    description:
      "A real-time driver management app for a Melbourne-based moving company, enabling drivers to manage jobs, track trips with GPS, handle payments, and generate invoices on the go.",
    problem:
      "Drivers at a moving company had no streamlined way to view bookings, track trip hours, calculate billing with extras like GST and card fees, or generate invoices — everything was manual and error-prone.",
    solution:
      "Built a Flutter app with GetX state management, Firebase backend, and Google Maps integration for real-time GPS tracking. Drivers can accept jobs, auto-calculate billable hours, process payments, and email invoices directly from the app.",
    image: "/projects/melbourne-mover.jpg",
    tags: ["Mobile", "Business", "Real-time"],
    techStack: [
      { name: "Flutter", icon: "flutter", color: "#02569B" },
      { name: "Dart", icon: "dart", color: "#0175C2" },
      { name: "Firebase", icon: "firebase", color: "#FFCA28" },
      { name: "GetX", icon: "getx", color: "#8B5CF6" },
      { name: "Google Maps", icon: "googlemaps", color: "#4285F4" },
    ],
    stats: {
      users: "Active drivers",
      performance: "Real-time GPS",
      efficiency: "Automated billing",
    },
    features: [
      "Role-based authentication: Driver, Admin, Booker, Customer",
      "Trip lifecycle management: pending → ongoing → arrived → completed",
      "Real-time GPS tracking with Google Maps",
      "Auto-calculated billable hours with GST and card fee handling",
      "Invoice generation and email delivery",
      "Driver salary tracking and payment history",
    ],
    screenshots: ["/projects/melbourne-mover-1.jpg", "/projects/melbourne-mover-2.jpg"],
  },
];

export function ProjectsSection() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const allTags = [
    "all",
    ...Array.from(new Set(projects.flatMap((p) => p.tags))),
  ];

  const filteredProjects =
    filter === "all"
      ? projects
      : projects.filter((p) => p.tags.includes(filter));

  return (
    <section
      id="projects"
      className="relative min-h-screen py-20 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background to-background/50" />

      <div className="container relative z-10 mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-4">
            <span className="gradient-text">Featured Projects</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Transforming ideas into production-ready applications that solve
            real problems
          </p>

          {/* Filter Tags */}
          <div className="flex flex-wrap justify-center gap-3">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setFilter(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === tag
                    ? "bg-emerald text-white shadow-lg"
                    : "glass hover:bg-accent"
                }`}
              >
                {tag.charAt(0).toUpperCase() + tag.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {filteredProjects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              onClick={() => setSelectedProject(project)}
            />
          ))}
        </div>

        {/* Project Modal */}
        {selectedProject && (
          <ProjectModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </div>
    </section>
  );
}
