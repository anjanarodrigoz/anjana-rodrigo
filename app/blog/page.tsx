"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Calendar, Clock, ArrowRight, Search } from "lucide-react"
import { useState } from "react"
import { Input } from "@/components/ui/input"

// Sample blog posts - replace with actual data from MDX files
const blogPosts = [
  {
    slug: "from-mining-to-code",
    title: "From Mining Engineer to Software Developer: My Transformation Journey",
    excerpt: "How I transitioned from the mining industry to becoming a full-stack developer, and the lessons I learned along the way.",
    date: "2024-01-15",
    readTime: "8 min read",
    tags: ["Career", "Personal Story", "Learning"],
    image: "/blog/mining-to-code.jpg",
  },
  {
    slug: "clean-architecture-flutter",
    title: "Implementing Clean Architecture in Flutter: A Practical Guide",
    excerpt: "A comprehensive guide to implementing Clean Architecture in Flutter applications with real-world examples and best practices.",
    date: "2024-01-10",
    readTime: "12 min read",
    tags: ["Flutter", "Architecture", "Tutorial"],
    image: "/blog/clean-architecture.jpg",
  },
  {
    slug: "state-management-comparison",
    title: "State Management in React: Redux vs Zustand vs Context API",
    excerpt: "An in-depth comparison of popular state management solutions in React, with performance benchmarks and use case recommendations.",
    date: "2024-01-05",
    readTime: "10 min read",
    tags: ["React", "State Management", "Comparison"],
    image: "/blog/state-management.jpg",
  },
  {
    slug: "building-scalable-apis",
    title: "Building Scalable REST APIs with Node.js and PostgreSQL",
    excerpt: "Best practices for building production-ready REST APIs that can handle millions of requests with proper error handling and monitoring.",
    date: "2023-12-28",
    readTime: "15 min read",
    tags: ["Node.js", "API", "Backend"],
    image: "/blog/scalable-apis.jpg",
  },
  {
    slug: "firebase-vs-supabase",
    title: "Firebase vs Supabase: Choosing the Right Backend for Your Project",
    excerpt: "A detailed comparison of Firebase and Supabase, covering features, pricing, performance, and ideal use cases for each platform.",
    date: "2023-12-20",
    readTime: "9 min read",
    tags: ["Backend", "Comparison", "Firebase", "Supabase"],
    image: "/blog/firebase-vs-supabase.jpg",
  },
  {
    slug: "optimizing-react-performance",
    title: "10 Advanced Techniques for Optimizing React Performance",
    excerpt: "Discover advanced optimization techniques that can dramatically improve your React application's performance and user experience.",
    date: "2023-12-15",
    readTime: "11 min read",
    tags: ["React", "Performance", "Optimization"],
    image: "/blog/react-performance.jpg",
  },
]

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  // Get all unique tags
  const allTags = Array.from(new Set(blogPosts.flatMap((post) => post.tags)))

  // Filter posts
  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTag = !selectedTag || post.tags.includes(selectedTag)
    return matchesSearch && matchesTag
  })

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-4">
            <span className="gradient-text">Blog</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Thoughts on software development, architecture, and the journey from mining to code
          </p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12 space-y-6"
        >
          {/* Search */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tags */}
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !selectedTag
                  ? "bg-emerald text-white"
                  : "glass hover:bg-accent"
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedTag === tag
                    ? "bg-emerald text-white"
                    : "glass hover:bg-accent"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post, index) => (
            <motion.article
              key={post.slug}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Link
                href={`/blog/${post.slug}`}
                className="group block h-full"
              >
                <div className="glass rounded-2xl overflow-hidden border border-border hover:border-emerald transition-all duration-300 h-full flex flex-col">
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-emerald/20 via-amber/20 to-coral/20">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-emerald via-amber to-coral opacity-50"
                      animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                      }}
                      transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-6xl font-bold opacity-20">
                      {post.title.charAt(0)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs font-medium bg-emerald/20 text-emerald rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Title */}
                    <h2 className="text-xl font-bold mb-3 group-hover:text-emerald transition-colors line-clamp-2">
                      {post.title}
                    </h2>

                    {/* Excerpt */}
                    <p className="text-muted-foreground mb-4 line-clamp-3 flex-1">
                      {post.excerpt}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>

                    {/* Read More */}
                    <div className="mt-4 flex items-center gap-2 text-emerald font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Read More
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>

        {/* No Results */}
        {filteredPosts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-xl text-muted-foreground">
              No articles found. Try adjusting your search or filters.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
