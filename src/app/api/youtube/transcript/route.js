import { NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get("videoId");

    if (!videoId) {
      return NextResponse.json({ error: "Video ID is required" }, { status: 400 });
    }

    // Fetch video transcript
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);

    // Format transcript into readable content
    const content = transcript
      .map(item => item.text)
      .join("\n");

    return NextResponse.json({
      content,
      videoId,
    });
  } catch (error) {
    console.error("YouTube transcript fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch video transcript" }, { status: 500 });
  }
}