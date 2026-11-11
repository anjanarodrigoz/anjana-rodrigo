/**
 * All portfolio facts live here. Nothing in this file is invented for effect:
 * roles, dates and projects come from the existing portfolio; the research
 * entry is the published IEEE record.
 */

export const profile = {
  name: "Anjana Rodrigo",
  tagline: "Engineering Ideas Into Digital Reality.",
  roles: "Founder of MineBook | CTO @ Starloge | Mining Engineer",
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
  /** What happens when you select its 3D exhibit. */
  action: string
  device: "web" | "mobile" | "desktop"
  /** Who uses it. */
  who: string
  /** What it does, as short plain points. */
  does: string[]
  url?: string
}

export const software: SoftwareProject[] = [
  {
    id: "melbourne-mover",
    action: "Select it to skip to the next step of a job",
    title: "Melbourne Mover",
    meta: "Native Android | Firebase | MVVM | GetX",
    line: "The first Android apps I built: two native apps where a moving company takes bookings, assigns drivers and tracks every job. 2020 - 2024.",
    device: "mobile",
    who: "The Melbourne Mover office and its drivers",
    does: [
      "The company takes and manages bookings",
      "A driver is assigned and gets the job by SMS",
      "Drivers see job details, start the job and add its data in their app",
      "The company tracks driver locations and job times",
      "Job times feed driver salaries",
      "Customers get an email with their invoice when the job is done",
    ],
  },
  {
    id: "restaurant",
    action: "Select it to send an order",
    title: "Restaurant Management App",
    meta: "Flutter | Live in Sri Lanka",
    line: "A big milestone: migrated to Flutter, and now up and running in several restaurants in Sri Lanka.",
    device: "mobile",
    who: "Restaurant owners, managers and staff",
    does: ["Migrated to Flutter", "Running in several restaurants in Sri Lanka right now", "Started as a build for Zomato, now my own product", "Manages the restaurant's data in one system"],
  },
  {
    id: "cycle-time",
    action: "Select it to skip to the next stage of the haul cycle",
    title: "Cycle Time Tracking",
    meta: "Mobile App | INSEE",
    line: "A mobile app for tracking equipment cycle time, built for INSEE.",
    device: "mobile",
    who: "Site teams at INSEE",
    does: ["Records each stage of the haul cycle", "Shows where time is lost to queuing and delays"],
  },
  {
    id: "mis",
    action: "Select it to switch module",
    title: "University MIS",
    meta: "React | Redux | React Query",
    line: "My first web application: a large-scale Management Information System for the University of Moratuwa.",
    device: "web",
    who: "University staff and students",
    does: ["Built with React, Redux and React Query", "Large-scale system used across the university", "Led as team leader and lead developer"],
  },
  {
    id: "minebook",
    action: "Select it to change shift",
    title: "MineBook",
    meta: "Founder | Mining Data Platform | 2024 - Present",
    line: "A connected operations platform for production, equipment, alerts and reporting.",
    device: "web",
    who: "Mine managers and site supervisors",
    does: ["Keeps workforce, shifts and equipment in one place", "Records downtime and why it happened", "Turns the shift log into daily reports and plans"],
    url: "https://minebook.lk/",
  },
  {
    id: "fleet-dispatch",
    action: "Select it to rebalance the fleet",
    title: "Fleet Dispatch",
    meta: "Mining Systems | 2023",
    line: "Live fleet allocation, route intelligence, and operational job coordination.",
    device: "web",
    who: "Dispatchers running the haul fleet",
    does: ["Assigns trucks to shovels and dump points", "Shows routes and truck status live", "Coordinates jobs across the shift"],
  },
  {
    id: "blast-pattern",
    action: "Select it to fire the pattern",
    title: "Blast Pattern Design",
    meta: "Mobile | Mining Design | 2024",
    line: "A field-ready tool for configuring blast-hole geometry, validating safety parameters, and exporting production patterns.",
    device: "mobile",
    who: "Drill and blast engineers",
    does: ["Sets burden, spacing and hole geometry", "Checks the design against safety parameters", "Exports the pattern for production"],
  },
  {
    id: "acorn-travel",
    action: "Select it to send the plane on a new trip",
    title: "Acorn Travel",
    meta: "Mobile Application",
    line: "A mobile application for Acorn Travel.",
    device: "mobile",
    who: "Travellers",
    does: [],
  },
  {
    id: "pos",
    action: "Select it to ring up a sale",
    title: "Desktop POS",
    meta: "Flutter Desktop",
    line: "A point-of-sale app for desktop, built with Flutter.",
    device: "desktop",
    who: "Shops and counters",
    does: ["Runs as a desktop application", "Built with Flutter"],
  },
  {
    id: "chinabridge",
    action: "Select it to send a delivery across",
    title: "ChinaBridge",
    meta: "Web | chinabridge.lk",
    line: "The chinabridge.lk website.",
    device: "web",
    who: "Visitors to chinabridge.lk",
    does: [],
    url: "https://chinabridge.lk/",
  },
  {
    id: "local-apps",
    action: "Select it to switch between the apps",
    title: "Local Business Apps",
    meta: "Experiments",
    line: "Experiments in apps for local businesses.",
    device: "mobile",
    who: "Local businesses",
    does: ["Laundry", "Salon", "School management system", "Clinic app"],
  },
]

