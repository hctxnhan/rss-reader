import { NextResponse } from "next/server";
import Parser from "rss-parser";

export const revalidate = 0; // Disable caching by setting revalidate to 0

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const rssUrl = searchParams.get("url");

  if (!rssUrl) {
    return NextResponse.json({ error: "RSS URL is required" }, { status: 400 });
  }

  try {
    const parser = new Parser();
    const response = await parser.parseURL(rssUrl);
    return NextResponse.json(response);
  } catch (error) {
    console.error("RSS feed fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch RSS feed" },
      { status: 500 }
    );
  }
}
