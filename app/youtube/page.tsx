"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { Youtube, Play, Eye, ThumbsUp, Calendar, Search, Loader2 } from "lucide-react"

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

export default function YouTubePage() {
  const [allVideos, setAllVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null)

  useEffect(() => {
    async function fetchVideos() {
      try {
        const response = await fetch("/api/youtube?maxResults=50")
        const data = await response.json()
        setAllVideos(data.items || [])
      } catch (error) {
        console.error("Failed to fetch YouTube videos:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [])

  const filteredVideos = allVideos.filter((video) => {
    const matchesSearch =
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
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
            href="https://youtube.com/channel/UCtq3s2MFsZAn4cDF7v_6w_g"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full transition-all shadow-lg hover:shadow-xl hover:shadow-red-600/50"
          >
            <Youtube className="w-5 h-5" />
            Subscribe to Channel
          </a>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
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
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-red-600" />
            <span className="ml-3 text-muted-foreground">Loading videos...</span>
          </div>
        )}

        {/* Results Count */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-6 text-center text-muted-foreground"
          >
            Showing {filteredVideos.length} video{filteredVideos.length !== 1 ? "s" : ""}
          </motion.div>
        )}

        {/* Videos Grid */}
        {!loading && filteredVideos.length > 0 && (
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
                  href={`https://youtube.com/watch?v=${video.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  {/* Video Card */}
                  <div className="glass rounded-xl overflow-hidden border border-border/50 hover:border-red-600/50 dark:hover:border-red-600 transition-all duration-300 hover:shadow-lg hover:shadow-red-600/20 h-full flex flex-col">
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
        )}

        {/* No Results */}
        {!loading && filteredVideos.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center py-20"
          >
            <Youtube className="w-20 h-20 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No videos found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? "Try adjusting your search criteria" : "No videos available yet"}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
