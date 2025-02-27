import { NextResponse } from "next/server";
import Parser from "rss-parser";
import { channelId as getChannelId } from "@gonetone/get-youtube-id-by-url";

export const revalidate = 0; // Disable caching by setting revalidate to 0

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const channelUrl = searchParams.get("url");

    if (!channelUrl) {
      return NextResponse.json(
        { error: "Channel URL is required" },
        { status: 400 }
      );
    }

    // Extract channel ID using the package
    const channelId = await getChannelId(channelUrl);

    if (!channelId) {
      return NextResponse.json(
        { error: "Invalid YouTube channel URL" },
        { status: 400 }
      );
    }

    // Fetch channel's RSS feed
    const parser = new Parser();
    const feed = await parser.parseURL(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
    );

    // Transform feed items to include video IDs
    const items = feed.items.map((item) => {
      const videoIdMatch = item.link.match(
        /(?:v=|\/)([0-9A-Za-z_-]{11})(?:\?|&|$)/
      );
      return {
        ...item,
        videoId: videoIdMatch ? videoIdMatch[1] : null,
        isVideo: true,
      };
    });

    return NextResponse.json({
      url: channelUrl,
      title: feed.title,
      items,
      description: channelId,
    });
  } catch (error) {
    console.error("YouTube channel fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch YouTube channel" },
      { status: 500 }
    );
  }
}
