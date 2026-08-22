export type Service = {
  title: string
  description: string
  icon: string
}

export type ProjectCategory = "Mining" | "Other Product Work"

export type ProjectVisualKey =
  | "minebook"
  | "fleet-dispatch"
  | "cycle-time"
  | "melbourne-mover"
  | "restaurant-optimization"

export type Project = {
  slug: string
  title: string
  category: ProjectCategory
  description: string
  technologies: string[]
  visual: ProjectVisualKey
  longDescription: string
  features: string[]
}

export type Experience = {
  organization: string
  role: string
  period: string
}

export type Credential = {
  title: string
  subtitle: string
  period: string
  icon: string
}

export type ToolkitItem = {
  name: string
  icon: string
}

export const siteConfig = {
  name: "Anjana Rodrigo",
  title: "Anjana Rodrigo | Mining Digitalization & Software Engineering",
  description:
    "Portfolio of Anjana Rodrigo, a mining engineer applying software engineering to digitalize and process-optimize mining and real-world operations.",
  eyebrow: "MINING DIGITALIZATION · SOFTWARE ENGINEERING",
  positioning: "Mining Digitalization · Software Engineering",
  tagline:
    "I'm a mining engineer applying software engineering to digitalize and optimize processes across mining and real-world operations.",
  url: "https://anjanarodrigo.com",
  email: "anjanarodrigoz@gmail.com",
  phone: "+94 769 809 256",
  location: "Sri Lanka",
  linkedin: "https://linkedin.com/in/anjana-rodrigo-a41539191",
  github: "https://github.com/anjanarodrigoz",
}

export const navLinks = [
  { name: "Home", href: "#home" },
  { name: "Work", href: "#work" },
  { name: "About", href: "#about" },
  { name: "Experience", href: "#experience" },
  { name: "Contact", href: "#contact" },
]

export const services: Service[] = [
  {
    title: "Mining Operations Digitalization",
    description:
      "End-to-end digital solutions for production, equipment, maintenance and compliance.",
    icon: "/assets/icons/sections/mining-operations.svg",
  },
  {
    title: "Field & Mobile Systems",
    description:
      "Rugged mobile apps for field teams, inspections, data capture and offline-first workflows.",
    icon: "/assets/icons/sections/field-mobile.svg",
  },
  {
    title: "Operational Data Platforms",
    description:
      "Scalable platforms that turn operational data into actionable insights and performance.",
    icon: "/assets/icons/sections/operational-data.svg",
  },
]

export const projects: Project[] = [
  {
    slug: "minebook",
    title: "MineBook",
    category: "Mining",
    description:
      "Comprehensive mining operations platform covering production, equipment, alerts and reporting.",
    technologies: ["Flutter", "Dart", "Node.js", "Firebase"],
    visual: "minebook",
    longDescription: "MineBook is a robust, production-ready mining operations platform designed to digitize field workflows, track heavy equipment, and report live progress from open-pit mining environments. Built for rugged field tablets, it ensures mining teams can report production shifts, logs, and safety checks in offline-first scenarios.",
    features: [
      "Real-time production KPIs and daily tonnage reporting.",
      "Equipment utilization tracking with visual utilization widgets.",
      "Live safety/equipment alerts with notifications for critical delays.",
      "Offline-first sync supporting remote mining sites without cellular signals.",
      "Detailed shifting and haulage reports downloadable in CSV format."
    ],
  },
  {
    slug: "fleet-dispatch",
    title: "Fleet Dispatch",
    category: "Mining",
    description:
      "Real-time fleet allocation and tracking with route optimization and job management.",
    technologies: ["React", "TypeScript", "Node.js", "GIS"],
    visual: "fleet-dispatch",
    longDescription: "Fleet Dispatch is a real-time fleet coordination system that utilizes interactive GIS mapping to allocate heavy mining machinery and track truck movements across multiple pits. The application features route optimization algorithms that minimize queuing delays and congestion, boosting daily output.",
    features: [
      "Dynamic GIS-based open-pit topographic map plotting.",
      "Automated truck allocation recommendations with one-click approval.",
      "Live status reporting for shovels, excavators, and dump yards.",
      "Color-coded congestion alerts for specific routes and junctions.",
      "Real-time queue time estimates and turn-around analytics."
    ],
  },
  {
    slug: "mining-cycle-time",
    title: "Mining Cycle-Time App",
    category: "Mining",
    description:
      "Measure and analyze cycle times across the fleet to improve productivity and reduce delays.",
    technologies: ["Flutter", "Dart", "Firebase", "Charts"],
    visual: "cycle-time",
    longDescription: "This cycle-time tracking application enables operators and mining engineers to measure the load, haul, dump, and return segments of truck cycles. By uncovering operational delays, it provides clear visibility into bottlenecks at shovels or crusher queues.",
    features: [
      "Stopwatch-style segment timer for easy operational tracking.",
      "Automatic circular breakdown charts of loading, hauling, dumping, and returning ratios.",
      "Delay code logging (e.g., road maintenance, traffic, queue times).",
      "Historical trend analysis across different trucks and operators.",
      "Cloud database synchronization for live analysis by office teams."
    ],
  },
  {
    slug: "melbourne-mover",
    title: "Melbourne Mover",
    category: "Other Product Work",
    description:
      "Transport and moving-services application connecting customers with movers, covering booking, live job tracking and dispatch.",
    technologies: ["Flutter", "Dart", "Firebase", "Node.js"],
    visual: "melbourne-mover",
    longDescription: "Melbourne Mover is a customer-facing logistics and transport application that streamlines moving jobs. It includes booking flow, live tracking of the dispatch truck, and transparent pricing structures based on items and distance.",
    features: [
      "Interactive map tracking for current moving job progress.",
      "Pricing calculator based on truck sizes (Van, Medium, Large) and distance.",
      "Mover profile system featuring reviews, ratings, and vehicle capacities.",
      "Real-time messaging and quick-call triggers between customers and drivers.",
      "Automated PDF invoice generation and job history logs."
    ],
  },
  {
    slug: "restaurant-process-optimization",
    title: "Restaurant Process Optimization",
    category: "Other Product Work",
    description:
      "Process-optimized solution streamlining order flow, kitchen operations and service timing for restaurant operations.",
    technologies: ["React", "TypeScript", "Node.js", "Firebase"],
    visual: "restaurant-optimization",
    longDescription: "Optima Kitchen is a process optimization platform built to streamline the workflow in high-volume restaurants. Acting as a digital kitchen display system (KDS), it replaces paper tickets, tracks prep timers, and analyzes station efficiency.",
    features: [
      "Interactive kitchen display board with status lanes (Prepping, Cooking, Plated).",
      "Color-coded warning timers for orders exceeding target preparation limits.",
      "Prep station assignments and task queue management for kitchen staff.",
      "Live business intelligence dashboard visualizing peak busy hours and ticket trends.",
      "Firebase real-time sync for zero-latency updates across terminal screens."
    ],
  },
]

