"use client";

import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Share2,
  Twitter,
  Linkedin,
  Facebook,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// This would normally come from your MDX files or CMS
const blogPosts = {
  "from-mining-to-code": {
    title:
      "From Mining Engineer to Software Developer: My Transformation Journey",
    date: "2024-01-15",
    readTime: "8 min read",
    tags: ["Career", "Personal Story", "Learning"],
    content: `
# From Mining Engineer to Software Developer

## The Beginning

My journey into technology began in an unexpected place — deep underground in the mining industry. As a **Mining & Mineral Processing Engineer**, I spent years optimizing complex industrial processes, analyzing data, and solving intricate problems.

## The Spark

One day, I found myself manually processing spreadsheets for hours, repeating the same calculations over and over. I thought: *"There has to be a better way."* That's when I discovered programming.

### First Steps

I started with Python, automating my daily tasks:
- Data processing scripts
- Report generation
- Process optimization calculators

\`\`\`python
def optimize_process(data):
    # My first useful function
    result = analyze_efficiency(data)
    return generate_recommendations(result)
\`\`\`

## The Transition

The more I learned, the more fascinated I became. I realized that software development combined everything I loved:
- Problem-solving
- Systematic thinking
- Creating tangible solutions
- Continuous learning

### Building Real Projects

I started building actual applications:
1. **Shift Management System** for mining operations
2. **Equipment Tracking App** using Flutter
3. **Data Analytics Dashboard** with React

Each project taught me something new and fueled my passion further.

## The Leap

After two years of self-study and building projects, I made the decision to transition full-time into software development. It wasn't easy — there were doubts, financial concerns, and the fear of leaving a stable career.

But I knew that staying in my comfort zone meant missing out on my true calling.

## Where I Am Today

Today, I'm a full-stack developer specializing in:
- **Flutter** for mobile applications
- **React** for web frontends
- **Node.js** for backend services
- **Cloud technologies** for scalable solutions

I've built production applications used by thousands of users, mentored aspiring developers, and continue to learn every single day.

## Lessons Learned

### 1. You Don't Need a CS Degree

While formal education is valuable, it's not the only path. I learned through:
- Online courses (Udemy, Coursera)
- Documentation and official guides
- Building real projects
- Contributing to open source

### 2. Engineering Skills Transfer

My mining engineering background actually helped:
- **Analytical thinking** → Debugging and optimization
- **Process improvement** → Code refactoring
- **Problem-solving** → Algorithm design
- **Documentation** → Writing clean, maintainable code

### 3. Build, Build, Build

You can't learn to code by just watching tutorials. You need to:
- Build projects that solve real problems
- Make mistakes and debug them
- Iterate and improve
- Share your work and get feedback

### 4. Community Matters

The developer community is incredibly supportive:
- Stack Overflow answers
- GitHub discussions
- Dev.to articles
- Twitter developer circles

Don't be afraid to ask questions and share your journey.

## Advice for Career Changers

If you're thinking about transitioning to software development:

### Start Small
You don't need to quit your job immediately. Start learning in your free time, build small projects, and gradually build confidence.

### Focus on Fundamentals
Learn the core concepts:
- Data structures and algorithms
- Object-oriented programming
- Version control (Git)
- Testing and debugging

### Choose Your Path
You can't learn everything at once. Pick a specialization:
- Web development (Frontend/Backend)
- Mobile development
- Data science
- DevOps

### Build a Portfolio
Your projects are your resume. Build things that demonstrate:
- Problem-solving ability
- Code quality
- Technical skills
- Real-world impact

### Network
Connect with other developers:
- Attend meetups
- Join online communities
- Contribute to open source
- Share your learning journey

## Conclusion

Transitioning from mining engineering to software development was one of the best decisions I've ever made. It wasn't easy, but it was worth it.

If you're on a similar journey, remember:
- **Your background is an asset**, not a liability
- **It's never too late** to change careers
- **Consistency beats intensity** — learn every day
- **Build things that matter** to you

The tech industry needs diverse perspectives. Your unique background can be your superpower.

---

**What's your story?** Are you considering a career change? Have you already made the leap? I'd love to hear about your journey in the comments below.

Connect with me on [Twitter](https://twitter.com/anjanarodrigo) or [LinkedIn](https://linkedin.com/in/anjana-rodrigo-a41539191) — let's support each other on this amazing journey!
    `,
  },
  "clean-architecture-flutter": {
    title: "Implementing Clean Architecture in Flutter: A Practical Guide",
    date: "2024-01-10",
    readTime: "12 min read",
    tags: ["Flutter", "Architecture", "Tutorial"],
    content: `
# Implementing Clean Architecture in Flutter

Clean Architecture is a software design philosophy that separates concerns and makes your code more maintainable, testable, and scalable.

## Coming Soon

This article is currently being written. Check back soon for the complete guide!

Key topics that will be covered:
- Understanding Clean Architecture principles
- Layered architecture in Flutter
- Dependency injection with GetIt
- State management integration
- Testing strategies
- Real-world examples

Subscribe to get notified when this article is published!
    `,
  },
};

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const post = blogPosts[slug as keyof typeof blogPosts];

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
          <Link href="/blog">
            <Button variant="emerald">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = encodeURIComponent(post.title);

  return (
    <div className="min-h-screen py-20">
      <article className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link href="/blog">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </motion.div>

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-sm font-medium bg-emerald/20 text-emerald rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold mb-6 gradient-text">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date(post.date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{post.readTime}</span>
            </div>
          </div>

          {/* Share Buttons */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Share:</span>
            <a
              href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 glass rounded-lg hover:bg-emerald/10 hover:border-emerald border border-transparent transition-all"
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 glass rounded-lg hover:bg-emerald/10 hover:border-emerald border border-transparent transition-all"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 glass rounded-lg hover:bg-emerald/10 hover:border-emerald border border-transparent transition-all"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: post.title,
                    url: shareUrl,
                  });
                } else {
                  navigator.clipboard.writeText(shareUrl);
                  alert("Link copied to clipboard!");
                }
              }}
              className="p-2 glass rounded-lg hover:bg-emerald/10 hover:border-emerald border border-transparent transition-all"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </motion.header>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="prose prose-lg dark:prose-invert max-w-none
            prose-headings:gradient-text
            prose-a:text-emerald prose-a:no-underline hover:prose-a:underline
            prose-code:text-amber prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded
            prose-pre:bg-muted prose-pre:border prose-pre:border-border
            prose-img:rounded-xl
            prose-strong:text-foreground
            prose-em:text-muted-foreground"
        >
          <div
            dangerouslySetInnerHTML={{
              __html: post.content.replace(/\n/g, "<br />"),
            }}
          />
        </motion.div>

        {/* Comments Section Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 pt-8 border-t border-border"
        >
          <h2 className="text-2xl font-bold mb-4">Comments</h2>
          <div className="glass p-8 rounded-xl text-center">
            <p className="text-muted-foreground">
              Comments section coming soon! For now, feel free to reach out on{" "}
              <a
                href="https://twitter.com/anjanarodrigo"
                className="text-emerald hover:underline"
              >
                Twitter
              </a>{" "}
              or{" "}
              <a
                href="https://linkedin.com/in/anjana-rodrigo-a41539191"
                className="text-emerald hover:underline"
              >
                LinkedIn
              </a>
              .
            </p>
          </div>
        </motion.div>
      </article>
    </div>
  );
}
