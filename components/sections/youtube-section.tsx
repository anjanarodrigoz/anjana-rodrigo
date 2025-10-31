"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { Youtube, Play, Eye, ThumbsUp, Calendar } from "lucide-react"
import { useState } from "react"

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
}

const videos: Video[] = [
  {
    id: "1",
    title: "Building a Full-Stack App with Next.js 15 & TypeScript",
    description: "Learn how to build a modern full-stack application using Next.js 15, TypeScript, and Tailwind CSS. We'll cover server components, API routes, and more!",
    thumbnail: "/youtube/thumb1.jpg",
    videoId: "dQw4w9WgXcQ",
    views: "25K",
    likes: "1.2K",
    publishedAt: "2024-01-15",
    duration: "24:15",
  },
  {
    id: "2",
    title: "React Performance Optimization Tips",
    description: "Discover advanced techniques to optimize your React applications for better performance and user experience.",
    thumbnail: "/youtube/thumb2.jpg",
    videoId: "dQw4w9WgXcQ",
    views: "18K",
    likes: "890",
    publishedAt: "2024-01-10",
    duration: "18:30",
  },
  {
    id: "3",
    title: "From Mining Engineer to Software Developer - My Journey",
    description: "My personal story of transitioning from mining engineering to software development, including challenges, lessons learned, and advice for career changers.",
    thumbnail: "/youtube/thumb3.jpg",
    videoId: "dQw4w9WgXcQ",
    views: "42K",
    likes: "2.8K",
    publishedAt: "2024-01-05",
    duration: "32:45",
  },
  {
    id: "4",
    title: "AI-Powered Apps with LangChain & OpenAI",
    description: "Build intelligent applications using LangChain and OpenAI APIs. We'll create a chatbot with memory and context awareness.",
    thumbnail: "/youtube/thumb4.jpg",
    videoId: "dQw4w9WgXcQ",
    views: "35K",
    likes: "1.9K",
    publishedAt: "2023-12-28",
    duration: "28:20",
  },
  {
    id: "5",
    title: "Framer Motion Tutorial - Animations Made Easy",
    description: "Master Framer Motion to create stunning animations in your React applications. From basics to advanced techniques.",
    thumbnail: "/youtube/thumb5.jpg",
    videoId: "dQw4w9WgXcQ",
    views: "22K",
    likes: "1.1K",
    publishedAt: "2023-12-20",
    duration: "20:15",
  },
  {
    id: "6",
    title: "Flutter Best Practices for Production Apps",
    description: "Essential best practices for building production-ready Flutter applications, including state management, architecture, and testing.",
    thumbnail: "/youtube/thumb6.jpg",
    videoId: "dQw4w9WgXcQ",
    views: "30K",
    likes: "1.6K",
    publishedAt: "2023-12-15",
    duration: "26:40",
  },
]

export function YouTubeSection() {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  })

  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null)

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <section
      id="youtube"
      ref={ref}
      className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      <div className="absolute inset-0 aurora-bg opacity-10 dark:opacity-20" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <Youtube className="w-10 h-10 text-red-600" />
            <h2 className="text-4xl font-bold gradient-text">
              YouTube Channel
            </h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Sharing knowledge through tutorials, project walkthroughs, and insights from my journey
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

        {/* Videos Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {videos.map((video) => (
            <motion.div
              key={video.id}
              variants={item}
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
                <div className="glass rounded-xl overflow-hidden border border-border/50 hover:border-red-600/50 dark:hover:border-red-600 transition-all duration-300 hover:shadow-lg hover:shadow-red-600/20">
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
                  </div>

                  {/* Video Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors">
                      {video.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {video.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{video.views} views</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" />
                        <span>{video.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(video.publishedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </a>
            </motion.div>
          ))}
        </motion.div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-12"
        >
          <a
            href="/youtube"
            className="inline-flex items-center gap-2 px-6 py-3 glass border-2 border-border hover:border-red-600 dark:hover:border-red-500 rounded-full font-semibold transition-all hover:shadow-lg hover:shadow-red-600/20"
          >
            View All Videos
            <Youtube className="w-5 h-5" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