export const aboutPillars = [
  {
    title: "Mining Knowledge",
    description: "Understanding operations on the ground and industry workflows.",
    icon: "/assets/icons/sections/mining-knowledge.svg",
  },
  {
    title: "Software Engineering",
    description: "Building maintainable, scalable and reliable software solutions.",
    icon: "/assets/icons/sections/software-engineering.svg",
  },
  {
    title: "Operational Data",
    description: "Integrating mobile apps, platforms and data for better decisions.",
    icon: "/assets/icons/sections/connected-systems.svg",
  },
]

export const experience: Experience[] = [
  {
    organization: "University of Moratuwa",
    role: "Team Leader, MIS Development",
    period: "2024–Present",
  },
  {
    organization: "Idea8",
    role: "Software Engineering Consultant",
    period: "2024–Present",
  },
  {
    organization: "Melbourne Mover",
    role: "Mobile Application Developer",
    period: "2020–2024",
  },
  {
    organization: "Zomoto",
    role: "Mobile Application Developer",
    period: "2022–2023",
  },
]

export const credentials: Credential[] = [
  {
    title: "University of Moratuwa",
    subtitle: "BScEng (Hons), Earth Resources Engineering",
    period: "2018–2023",
    icon: "/assets/icons/credentials/university.svg",
  },
  {
    title: "IEEE Published Research",
    subtitle: "Machine Hours & Fuel Consumption",
    period: "2023",
    icon: "/assets/icons/credentials/research.svg",
  },
  {
    title: "IESL Associate Member",
    subtitle: "Institution of Engineers Sri Lanka",
    period: "Since 2024",
    icon: "/assets/icons/credentials/iesl-member.svg",
  },
  {
    title: "Engineers Australia Associate Member",
    subtitle: "Engineers Australia",
    period: "Since 2024",
    icon: "/assets/icons/credentials/engineers-australia.svg",
  },
]

export const toolkit: ToolkitItem[] = [
  { name: "Flutter", icon: "/assets/icons/toolkit/flutter.svg" },
  { name: "React", icon: "/assets/icons/toolkit/react.svg" },
  { name: "TypeScript", icon: "/assets/icons/toolkit/typescript.svg" },
  { name: "Node.js", icon: "/assets/icons/toolkit/nodejs.svg" },
  { name: "Python", icon: "/assets/icons/toolkit/python.svg" },
  { name: "Firebase", icon: "/assets/icons/toolkit/firebase.svg" },
  { name: "Docker", icon: "/assets/icons/toolkit/docker.svg" },
  { name: "GIS", icon: "/assets/icons/toolkit/gis.svg" },
  { name: "Power BI", icon: "/assets/icons/toolkit/power-bi.svg" },
]
