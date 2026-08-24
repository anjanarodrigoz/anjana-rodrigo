import {
  BarChart3,
  Boxes,
  Code2,
  Hammer,
  LineChart,
  Route,
  ScanSearch,
  UsersRound,
  Wrench,
  type LucideIcon,
} from "lucide-react"

export const nav = [
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Credentials", href: "#credentials" },
  { label: "Contact", href: "#contact" },
]

export const contact = {
  email: "anjanarodrigoz@gmail.com",
  linkedin: "https://linkedin.com/in/anjana-rodrigo-a41539191",
  github: "https://github.com/anjanarodrigoz",
}

export const capabilities: { index: string; title: string; copy: string; icon: LucideIcon }[] = [
  {
    index: "01",
    title: "Mining Engineering",
    copy: "Mine plans, infrastructure, and operational strategy grounded in field reality.",
    icon: Hammer,
  },
  {
    index: "02",
    title: "Software Development",
    copy: "Tools and data platforms that turn operational complexity into clarity.",
    icon: Code2,
  },
  {
    index: "03",
    title: "Data & Analytics",
    copy: "Measurement that surfaces the decision, not just the dashboard.",
    icon: BarChart3,
  },
]

export const projects = [
  {
    title: "MineBook",
    discipline: "Product Design · Data Platform",
    year: "2024",
    copy: "A connected operations platform for production, equipment, alerts, and reporting — one surface for the whole pit.",
    image: "/assets/projects/minebook.png",
    tone: "dark" as const,
    featured: true,
  },
  {
    title: "Fleet Dispatch",
    discipline: "Mining Systems · Software",
    year: "2023",
    copy: "Live fleet allocation, route intelligence, and operational job coordination.",
    image: "/assets/projects/fleet-dispatch.png",
    tone: "light" as const,
    featured: false,
  },
  {
    title: "Mining Cycle‑Time",
    discipline: "Analytics · Decision Support",
    year: "2023",
    copy: "Cycle analysis that exposes delay where it happens and lifts equipment productivity.",
    image: "/assets/projects/cycle-time.png",
    tone: "light" as const,
    featured: false,
  },
  {
    title: "Crack Survey",
    discipline: "Mobile · Field Engineering",
    year: "2024",
    copy: "A mobile inspection workflow for capturing, measuring, classifying, and synchronising structural crack records in the field.",
    image: "/assets/projects/crack-survey.png",
    tone: "light" as const,
    featured: false,
  },
  {
    title: "Blast Pattern Design",
    discipline: "Mobile · Mining Design",
    year: "2024",
    copy: "A field-ready design tool for configuring blast-hole geometry, validating safety parameters, and exporting production patterns.",
    image: "/assets/projects/blast-pattern.png",
    tone: "light" as const,
    featured: false,
  },
]

export const roles = [
  {
    role: "Team Leader, MIS Development",
    org: "University of Moratuwa",
    period: "2024 — Present",
    copy: "Leading practical information systems that improve university workflows and visibility.",
    current: true,
  },
  {
    role: "Software Engineering Consultant",
    org: "Idea8",
    period: "2024 — Present",
    copy: "Designing reliable software products and translating operational needs into usable systems.",
    current: true,
  },
  {
    role: "Mobile Application Developer",
    org: "Melbourne Mover",
    period: "2020 — 2024",
    copy: "Built customer and field workflows for transport booking, dispatch, and live job tracking.",
    current: false,
  },
]

export const expertise: { label: string; icon: LucideIcon }[] = [
  { label: "Mine Planning", icon: Hammer },
  { label: "Fleet Systems", icon: Route },
  { label: "Web Applications", icon: Code2 },
  { label: "Data Visualisation", icon: BarChart3 },
  { label: "Process Improvement", icon: Wrench },
  { label: "Technical Leadership", icon: UsersRound },
]

export const process: { index: string; title: string; copy: string; icon: LucideIcon }[] = [
  { index: "01", title: "Discover", copy: "Understand the operational challenge and define clear objectives.", icon: ScanSearch },
  { index: "02", title: "Model", copy: "Map the data, workflows, constraints, and practical solution path.", icon: Boxes },
  { index: "03", title: "Build", copy: "Develop intuitive tools with the people who will actually use them.", icon: Code2 },
  { index: "04", title: "Improve", copy: "Measure performance, learn continuously, and improve the system.", icon: LineChart },
]

const MoratuwaIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 3L2 8l10 5 10-5-10-5z" fill="currentColor" />
    <path d="M6 12v3.5c0 1.5 2.5 2.5 6 2.5s6-1 6-2.5V12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M17 9.5v5.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".55" />
    <circle cx="17" cy="15.5" r="1.1" fill="currentColor" opacity=".55" />
  </svg>
)

const IEEEIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="16" y2="17" />
  </svg>
)

const IESLIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 10l-3 2 3 2" />
    <path d="M15 10l3 2-3 2" />
  </svg>
)

const EAIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9.4 15l2.6-6.4L14.6 15" />
    <path d="M10.4 12.8h3.2" />
  </svg>
)

export const credentials = [
  {
    institution: "University of Moratuwa",
    detail: "BScEng (Hons), Earth Resources Engineering",
    period: "2018 — 2023",
    icon: MoratuwaIcon,
    accent: "accent-blue",
  },
  {
    institution: "IEEE Published Research",
    detail: "Machine Hours & Fuel Consumption",
    period: "2023",
    icon: IEEEIcon,
    accent: "accent-violet",
  },
  {
    institution: "IESL Associate Member",
    detail: "Institution of Engineers Sri Lanka",
    period: "Since 2024",
    icon: IESLIcon,
    accent: "accent-teal",
  },
  {
    institution: "Engineers Australia",
    detail: "Associate Member",
    period: "Since 2024",
    icon: EAIcon,
    accent: "accent-amber",
  },
]
