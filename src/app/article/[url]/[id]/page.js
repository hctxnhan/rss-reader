"use client";

import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Type,
  Loader2,
  Wand2,
  ExternalLink,
  Focus,
  FileText,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { fetchFullRssText, fetchRssFeed } from "@/lib/rss-utils";
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const fontFamilies = [
  { name: "JetBrains Mono", value: "font-jetbrains" },
  { name: "Roboto Mono", value: "font-roboto-mono" },
  { name: "Source Code Pro", value: "font-source-code" },
  { name: "Fira Code", value: "font-fira-code" },
  { name: "IBM Plex Mono", value: "font-ibm-plex" },
  { name: "Space Mono", value: "font-space-mono" },
  { name: "Ubuntu Mono", value: "font-ubuntu-mono" },
  { name: "Anonymous Pro", value: "font-anonymous" },
  { name: "Hack", value: "font-hack" },
  { name: "Inconsolata", value: "font-inconsolata" },
];

const fontSizes = ["text-sm", "text-base", "text-lg", "text-xl"];

export default function ArticlePage({ params }) {
  const resolvedParams = React.use(params);
  const decodedUrl = decodeURIComponent(resolvedParams.url);
  const articleId = parseInt(resolvedParams.id);

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fontSizeIndex, setFontSizeIndex] = useState(1);
  const [fontFamily, setFontFamily] = useState("font-jetbrains");
  const [fetchingFullText, setFetchingFullText] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [summarizing, setSummarizing] = useState(false);
  const [summary, setSummary] = useState("");
  const articleRef = useRef(null);

  useEffect(() => {
    loadArticle();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!articleRef.current) return;

      const element = articleRef.current;
      const totalHeight = element.scrollHeight - element.clientHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setReadingProgress(Math.min(100, Math.max(0, progress)));
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  async function loadArticle() {
    try {
      setLoading(true);
      const data = await fetchRssFeed(decodedUrl);
      setArticle(data.items[articleId]);
    } catch (err) {
      setError("Failed to load article");
    } finally {
      setLoading(false);
    }
  }

  const defaultPrompt =
    localStorage.getItem("defaultPrompt") || "Summarize this article:";
  const openRouterKey = localStorage.getItem("openRouterKey");
  const aiModel = localStorage.getItem("aiModel") || "gpt-3.5-turbo";

  async function summarizeArticle() {
    if (!openRouterKey) {
      setError("Please set your OpenRouter API key in settings");
      return;
    }

    try {
      setSummarizing(true);
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openRouterKey}`,
          },
          body: JSON.stringify({
            model: aiModel,
            messages: [
              {
                role: "system",
                content: defaultPrompt,
              },
              {
                role: "user",
                content: `Summarize this article: ${article.title}\n\n${article.content}`,
              },
            ],
          }),
        }
      );
      const data = await response.json();
      setSummary(data.choices[0].message.content);
    } catch (err) {
      setError("Failed to generate summary");
    } finally {
      setSummarizing(false);
    }
  }

  const formatContent = (content) => {
    return content
      .replace(
        /<h2/g,
        '<h2 class="text-2xl font-bold mt-12 mb-6 text-[#0ff] font-mono tracking-wider"'
      )
      .replace(
        /<h3/g,
        '<h3 class="text-xl font-bold mt-8 mb-4 text-[#0ff]/90 font-mono tracking-wide"'
      )
      .replace(
        /<p>/g,
        '<p class="leading-relaxed mb-6 text-[#0ff]/70 font-mono">'
      )
      .replace(
        /<blockquote>/g,
        '<blockquote class="border-l-4 border-[#0ff] pl-6 italic my-8 text-[#0ff]/60 bg-[#0ff]/5 p-4 rounded">'
      )
      .replace(
        /<ul>/g,
        '<ul class="space-y-3 my-6 border border-[#0ff]/20 rounded-lg p-4 bg-black/50">'
      )
      .replace(
        /<ol>/g,
        '<ol class="space-y-3 my-6 list-none counter-reset-item border border-[#0ff]/20 rounded-lg p-4 bg-black/50">'
      )
      .replace(
        /<li>/g,
        `<li class="flex gap-3 items-start group">`
      )
      .replace(/<\/li>/g, "</span></li>")
      .replace(
        /<img/g,
        '<img class="rounded-xl shadow-[0_0_15px_rgba(0,255,255,0.3)] my-10 w-full border border-[#0ff]/30" loading="lazy"'
      )
      .replace(
        /<a /g,
        '<a class="text-[#0ff] hover:text-[#0ff] hover:underline decoration-[#0ff]/30 font-mono" '
      )
      .replace(
        /<pre/g,
        '<pre class="bg-black/50 border border-[#0ff]/30 rounded-lg p-4 my-6 overflow-x-auto font-mono text-[#0ff]/70"'
      )
      .replace(/<code/g, '<code class="font-mono text-[#0ff]"');
  };

  return (
    <div className="relative min-h-screen bg-black">
      <Navigation />

      <div className="fixed top-14 left-0 right-0 z-50">
        <Progress value={readingProgress} className="h-1 bg-[#0ff]/20" />
      </div>

      <header className="fixed top-[3.5rem] left-0 right-0 bg-black/80 backdrop-blur-sm border-b border-[#0ff]/30 z-40">
        <div className="content-container h-14 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Link href={`/feed/${resolvedParams.url}`}>
              <Button
                variant="ghost"
                size="icon"
                className="text-[#0ff] hover:text-[#0ff] hover:bg-[#0ff]/10 transition-all duration-300"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-[#0ff] hover:text-[#0ff] hover:bg-[#0ff]/10 transition-all duration-300"
                >
                  <Type className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-black/95 border-[#0ff]/30 backdrop-blur-sm">
                <SheetHeader>
                  <SheetTitle className="text-[#0ff] font-mono tracking-wider">
                    [Terminal Settings]
                  </SheetTitle>
                </SheetHeader>
                <div className="grid gap-6 py-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#0ff] font-mono tracking-wide">
                      Font Style
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {fontFamilies.map((font) => (
                        <Button
                          key={font.value}
                          variant={
                            fontFamily === font.value ? "default" : "outline"
                          }
                          onClick={() => setFontFamily(font.value)}
                          className={`justify-start ${font.value} text-[#0ff] hover:text-[#0ff] hover:bg-[#0ff]/10 border-[#0ff]/30 transition-all duration-300`}
                        >
                          <span className="truncate">{font.name}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#0ff] font-mono tracking-wide">
                      Font Size
                    </label>
                    <div className="flex gap-2">
                      {fontSizes.map((_, index) => (
                        <Button
                          key={index}
                          variant={
                            fontSizeIndex === index ? "default" : "outline"
                          }
                          onClick={() => setFontSizeIndex(index)}
                          className="flex-1 text-[#0ff] hover:text-[#0ff] hover:bg-[#0ff]/10 border-[#0ff]/30 transition-all duration-300 font-mono"
                        >
                          {index === 0
                            ? "S"
                            : index === 1
                            ? "M"
                            : index === 2
                            ? "L"
                            : "XL"}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="container max-w-3xl px-4 pt-32 pb-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-[#0ff]" />
            <p className="text-[#0ff]/60 font-mono">LOADING ARTICLE...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 font-mono font-bold animate-pulse">
              [ERROR] {error}
            </p>
          </div>
        ) : (
          <article
            ref={articleRef}
            className={`${fontSizes[fontSizeIndex]} ${fontFamily} relative`}
          >
            <div className="mb-12">
              <h1 className="text-4xl font-bold tracking-tight mb-6 text-[#0ff] font-mono animate-pulse">
                {article.title}
              </h1>
              <div className="flex items-center gap-4 text-[#0ff]/60 font-mono">
                <time dateTime={article.pubDate}>
                  {new Date(article.pubDate).toLocaleDateString()}
                </time>
                {article.author && (
                  <>
                    <span className="text-[#0ff]/30">|</span>
                    <span>{article.author}</span>
                  </>
                )}
              </div>
            </div>

            <div
              className="prose prose-invert max-w-none relative"
              dangerouslySetInnerHTML={{
                __html: formatContent(article.content),
              }}
            />

            <div className="mt-12 pt-8 border-t border-[#0ff]/30">
              <Link
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button
                  className="w-full text-[#0ff] hover:text-[#0ff] hover:bg-[#0ff]/10 border-[#0ff]/30 transition-all duration-300 font-mono tracking-wide group"
                  variant="outline"
                >
                  <ExternalLink className="h-4 w-4 mr-2 group-hover:rotate-45 transition-transform" />
                  [Open Original Article]
                </Button>
              </Link>
            </div>

            {summary && (
              <div className="mt-8 space-y-8">
                {summary && (
                  <div className="p-6 bg-[#0ff]/5 rounded-xl border border-[#0ff]/30 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0ff]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <h3 className="font-semibold text-lg mb-3 text-[#0ff] font-mono tracking-wider">
                      [RSS Content Summary]
                    </h3>
                    <p className="leading-relaxed text-[#0ff]/60 font-mono">
                      {summary}
                    </p>
                  </div>
                )}
              </div>
            )}
          </article>
        )}
      </main>

      <div className="fixed bottom-6 right-6 flex flex-col gap-4">
        <Button
          onClick={async () => {
            const data = await fetchFullRssText(article.link, openRouterKey);

            setArticle({
              ...article,
              content: data.content,
            });
          }}
          disabled={fetchingFullText}
          className="h-12 w-12 shadow-[0_0_15px_rgba(0,255,255,0.3)] bg-black border border-[#0ff]/30 text-[#0ff] hover:bg-[#0ff]/10 transition-all duration-300 group"
          size="icon"
          title="Fetch and summarize full article"
        >
          {fetchingFullText ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <FileText className="h-6 w-6" />
          )}
        </Button>
        <Button
          onClick={summarizeArticle}
          disabled={summarizing}
          className="h-12 w-12 shadow-[0_0_15px_rgba(0,255,255,0.3)] bg-black border border-[#0ff]/30 text-[#0ff] hover:bg-[#0ff]/10 transition-all duration-300 group"
          size="icon"
          title="Summarize RSS content"
        >
          {summarizing ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <Wand2 className="h-6 w-6" />
          )}
        </Button>
      </div>
    </div>
  );
}
