/**
 * All portfolio facts live here. Nothing in this file is invented for effect:
 * roles, dates and projects come from the existing portfolio; the research
 * entry is the published IEEE record.
 */

export const profile = {
  name: "Anjana Rodrigo",
  tagline: "Engineering Ideas Into Digital Reality.",
  roles: "Founder of MineBook | Software Engineer | Mining Engineer",
  intro:
    "I build intelligent software solutions that transform manual processes into streamlined digital platforms, combining engineering knowledge, software development, and emerging AI technologies.",
  email: "anjanarodrigoz@gmail.com",
  phone: "+94 76 980 9256",
  phoneRaw: "+94769809256",
  whatsapp: "https://wa.me/94769809256",
  linkedin: "https://linkedin.com/in/anjana-rodrigo-a41539191",
  github: "https://github.com/anjanarodrigoz",
}

export const minebook = {
  url: "https://minebook.lk/",
  line: "My digital mining operations and planning platform.",
  manages: ["Workforce", "Equipment", "Shifts", "Downtime", "Site onboarding", "Reporting", "Planning experiments"],
}

export type SoftwareProject = {
  id: string
  title: string
  meta: string
  line: string
  /** Real product screenshot. */
  image: string
  /** Width / height of the screenshot. */
  aspect: number
  device: "web" | "mobile"
  url?: string
}

export const software: SoftwareProject[] = [
  {
    id: "minebook",
    title: "MineBook",
    meta: "Founder | Mining Data Platform | 2024 - Present",
    line: "A connected operations platform for production, equipment, alerts and reporting.",
    image: "/assets/projects/minebook.webp",
    aspect: 1400 / 961,
    device: "web",
    url: "https://minebook.lk/",
  },
  {
    id: "fleet-dispatch",
    title: "Fleet Dispatch",
    meta: "Mining Systems | Software | 2023",
    line: "Live fleet allocation, route intelligence, and operational job coordination.",
    image: "/assets/projects/fleet-dispatch.webp",
    aspect: 1400 / 850,
    device: "web",
  },
  {
    id: "cycle-time",
    title: "Mining Cycle-Time",
    meta: "Analytics | Decision Support | 2023",
    line: "Cycle analysis that exposes delay where it happens and lifts equipment productivity.",
    image: "/assets/projects/cycle-time.webp",
    aspect: 1.5,
    device: "web",
  },
  {
    id: "crack-survey",
    title: "Crack Survey",
    meta: "Mobile | Construction Survey | 2024",
    line: "Documents cracks in neighbouring properties before construction begins, then compares their condition after. Photos, floor-plan locations and reports.",
    image: "/assets/projects/crack-survey.webp",
    aspect: 1.5,
    device: "mobile",
  },
  {
    id: "blast-pattern",
    title: "Blast Pattern Design",
    meta: "Mobile | Mining Design | 2024",
    line: "A field-ready tool for configuring blast-hole geometry, validating safety parameters, and exporting production patterns.",
    image: "/assets/projects/blast-pattern.webp",
    aspect: 1.5,
    device: "mobile",
  },
]

export const softwareStack = ["Flutter mobile apps", "React web apps", "Business systems", "Cloud applications", "Data platforms", "AI experiments"]

export type Role = {
  id: string
  role: string
  org: string
  period: string
  line: string
  place: "studio" | "university" | "office" | "mine" | "tower"
}

/** Oldest first, so the path through the experience world runs forward in time. */
export const experience: Role[] = [
  {
    id: "melbourne-mover",
    role: "Mobile Application Developer",
    org: "Melbourne Mover",
    period: "2020 - 2024",
    line: "Built customer and field workflows for transport booking, dispatch, and live job tracking.",
    place: "studio",
  },
  {
    id: "uom",
    role: "Team Leader, MIS Development",
    org: "University of Moratuwa",
    period: "2024 - Apr 2026",
    line: "Led practical information systems that improved university workflows and visibility.",
    place: "university",
  },
  {
    id: "idea8",
    role: "Software Engineering Consultant",
    org: "Idea8",
    period: "2024 - Apr 2026",
    line: "Designed reliable software products and translated operational needs into usable systems.",
    place: "office",
  },
  {
    id: "minebook",
    role: "Founder",
    org: "MineBook",
    period: "2024 - Present",
    line: "Founded and still building MineBook, connecting the pit, fleet, plant and office in one system.",
    place: "mine",
  },
  {
    id: "starloge",
    role: "Chief Technology Officer",
    org: "Starloge (Pvt) Ltd",
    period: "Apr 2026 - Present",
    line: "Leading technology, product engineering and the technical team.",
    place: "tower",
  },
]

export const research = {
  title: "Machine Learning-Based Prediction of Machine Hours and Fuel Consumption: A Case Study in Aruwakkalu Limestone Quarry, Sri Lanka",
  authors: ["R.K.H. Surangani", "H.S. Dawalagala", "S.S. Reval", "M.A.J. Rodrigo", "W.M.N.C. Wijerathnayake", "M.A.D.M.G. Wickrama", "W.N. Wedage"],
  me: "M.A.J. Rodrigo",
  venue: "2023 Moratuwa Engineering Research Conference (MERCon)",
  detail: "IEEE | 2023 | pp. 368-372",
  url: "https://ieeexplore.ieee.org/document/10355468",
  line: "Four machine learning models trained on three years of monthly quarry reports to predict machine hours and fuel use for dump trucks, excavators and dozers.",
  models: ["Decision Tree", "Linear Regression", "LGBM Regressor", "Random Forest"],
  equipment: ["Dump trucks", "Excavators", "Dozers"],
  targets: ["Machine hours", "Fuel consumption"],
}

export const about = {
  line: "Earth Resources Engineer from the University of Moratuwa. I started building software in 2020 and never stopped.",
  credentials: [
    "BScEng (Hons) Earth Resources Engineering | University of Moratuwa | 2018 - 2023",
    "IESL Associate Member | Since 2024",
    "Engineers Australia Associate Member | Since 2024",
  ],
}