/** Software technology stack. */
export const softwareStack = ["AWS", "Docker", "Flutter", "React", "Android", "iOS", "Firebase", "SQL databases", "NoSQL databases", "Data lake experiments"]

export type Role = {
  id: string
  role: string
  org: string
  period: string
  line: string
  /** Specific things done in the role, shown as short points. */
  points?: string[]
  place: "studio" | "tunnel" | "university" | "office" | "mine" | "tower"
}

/** Oldest first, so the path through the experience world runs forward in time. */
export const experience: Role[] = [
  {
    id: "melbourne-mover",
    role: "Mobile Application Developer",
    org: "Melbourne Mover",
    period: "2020 - 2024",
    line: "Built the booking system and driver app: job assignment by SMS, live driver tracking, salaries, and emailed invoices.",
    place: "studio",
  },
  {
    id: "cscec",
    role: "Trainee Mining Engineer",
    org: "China State Construction (CSCEC) | MWSIP",
    period: "Feb - Aug 2022",
    line: "Six-month internship on the canal projects of the Mahaweli Water Security Investment Program.",
    points: [
      "Worked on the North Western Province Canal Project (NWPCP) and the North Central Province (NCP) canal project",
      "Tunnel construction with a tunnel boring machine (TBM)",
      "Setting-out surveys",
      "Canal construction",
    ],
    place: "tunnel",
  },
  {
    id: "uom",
    role: "Team Leader, Lead Developer and Teaching Assistant",
    org: "University of Moratuwa",
    period: "2024 - Apr 2026",
    line: "Led the team and the development of a large-scale Management Information System for the university, and taught as a teaching assistant.",
    points: [
      "Team leader and lead developer of the university's large-scale MIS",
      "Taught Fundamentals of Programming",
      "Taught Object-Oriented Programming",
      "Taught Object-Oriented Analysis and Design",
      "Taught Database Management",
    ],
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
    line: "Designing, developing and adding features to business digitalisation products.",
    points: [
      "Laundry management",
      "Salon management",
      "School management",
      "Physiotherapy clinics",
      "Ayurveda clinics",
      "Many other B2B products",
    ],
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
  /** How the study was done, one step per exhibit in the lab. */
  steps: [
    { id: "question", title: "The question", line: "Machine hours drive production, cost and efficiency in a mine. Can they, and the fuel they burn, be predicted ahead of time?" },
    { id: "data", title: "The data", line: "Monthly reports from Aruwakkalu Limestone Quarry, covering three years of operation. Thirty-six months of records became the training set." },
    { id: "equipment", title: "The equipment", line: "Three kinds of machine were studied separately, because each works differently: dump trucks, excavators and dozers." },
    { id: "models", title: "The models", line: "Four machine learning models were trained and compared: Decision Tree, Linear Regression, LGBM Regressor and Random Forest." },
    { id: "predictions", title: "The predictions", line: "Each model predicted two things for each machine type: machine hours and fuel consumption. The best model was picked per machine." },
    { id: "paper", title: "The paper", line: "Published by IEEE at the 2023 Moratuwa Engineering Research Conference (MERCon), pages 368-372." },
  ],
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
