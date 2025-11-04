import { NextResponse } from "next/server"

export const runtime = "edge"

const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY
const CHANNEL_ID = process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID || "UCtq3s2MFsZAn4cDF7v_6w_g"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const maxResults = searchParams.get("maxResults") || "12"

  if (!YOUTUBE_API_KEY) {
    // Return mock data if no API key is provided
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
    console.error("YouTube API Error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch YouTube videos. Using mock data.",
        items: getMockVideos(),
      },
      { status: 500 }
    )
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
      id: "dQw4w9WgXcQ",
      title: "React Performance Optimization Tips",
      description: "Discover advanced techniques to optimize your React applications.",
      thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
      publishedAt: "2024-01-10T00:00:00Z",
      channelTitle: "Anjana Rodrigo",
      views: "18K",
      likes: "890",
      duration: "18:30",
    },
    {
      id: "dQw4w9WgXcQ",
      title: "From Mining Engineer to Software Developer",
      description: "My personal story of transitioning careers into tech.",
      thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
      publishedAt: "2024-01-05T00:00:00Z",
      channelTitle: "Anjana Rodrigo",
      views: "42K",
      likes: "2.8K",
      duration: "32:45",
    },
  ]
}
