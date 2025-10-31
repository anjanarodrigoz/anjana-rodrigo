"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { Youtube, Play, Eye, ThumbsUp, Calendar, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"

interface Video {
  id: string
  title: string
  description: string
  thumbnail: string
  views: string
  likes: string
  publishedAt: string
  duration: string
}

export function YouTubeSection() {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  })

  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null)

  useEffect(() => {
    async function fetchVideos() {
      try {
        const response = await fetch("/api/youtube?maxResults=6")
        const data = await response.json()
        setVideos(data.items || [])
      } catch (error) {
        console.error("Failed to fetch YouTube videos:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [])

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

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-red-600" />
            <span className="ml-3 text-muted-foreground">Loading videos...</span>
          </div>
        )}

        {/* Videos Grid */}
        {!loading && videos.length > 0 && (
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
                href={`https://youtube.com/watch?v=${video.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                {/* Video Card */}
                <div className="glass rounded-xl overflow-hidden border border-border/50 hover:border-red-600/50 dark:hover:border-red-600 transition-all duration-300 hover:shadow-lg hover:shadow-red-600/20">
                  {/* Thumbnail */}
                  <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-red-500/20 via-amber-500/20 to-emerald-500/20">
                    {/* Thumbnail Image */}
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
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
        )}

        {/* View All Button */}
        {!loading && videos.length > 0 && (
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
        )}
      </div>
    </section>
  )
}
