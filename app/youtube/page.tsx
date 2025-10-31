"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { Youtube, Play, Eye, ThumbsUp, Calendar, Search, Filter } from "lucide-react"

interface Video {
  id: string
  title: string
  description: string
  thumbnail: string
  videoId: string
  views: string
  likes: string
  publishedAt: string
  duration: string
  category: string
}

const allVideos: Video[] = [
  {
    id: "1",
    title: "Building a Full-Stack App with Next.js 15 & TypeScript",
    description: "Learn how to build a modern full-stack application using Next.js 15, TypeScript, and Tailwind CSS. We'll cover server components, API routes, database integration, authentication, and deployment best practices.",
    thumbnail: "/youtube/thumb1.jpg",
    videoId: "dQw4w9WgXcQ",
    views: "25K",
    likes: "1.2K",
    publishedAt: "2024-01-15",
    duration: "24:15",
    category: "Tutorial",
  },
  {
    id: "2",
    title: "React Performance Optimization Tips",
    description: "Discover advanced techniques to optimize your React applications for better performance and user experience. Learn about memoization, code splitting, lazy loading, and profiling.",
    thumbnail: "/youtube/thumb2.jpg",
    videoId: "dQw4w9WgXcQ",
    views: "18K",
    likes: "890",
    publishedAt: "2024-01-10",
    duration: "18:30",
    category: "Tutorial",
  },
  {
    id: "3",
    title: "From Mining Engineer to Software Developer - My Journey",
    description: "My personal story of transitioning from mining engineering to software development, including challenges, lessons learned, and practical advice for career changers in tech.",
    thumbnail: "/youtube/thumb3.jpg",
    videoId: "dQw4w9WgXcQ",
    views: "42K",
    likes: "2.8K",
    publishedAt: "2024-01-05",
    duration: "32:45",
    category: "Career",
  },
  {
    id: "4",
    title: "AI-Powered Apps with LangChain & OpenAI",
    description: "Build intelligent applications using LangChain and OpenAI APIs. We'll create a chatbot with memory, context awareness, and document retrieval capabilities.",
    thumbnail: "/youtube/thumb4.jpg",
    videoId: "dQw4w9WgXcQ",
    views: "35K",
    likes: "1.9K",
    publishedAt: "2023-12-28",
    duration: "28:20",
    category: "AI/ML",
  },
  {
    id: "5",
    title: "Framer Motion Tutorial - Animations Made Easy",
    description: "Master Framer Motion to create stunning animations in your React applications. From basics to advanced techniques including gestures and layout animations.",
    thumbnail: "/youtube/thumb5.jpg",
    videoId: "dQw4w9WgXcQ",
    views: "22K",
    likes: "1.1K",
    publishedAt: "2023-12-20",
    duration: "20:15",
    category: "Tutorial",
  },
  {
    id: "6",
    title: "Flutter Best Practices for Production Apps",
    description: "Essential best practices for building production-ready Flutter applications, including state management, architecture patterns, testing, and CI/CD.",
    thumbnail: "/youtube/thumb6.jpg",
    videoId: "dQw4w9WgXcQ",
    views: "30K",
    likes: "1.6K",
    publishedAt: "2023-12-15",
    duration: "26:40",
    category: "Mobile",
  },
  {
    id: "7",
    title: "Docker & Kubernetes for Developers",
    description: "Complete guide to containerization with Docker and orchestration with Kubernetes. Learn how to deploy and scale your applications in production.",
    thumbnail: "/youtube/thumb7.jpg",
    videoId: "dQw4w9WgXcQ",
    views: "28K",
    likes: "1.4K",
    publishedAt: "2023-12-10",
    duration: "35:20",
    category: "DevOps",
  },
  {
    id: "8",
    title: "Building RESTful APIs with Node.js & Express",
    description: "Create robust and scalable RESTful APIs using Node.js and Express. Covers authentication, validation, error handling, and database integration.",
    thumbnail: "/youtube/thumb8.jpg",
    videoId: "dQw4w9WgXcQ",
    views: "20K",
    likes: "950",
    publishedAt: "2023-12-05",
    duration: "22:45",
    category: "Backend",
  },
  {
    id: "9",
    title: "Database Design Best Practices",
    description: "Learn how to design efficient and scalable databases. Covers normalization, indexing, query optimization, and choosing the right database for your needs.",
    thumbnail: "/youtube/thumb9.jpg",
    videoId: "dQw4w9WgXcQ",
    views: "16K",
    likes: "780",
    publishedAt: "2023-11-28",
    duration: "19:30",
    category: "Backend",
  },
  {
    id: "10",
    title: "System Design Interview Preparation",
    description: "Comprehensive guide to system design interviews. Learn how to design scalable systems, handle trade-offs, and communicate your solutions effectively.",
    thumbnail: "/youtube/thumb10.jpg",
    videoId: "dQw4w9WgXcQ",
    views: "45K",
    likes: "3.2K",
    publishedAt: "2023-11-20",
    duration: "42:10",
    category: "Career",
  },
  {
    id: "11",
    title: "Machine Learning for Beginners",
    description: "Introduction to machine learning concepts and practical implementation. Learn about supervised learning, neural networks, and model training.",
    thumbnail: "/youtube/thumb11.jpg",
    videoId: "dQw4w9WgXcQ",
    views: "38K",
    likes: "2.1K",
    publishedAt: "2023-11-15",
    duration: "29:50",
    category: "AI/ML",
  },
  {
    id: "12",
    title: "Git & GitHub Mastery",
    description: "Master Git version control and GitHub workflows. Learn branching strategies, pull requests, code reviews, and collaboration best practices.",
    thumbnail: "/youtube/thumb12.jpg",
    videoId: "dQw4w9WgXcQ",
    views: "24K",
    likes: "1.3K",
    publishedAt: "2023-11-10",
    duration: "21:15",
    category: "Tutorial",
  },
]

