import { NextResponse } from "next/server";
import { YtTranscript } from "yt-transcript";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get("videoId");

    if (!videoId) {
      return NextResponse.json(
        { error: "Video ID is required" },
        { status: 400 }
      );
    }

    const ytTranscript = new YtTranscript({ videoId });

    // Format transcript into readable content
    const transcript = await ytTranscript.getTranscript();
    const content = transcript?.map((t) => t.text).join(" ");

    return NextResponse.json({
      content,
      videoId,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch video transcript: " + error.message },
      { status: 500 }
    );
  }
}
