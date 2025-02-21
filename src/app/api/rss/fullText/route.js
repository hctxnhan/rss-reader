import { NextResponse } from 'next/server';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');
  const openRouterKey = searchParams.get('openRouterKey');

  if (!targetUrl) {
    return NextResponse.json({ error: 'Target URL is required' }, { status: 400 });
  }

  if (!openRouterKey) {
    return NextResponse.json({ error: 'OpenRouter API key is required' }, { status: 400 });
  }

  try {
    // Fetch the article content
    const response = await fetch(targetUrl);
    const html = await response.text();
    
    // Parse the HTML and extract article content
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    const reader = new Readability(doc);
    const article = reader.parse();


    if (!article) {
      return NextResponse.json({ error: 'Failed to parse article content' }, { status: 500 });
    }

    return NextResponse.json(article);

  } catch (error) {
    console.error('Full text fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}