export default function YouTubePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null)

  const categories = ["All", ...Array.from(new Set(allVideos.map((v) => v.category)))]

  const filteredVideos = allVideos.filter((video) => {
    const matchesSearch =
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      selectedCategory === "All" || video.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <Youtube className="w-12 h-12 text-red-600" />
            <h1 className="text-4xl sm:text-5xl font-bold gradient-text">
              YouTube Videos
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Explore tutorials, insights, and my journey in software development
          </p>
          <a
            href="https://youtube.com/@anjanarodrigo"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full transition-all shadow-lg hover:shadow-xl hover:shadow-red-600/50"
          >
            <Youtube className="w-5 h-5" />
            Subscribe to Channel
          </a>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8 space-y-4"
        >
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 glass rounded-full border border-border focus:border-emerald focus:outline-none transition-colors"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <Filter className="w-4 h-4 text-muted-foreground" />
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                    : "glass hover:bg-accent border border-border"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-6 text-center text-muted-foreground"
        >
          Showing {filteredVideos.length} video{filteredVideos.length !== 1 ? "s" : ""}
        </motion.div>

        {/* Videos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
              className="group relative"
              onMouseEnter={() => setHoveredVideo(video.id)}
              onMouseLeave={() => setHoveredVideo(null)}
            >
              <a
                href={`https://youtube.com/watch?v=${video.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                {/* Video Card */}
                <div className="glass rounded-xl overflow-hidden border border-border/50 hover:border-red-600/50 dark:hover:border-red-600 transition-all duration-300 hover:shadow-lg hover:shadow-red-600/20 h-full flex flex-col">
                  {/* Thumbnail */}
                  <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-red-500/20 via-amber-500/20 to-emerald-500/20">
                    {/* Placeholder gradient animation */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-red-500 via-amber-500 to-emerald-500 opacity-30"
                      animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, 0],
                      }}
                      transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/60 transition-colors">
                      <motion.div
                        className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-2xl"
                        whileHover={{ scale: 1.1 }}
                        animate={
                          hoveredVideo === video.id
                            ? { scale: [1, 1.1, 1] }
                            : { scale: 1 }
                        }
                        transition={{
                          duration: 0.8,
                          repeat: hoveredVideo === video.id ? Infinity : 0,
                        }}
                      >
                        <Play className="w-8 h-8 text-white ml-1" fill="white" />
                      </motion.div>
                    </div>

                    {/* Duration Badge */}
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-white text-xs font-semibold rounded">
                      {video.duration}
                    </div>

                    {/* Category Badge */}
                    <div className="absolute top-2 left-2 px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded">
                      {video.category}
                    </div>
                  </div>

                  {/* Video Info */}
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors">
                      {video.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-3 flex-1">
                      {video.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{video.views}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" />
                        <span>{video.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(video.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </a>
            </motion.div>
          ))}
        </div>

        {/* No Results */}
        {filteredVideos.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center py-20"
          >
            <Youtube className="w-20 h-20 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No videos found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
