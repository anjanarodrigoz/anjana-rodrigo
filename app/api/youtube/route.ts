import { NextResponse } from "next/server"

export const runtime = "edge"

const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY
const CHANNEL_ID = process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID || "UCtq3s2MFsZAn4cDF7v_6w_g"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const maxResults = searchParams.get("maxResults") || "12"

  let useRssFallback = false

  if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === "AIzaSyATyRMAw2OADIJQTh0iGNYZ2iQt90kiA98") {
    useRssFallback = true
  }

  if (useRssFallback) {
    const rssVideos = await fetchFromRss(CHANNEL_ID)
    if (rssVideos && rssVideos.length > 0) {
      return NextResponse.json({ items: rssVideos })
    }
    return NextResponse.json({
      error: "YouTube API key not configured. Using mock data.",
      items: getMockVideos(),
    })
  }

  try {
    // Fetch channel's uploads playlist
    const channelResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${CHANNEL_ID}&key=${YOUTUBE_API_KEY}`
    )

    if (!channelResponse.ok) {
      throw new Error("Failed to fetch channel data")
    }

    const channelData = await channelResponse.json()
    const uploadsPlaylistId = channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads

    if (!uploadsPlaylistId) {
      throw new Error("Uploads playlist not found")
    }

    // Fetch videos from uploads playlist
    const videosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`
    )

    if (!videosResponse.ok) {
      throw new Error("Failed to fetch videos")
    }

    const videosData = await videosResponse.json()

    // Get video statistics
    const videoIds = videosData.items?.map((item: any) => item.contentDetails.videoId).join(",")

    const statsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`
    )

    if (!statsResponse.ok) {
      throw new Error("Failed to fetch video statistics")
    }

    const statsData = await statsResponse.json()

    // Combine video data with statistics
    const videos = videosData.items?.map((item: any) => {
      const videoId = item.contentDetails.videoId
      const stats = statsData.items?.find((s: any) => s.id === videoId)

      return {
        id: videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high.url,
        publishedAt: item.snippet.publishedAt,
        channelTitle: item.snippet.channelTitle,
        views: formatNumber(stats?.statistics?.viewCount || 0),
        likes: formatNumber(stats?.statistics?.likeCount || 0),
        duration: formatDuration(stats?.contentDetails?.duration || "PT0S"),
      }
    })

    return NextResponse.json({ items: videos })
  } catch (error) {
    console.error("YouTube API Error, falling back to RSS:", error)
    const rssVideos = await fetchFromRss(CHANNEL_ID)
    if (rssVideos && rssVideos.length > 0) {
      return NextResponse.json({ items: rssVideos })
    }
    return NextResponse.json(
      {
        error: "Failed to fetch YouTube videos. Using mock data.",
        items: getMockVideos(),
      },
      { status: 200 }
    )
  }
}

function cleanXmlString(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

async function fetchFromRss(channelId: string) {
  try {
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
    const response = await fetch(rssUrl)
    if (!response.ok) {
      throw new Error(`RSS fetch failed with status ${response.status}`)
    }
    const xmlText = await response.text()
    
    // Split into entry blocks
    const entryBlocks = xmlText.split("<entry>")
    entryBlocks.shift() // Remove feed headers

    const videos = entryBlocks.map((entry) => {
      const videoIdMatch = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)
      const titleMatch = entry.match(/<title>([^<]+)<\/title>/)
      const descriptionMatch = entry.match(/<media:description>([\s\S]*?)<\/media:description>/)
      const thumbnailMatch = entry.match(/<media:thumbnail[^>]+url="([^"]+)"/)
      const publishedMatch = entry.match(/<published>([^<]+)<\/published>/)
      const viewsMatch = entry.match(/<media:statistics[^>]+views="(\d+)"/)
      const starRatingMatch = entry.match(/<media:starRating[^>]+count="(\d+)"/)
      const linkMatch = entry.match(/<link[^>]+href="([^"]+)"/)

      const videoId = videoIdMatch ? videoIdMatch[1] : ""
      const title = titleMatch ? cleanXmlString(titleMatch[1]) : ""
      const description = descriptionMatch ? cleanXmlString(descriptionMatch[1]) : ""
      const thumbnail = thumbnailMatch ? thumbnailMatch[1] : `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
      const publishedAt = publishedMatch ? publishedMatch[1] : new Date().toISOString()
      const rawViews = viewsMatch ? parseInt(viewsMatch[1], 10) : 0
      const likes = starRatingMatch ? starRatingMatch[1] : "0"
      
      const link = linkMatch ? linkMatch[1] : ""
      const isShort = link.includes("/shorts/")
      
      // RSS feed has no duration. Assign 0:30 for shorts, 5:00 for long videos
      // to pass the client-side filters.
      const duration = isShort ? "0:30" : "5:00"

      return {
        id: videoId,
        title,
        description,
        thumbnail,
        publishedAt,
        channelTitle: "Anjana Rodrigo",
        views: formatNumber(rawViews),
        likes: formatNumber(parseInt(likes, 10)),
        duration,
      }
    })

    return videos.filter(v => v.id)
  } catch (error) {
    console.error("RSS fetch error:", error)
    return null
  }
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M"
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K"
  }
  return num.toString()
}

function formatDuration(duration: string): string {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/)
  if (!match) return "0:00"

  const hours = (match[1] || "").replace("H", "")
  const minutes = (match[2] || "").replace("M", "")
  const seconds = (match[3] || "0").replace("S", "")

  if (hours) {
    return `${hours}:${minutes.padStart(2, "0")}:${seconds.padStart(2, "0")}`
  }
  return `${minutes || "0"}:${seconds.padStart(2, "0")}`
}

function getMockVideos() {
  return [
    {
      id: "dQw4w9WgXcQ",
      title: "Building a Full-Stack App with Next.js 15 & TypeScript",
      description: "Learn how to build a modern full-stack application using Next.js 15, TypeScript, and Tailwind CSS.",
      thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
      publishedAt: "2024-01-15T00:00:00Z",
      channelTitle: "Anjana Rodrigo",
      views: "25K",
      likes: "1.2K",
      duration: "24:15",
    },
    {
      id: "9bZkp7q19f0",
      title: "React Performance Optimization Tips",
      description: "Discover advanced techniques to optimize your React applications.",
      thumbnail: "https://i.ytimg.com/vi/9bZkp7q19f0/hqdefault.jpg",
      publishedAt: "2024-01-10T00:00:00Z",
      channelTitle: "Anjana Rodrigo",
      views: "18K",
      likes: "890",
      duration: "18:30",
    },
    {
      id: "kJQP7kiw5Fk",
      title: "From Mining Engineer to Software Developer",
      description: "My personal story of transitioning careers into tech.",
      thumbnail: "https://i.ytimg.com/vi/kJQP7kiw5Fk/hqdefault.jpg",
      publishedAt: "2024-01-05T00:00:00Z",
      channelTitle: "Anjana Rodrigo",
      views: "42K",
      likes: "2.8K",
      duration: "32:45",
    },
  ]
}
