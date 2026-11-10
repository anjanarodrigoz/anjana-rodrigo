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
  device: "web" | "mobile"
  /** Who uses it. */
  who: string
  /** What it does, as short plain points. */
  does: string[]
  url?: string
}

export const software: SoftwareProject[] = [
  {
    id: "minebook",
    who: "Mine managers and site supervisors",
    does: ["Keeps workforce, shifts and equipment in one place", "Records downtime and why it happened", "Turns the shift log into daily reports and plans"],
    action: "Select it to change shift",
    title: "MineBook",
    meta: "Founder | Mining Data Platform | 2024 - Present",
    line: "A connected operations platform for production, equipment, alerts and reporting.",
    device: "web",
    url: "https://minebook.lk/",
  },
  {
    id: "fleet-dispatch",
    who: "Dispatchers running the haul fleet",
    does: ["Assigns trucks to shovels and dump points", "Shows routes and truck status live", "Coordinates jobs across the shift"],
    action: "Select it to rebalance the fleet",
    title: "Fleet Dispatch",
    meta: "Mining Systems | Software | 2023",
    line: "Live fleet allocation, route intelligence, and operational job coordination.",
    device: "web",
  },
  {
    id: "cycle-time",
    who: "Production engineers",
    does: ["Splits each haul cycle into load, haul, dump and return", "Shows where time is lost to queuing and delays", "Points to the change that lifts productivity most"],
    action: "Select it to step through the cycle",
    title: "Mining Cycle-Time",
    meta: "Analytics | Decision Support | 2023",
    line: "Cycle analysis that exposes delay where it happens and lifts equipment productivity.",
    device: "web",
  },
  {
    id: "crack-survey",
    who: "Surveyors and builders",
    does: ["Photographs cracks in neighbouring buildings before work starts", "Marks each crack on the floor plan", "Compares before and after, and produces the report"],
    action: "Select it to compare before and after",
    title: "Crack Survey",
    meta: "Mobile | Construction Survey | 2024",
    line: "Documents cracks in neighbouring properties before construction begins, then compares their condition after. Photos, floor-plan locations and reports.",
    device: "mobile",
  },
  {
    id: "blast-pattern",
    who: "Drill and blast engineers",
    does: ["Sets burden, spacing and hole geometry", "Checks the design against safety parameters", "Exports the pattern for production"],
    action: "Select it to fire the pattern",
    title: "Blast Pattern Design",
    meta: "Mobile | Mining Design | 2024",
    line: "A field-ready tool for configuring blast-hole geometry, validating safety parameters, and exporting production patterns.",
    device: "mobile",
  },
  {
    id: "melbourne-mover",
    who: "Customers and drivers of a moving company",
    does: ["Customers book a move from their phone", "Jobs are dispatched to drivers", "Everyone tracks the job live"],
    action: "Select it to dispatch a job",
    title: "Melbourne Mover",
    meta: "Mobile Application | Transport | 2020 - 2024",
    line: "Customer and field workflows for transport booking, dispatch, and live job tracking.",
    device: "mobile",
  },
  {
    id: "restaurant",
    who: "Restaurant owners, managers and staff",
    does: ["Keeps menu, order, table and stock records in one place", "Stores sales data for daily and monthly reports", "Gives owners a clear view of the numbers behind the business"],
    action: "Select it to send an order",
    title: "Restaurant Management App",
    meta: "Business Management | Data Management",
    line: "A restaurant management app built around data management: the records a restaurant runs on, kept in one system.",
    device: "mobile",
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
