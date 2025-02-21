import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const rssUrl = searchParams.get('url');

  if (!rssUrl) {
    return NextResponse.json({ error: 'RSS URL is required' }, { status: 400 });
  }

  try {
    const RSS2JSON = 'https://api.rss2json.com/v1/api.json';
    const response = await axios.get(RSS2JSON, {
      params: {
        rss_url: rssUrl
      }
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('RSS feed fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch RSS feed' },
      { status: 500 }
    );
  }
}