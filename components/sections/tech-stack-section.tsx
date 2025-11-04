"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  Code2,
  Database,
  Cloud,
  Smartphone,
  Cpu,
  Globe,
  Layers,
  Terminal,
} from "lucide-react";

interface Technology {
  name: string;
  icon: React.ReactNode;
  items: string[];
  color: string;
}

const technologies: Technology[] = [
  {
    name: "Frontend",
    icon: <Globe className="h-6 w-6" />,
    items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
    color: "emerald",
  },
  {
    name: "Backend",
    icon: <Terminal className="h-6 w-6" />,
    items: ["Node.js", "Express", "Python", "Spring Boot"],
    color: "amber",
  },
  {
    name: "Database",
    icon: <Database className="h-6 w-6" />,
    items: ["PostgreSQL", "MongoDB", "MySQL", "Firebase"],
    color: "coral",
  },
  {
    name: "Cloud & DevOps",
    icon: <Cloud className="h-6 w-6" />,
    items: ["AWS", "Docker", "Kubernetes", "CI/CD", "GitHub Actions"],
    color: "purple",
  },
  {
    name: "Mobile",
    icon: <Smartphone className="h-6 w-6" />,
    items: ["Flutter", "iOS", "Android"],
    color: "emerald",
  },
  {
    name: "AI & ML",
    icon: <Cpu className="h-6 w-6" />,
    items: ["TensorFlow", "PyTorch", "OpenAI", "Scikit-learn"],
    color: "amber",
  },
  {
    name: "Architecture",
    icon: <Layers className="h-6 w-6" />,
    items: [
      "Microservices",
      "REST API",
      "GraphQL",
      "WebSockets",
      "gRPC",
      "BloC",
      "Clean Architecture",
    ],
    color: "coral",
  },
  {
    name: "Tools & Others",
    icon: <Code2 className="h-6 w-6" />,
    items: [
      "Git",
      "VS Code",
      "Postman",
      "Figma",
      "Jira",
      "Claude Code",
      "Cursor",
    ],
    color: "purple",
  },
];

export function TechStackSection() {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <section
      id="tech-stack"
      ref={ref}
      className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* Background Aurora */}
      <div className="absolute inset-0 aurora-bg opacity-10 dark:opacity-20" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4 gradient-text">
            Technology Stack
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A comprehensive toolkit for building innovative solutions across the
            full stack
          </p>
        </motion.div>

        {/* Technology Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {technologies.map((tech, index) => (
            <motion.div
              key={tech.name}
              variants={item}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald/20 via-amber/20 to-coral/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative glass rounded-xl p-6 border border-border/50 hover:border-emerald/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald/20 h-full">
                {/* Icon Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`p-2 rounded-lg bg-${tech.color}/10 text-${tech.color}`}
                  >
                    {tech.icon}
                  </div>
                  <h3 className="text-lg font-semibold">{tech.name}</h3>
                </div>

                {/* Technology Items */}
                <ul className="space-y-2">
                  {tech.items.map((item, itemIndex) => (
                    <motion.li
                      key={item}
                      initial={{ opacity: 0, x: -10 }}
                      animate={inView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: index * 0.1 + itemIndex * 0.05 }}
                      className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors"
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full bg-${tech.color}`}
                      />
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            { label: "Years Experience", value: "5+" },
            { label: "Technologies", value: "40+" },
            { label: "Projects Delivered", value: "50+" },
            { label: "Happy Clients", value: "30+" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="text-center glass rounded-xl p-6 border border-border/50 hover:border-emerald/50 transition-all"
            >
              <div className="text-3xl font-bold gradient-text mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
