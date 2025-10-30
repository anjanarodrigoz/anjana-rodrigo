"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { ProjectCard } from "@/components/features/project-card"
import { ProjectModal } from "@/components/features/project-modal"

export interface Project {
  id: string
  title: string
  description: string
  problem: string
  solution: string
  image: string
  tags: string[]
  techStack: Array<{ name: string; icon: string; color: string }>
  liveUrl?: string
  githubUrl?: string
  stats: {
    users?: string
    performance?: string
    efficiency?: string
  }
  features: string[]
  screenshots: string[]
}

const projects: Project[] = [
  {
    id: "lms",
    title: "Learning Management System",
    description: "Comprehensive platform for online education with real-time collaboration, progress tracking, and AI-powered recommendations.",
    problem: "Educational institutions struggled with fragmented tools for course management, student engagement, and performance analytics.",
    solution: "Built a unified LMS with Flutter mobile app, React admin dashboard, Node.js backend, and real-time WebSocket communication for live classes.",
    image: "/projects/lms.jpg",
    tags: ["Education", "Real-time", "AI"],
    techStack: [
      { name: "Flutter", icon: "flutter", color: "#02569B" },
      { name: "React", icon: "react", color: "#61DAFB" },
      { name: "Node.js", icon: "nodejs", color: "#339933" },
      { name: "PostgreSQL", icon: "postgresql", color: "#336791" },
      { name: "Firebase", icon: "firebase", color: "#FFCA28" },
      { name: "Redis", icon: "redis", color: "#DC382D" },
    ],
    liveUrl: "https://lms-demo.example.com",
    githubUrl: "https://github.com/anjanarodrigo/lms",
    stats: {
      users: "5,000+",
      performance: "99.9% uptime",
      efficiency: "40% faster course completion",
    },
    features: [
      "Interactive video lessons with annotations",
      "Real-time quizzes and assessments",
      "AI-powered study recommendations",
      "Progress tracking and analytics dashboard",
      "Gamification with badges and leaderboards",
      "Offline mode for mobile app",
    ],
    screenshots: ["/projects/lms-1.jpg", "/projects/lms-2.jpg", "/projects/lms-3.jpg"],
  },
  {
    id: "restaurant",
    title: "Restaurant Management System",
    description: "End-to-end restaurant operations platform with POS, inventory management, kitchen display, and customer ordering.",
    problem: "Restaurants used multiple disconnected systems for orders, inventory, and billing, leading to errors and inefficiency.",
    solution: "Created an integrated system with Flutter POS app, web dashboard, kitchen display system, and customer-facing ordering app with real-time synchronization.",
    image: "/projects/restaurant.jpg",
    tags: ["Business", "Real-time", "IoT"],
    techStack: [
      { name: "Flutter", icon: "flutter", color: "#02569B" },
      { name: "Node.js", icon: "nodejs", color: "#339933" },
      { name: "MongoDB", icon: "mongodb", color: "#47A248" },
      { name: "Socket.io", icon: "socketio", color: "#010101" },
      { name: "Redux", icon: "redux", color: "#764ABC" },
    ],
    githubUrl: "https://github.com/anjanarodrigo/restaurant-system",
    stats: {
      users: "200+ restaurants",
      performance: "30% faster order processing",
      efficiency: "50% reduction in food waste",
    },
    features: [
      "Touch-optimized POS interface",
      "Real-time kitchen order management",
      "Inventory tracking with low-stock alerts",
      "Table management and reservations",
      "Analytics and sales reporting",
      "Multi-location support",
    ],
    screenshots: ["/projects/restaurant-1.jpg", "/projects/restaurant-2.jpg"],
  },
  {
    id: "travel",
    title: "Travel Planning App",
    description: "Smart travel companion with AI itinerary generation, booking integration, and collaborative trip planning.",
    problem: "Planning trips involved juggling multiple apps and websites, making it overwhelming and time-consuming.",
    solution: "Developed a Flutter app with AI-powered itinerary suggestions, integrated bookings, offline maps, and collaborative planning features.",
    image: "/projects/travel.jpg",
    tags: ["Travel", "AI", "Mobile"],
    techStack: [
      { name: "Flutter", icon: "flutter", color: "#02569B" },
      { name: "Firebase", icon: "firebase", color: "#FFCA28" },
      { name: "Google Maps", icon: "google", color: "#4285F4" },
      { name: "OpenAI", icon: "openai", color: "#412991" },
    ],
    liveUrl: "https://play.google.com/store/apps/details?id=com.travel",
    stats: {
      users: "10,000+ downloads",
      performance: "4.8★ rating",
      efficiency: "60% faster trip planning",
    },
    features: [
      "AI-generated personalized itineraries",
      "Integrated flight and hotel booking",
      "Offline maps and navigation",
      "Collaborative trip planning",
      "Budget tracking and expense splitting",
      "Real-time travel alerts",
    ],
    screenshots: ["/projects/travel-1.jpg", "/projects/travel-2.jpg", "/projects/travel-3.jpg"],
  },
  {
    id: "expense",
    title: "Expense Tracker Pro",
    description: "Intelligent personal finance app with automatic categorization, budget insights, and investment tracking.",
    problem: "Users struggled to maintain consistent expense tracking and lacked insights into spending patterns.",
    solution: "Built a Flutter app with ML-powered categorization, beautiful visualizations, receipt scanning, and multi-currency support.",
    image: "/projects/expense.jpg",
    tags: ["Finance", "ML", "Analytics"],
    techStack: [
      { name: "Flutter", icon: "flutter", color: "#02569B" },
      { name: "Firebase", icon: "firebase", color: "#FFCA28" },
      { name: "TensorFlow", icon: "tensorflow", color: "#FF6F00" },
      { name: "Clean Architecture", icon: "architecture", color: "#10B981" },
    ],
    liveUrl: "https://expense-tracker-pro.example.com",
    githubUrl: "https://github.com/anjanarodrigo/expense-tracker",
    stats: {
      users: "25,000+ users",
      performance: "Average 30% savings increase",
      efficiency: "5-second receipt scanning",
    },
    features: [
      "Automatic expense categorization with ML",
      "Budget planning and alerts",
      "Receipt scanning with OCR",
      "Interactive charts and insights",
      "Multi-currency support",
      "Export to CSV/PDF",
    ],
    screenshots: ["/projects/expense-1.jpg", "/projects/expense-2.jpg"],
  },
]

export function ProjectsSection() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [filter, setFilter] = useState<string>("all")

  const allTags = ["all", ...Array.from(new Set(projects.flatMap((p) => p.tags)))]

  const filteredProjects =
    filter === "all"
      ? projects
      : projects.filter((p) => p.tags.includes(filter))

  return (
    <section id="projects" className="relative min-h-screen py-20 overflow-hidden">
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
            Transforming ideas into production-ready applications that solve real problems
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
  )
}
