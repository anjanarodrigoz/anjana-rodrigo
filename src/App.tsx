import { AboutPage } from "@/pages/AboutPage"
import { ProjectPage } from "@/pages/ProjectPage"
import { TourPage } from "@/pages/TourPage"
import { useRoute } from "@/router"

export default function App() {
  const route = useRoute()
  if (route.name === "project") return <ProjectPage key={route.id} id={route.id} />
  if (route.name === "about") return <AboutPage />
  return <TourPage stage={route.stage} />
}
