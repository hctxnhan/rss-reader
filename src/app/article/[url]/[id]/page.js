"use client";

import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { fetchFullRssText, fetchRssFeed } from "@/lib/rss-utils";
import { defaultPrompt as utilDefaultPrompt } from "@/lib/utils";
import {
  ArrowLeft,
  ExternalLink,
  FileText,
  Loader2,
  Type,
  Wand2,
  MessageSquare,
} from "lucide-react";
import { marked } from "marked";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import {
  fetchVideoTranscript,
  fetchYoutubeChannel,
  isYoutubeUrl,
} from "@/lib/youtube-utils";

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
  const [summarizing, setSummarizing] = useState(false);
  const [summary, setSummary] = useState("");
  const [activeTab, setActiveTab] = useState("original");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const articleRef = useRef(null);

  useEffect(() => {
    loadArticle();
  }, []);

  async function loadArticle() {
    try {
      setLoading(true);
      let data;
      if (!isYoutubeUrl(decodedUrl)) {
        data = await fetchRssFeed(decodedUrl);
      } else {
        data = await fetchYoutubeChannel(decodedUrl);
      }

      const item = data.items[articleId];

      if (item.isVideo && item.videoId) {
        const transcriptData = await fetchVideoTranscript(item.videoId);
        item.content = `
          <div class="w-full h-[400px]">
            <iframe
              src="https://www.youtube.com/embed/${item.videoId}"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
              class="rounded-lg shadow-lg w-full h-full"
            ></iframe>
          </div>
          <div class="transcript">
            ${transcriptData.content}
          </div>
        `;
      }

      setArticle(item);
    } catch (err) {
      console.log(err);
      setError("Failed to load article");
    } finally {
      setLoading(false);
    }
  }

  const [defaultPrompt, setDefaultPrompt] = useState(utilDefaultPrompt);
  const [openRouterKey, setOpenRouterKey] = useState("");
  const [aiModel, setAiModel] = useState("gpt-3.5-turbo");

  useEffect(() => {
    setDefaultPrompt(
      localStorage.getItem("defaultPrompt") || utilDefaultPrompt
    );
    setOpenRouterKey(localStorage.getItem("openRouterKey"));
    setAiModel(localStorage.getItem("aiModel") || "gpt-3.5-turbo");
  }, []);

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
                content: `${article.title}\n\n${article.content}`,
              },
            ],
          }),
        }
      );
      const data = await response.json();
      const markdownContent = data.choices[0].message.content;
      const htmlContent = marked(markdownContent);
      setSummary(htmlContent);
    } catch (err) {
      setError("Failed to generate summary");
    } finally {
      setSummarizing(false);
    }
  }

  async function handleChatSubmit() {
    if (!openRouterKey || !chatInput) return;

    setChatLoading(true);
    const newMessages = [
      ...chatMessages,
      { role: "user", content: chatInput },
    ].slice(-5);
    setChatMessages(newMessages);
    setChatInput("");

    try {
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
            messages: [...newMessages],
          }),
        }
      );
      const data = await response.json();
      setChatMessages([
        ...newMessages,
        { role: "assistant", content: data.choices[0].message.content },
      ]);
    } catch (err) {
      setError("Failed to get chat response");
    } finally {
      setChatLoading(false);
    }
  }

  const formatContent = (content) => {
    return content
      .replaceAll(
        /<h2/g,
        `<h2 class="text-2xl font-bold mt-12 mb-6 text-primary ${fontFamily} tracking-wider"`
      )
      .replaceAll(
        /<h3/g,
        `<h3 class="text-xl font-bold mt-8 mb-4 text-primary/90 ${fontFamily} tracking-wide"`
      )
      .replaceAll(
        /<p>/g,
        `<p class="leading-relaxed mb-6 text-primary/70 ${fontFamily}">`
      )
      .replaceAll(
        /<blockquote>/g,
        '<blockquote class="border-l-4 border-primary pl-6 italic my-8 text-primary/60 bg-primary/5 p-4 rounded">'
      )
      .replaceAll(
        /<ul>/g,
        '<ul class="space-y-3 my-6 border border-primary/20 rounded-lg p-4 bg-background/50 list-disc pl-6">'
      )
      .replaceAll(
        /<ol>/g,
        '<ol class="space-y-3 my-6 list-decimal counter-reset-item border border-primary/20 rounded-lg p-4 bg-background/50 pl-6">'
      )
      .replaceAll(
        /<li>/g,
        `<li class="flex gap-3 items-start group"><span class="w-2 h-2 rounded-full bg-primary/70 mt-2"></span><span class="flex-1">`
      )
      .replaceAll(/<\/li>/g, "</span></li>")
      .replaceAll(
        /<img/g,
        '<img class="rounded-xl shadow-primary/30 my-10 w-full max-w-full h-auto border border-primary/30 object-cover" loading="lazy"'
      )
      .replaceAll(
        /<pre/g,
        `<pre class="bg-background/50 border border-primary/30 rounded-lg p-4 my-6 overflow-x-auto whitespace-pre-wrap break-words text-sm ${fontFamily} text-primary/70"`
      )
      .replaceAll(
        /<code/g,
        `<code class="px-1 py-0.5 bg-primary/10 rounded text-sm font-mono text-primary/80"`
      )
      .replaceAll(
        /<table/g,
        `<div class="overflow-x-auto max-w-full my-6 border border-primary/30 rounded-lg bg-background/50"><table class="w-full border-collapse text-primary/70 ${fontFamily} table-auto"`
      )
      .replaceAll(/<\/table>/g, "</table></div>")
      .replaceAll(
        /<th/g,
        `<th class="p-3 text-left border-b border-primary/30 font-medium text-primary bg-primary/10 ${fontFamily}"`
      )
      .replaceAll(
        /<td/g,
        `<td class="p-3 border-b border-primary/10 text-primary/80 ${fontFamily}"`
      )
      .replaceAll(/<a /g, `<a class="text-primary hover:underline font-medium"`)
      .replaceAll(/<hr>/g, `<hr class="my-6 border-primary/20">`);
  };

  return (
    <div className="relative min-h-screen bg-background">
      <Navigation />

      <header className="fixed top-[3.5rem] left-0 right-0 bg-background/80 backdrop-blur-sm border-b border-primary/30 z-40">
        <div className="content-container h-14 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Link href={`/feed/${resolvedParams.url}`}>
              <Button
                variant="ghost"
                size="icon"
                className="text-primary hover:text-primary hover:bg-primary/10 transition-all duration-300"
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
                  className="text-primary hover:text-primary hover:bg-primary/10 transition-all duration-300"
                >
                  <Type className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-background/95 border-primary/30 backdrop-blur-sm">
                <SheetHeader>
                  <SheetTitle className="text-primary font-mono tracking-wider">
                    [Terminal Settings]
                  </SheetTitle>
                </SheetHeader>
                <div className="grid gap-6 py-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-primary font-mono tracking-wide">
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
                          className={`justify-start ${font.value} text-primary hover:text-primary hover:bg-primary/10 border-primary/30 transition-all duration-300`}
                        >
                          <span className="truncate">{font.name}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-primary font-mono tracking-wide">
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
                          className="flex-1 text-primary hover:text-primary hover:bg-primary/10 border-primary/30 transition-all duration-300 font-mono"
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

      <main className="container max-w-3xl px-4 sm:px-6 pt-32 pb-16 overflow-x-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-primary/60 font-mono">LOADING ARTICLE...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive font-mono font-bold animate-pulse">
              [ERROR] {error}
            </p>
          </div>
        ) : (
          <article
            ref={articleRef}
            className={`${fontSizes[fontSizeIndex]} ${fontFamily} relative max-w-full`}
          >
            <div className="mb-12">
              <h1 className="text-4xl font-bold tracking-tight mb-6 text-primary font-mono animate-pulse">
                {article.title}
              </h1>
              <div className="flex items-center gap-4 text-primary/60 font-mono mb-6">
                <time dateTime={article.pubDate}>
                  {new Date(article.pubDate).toLocaleDateString()}
                </time>
                {article.author && (
                  <>
                    <span className="text-primary/30">|</span>
                    <span>{article.author}</span>
                  </>
                )}
              </div>

              <div className="flex gap-2 mb-8">
                <Button
                  variant={
                    !summary || activeTab === "original" ? "default" : "outline"
                  }
                  onClick={() => setActiveTab("original")}
                  className="flex-1 text-primary hover:text-primary hover:bg-primary/10 border-primary/30 transition-all duration-300 font-mono"
                  disabled={!summary}
                >
                  [Original Content]
                </Button>
                <Button
                  variant={
                    summary && activeTab === "summary" ? "default" : "outline"
                  }
                  onClick={() => setActiveTab("summary")}
                  className="flex-1 text-primary hover:text-primary hover:bg-primary/10 border-primary/30 transition-all duration-300 font-mono"
                  disabled={!summary}
                >
                  [Summary]
                </Button>
              </div>
            </div>

            {activeTab === "summary" && summary ? (
              <div
                className="prose prose-invert max-w-none relative overflow-x-auto"
                dangerouslySetInnerHTML={{
                  __html: formatContent(summary),
                }}
              />
            ) : (
              <div
                className="prose prose-invert max-w-none relative overflow-x-auto"
                dangerouslySetInnerHTML={{
                  __html: formatContent(article.content),
                }}
              />
            )}

            <div className="mt-12 pt-8 border-t border-primary/30">
              <Link
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button
                  className="w-full text-primary hover:text-primary hover:bg-primary/10 border-primary/30 transition-all duration-300 font-mono tracking-wide group"
                  variant="outline"
                >
                  <ExternalLink className="h-4 w-4 mr-2 group-hover:rotate-45 transition-transform" />
                  [Open Original Article]
                </Button>
              </Link>
            </div>
          </article>
        )}
      </main>

      <div className="fixed bottom-6 right-6 flex flex-col gap-4">
        <Button
          onClick={() => {
            setIsChatOpen(true);
          }}
          className="h-12 w-12 shadow-primary/30 bg-background border border-primary/30 text-primary hover:bg-primary/10 transition-all duration-300 group"
          size="icon"
          title="Chat with full article"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
        <Button
          onClick={async () => {
            const data = await fetchFullRssText(article.link, openRouterKey);
            setArticle({
              ...article,
              content: data.content,
            });
          }}
          disabled={fetchingFullText}
          className="h-12 w-12 shadow-primary/30 bg-background border border-primary/30 text-primary hover:bg-primary/10 transition-all duration-300 group"
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
          className="h-12 w-12 shadow-primary/30 bg-background border border-primary/30 text-primary hover:bg-primary/10 transition-all duration-300 group"
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

      <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
        <SheetContent className="bg-background/95 border-primary/30 backdrop-blur-sm w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle className="text-primary font-mono tracking-wider">
              [AI Chat]
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col h-[calc(100%-4rem)] mt-4">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    msg.role === "user"
                      ? "bg-primary/10 text-primary ml-8"
                      : "bg-background/50 text-primary/80 mr-8"
                  }`}
                  dangerouslySetInnerHTML={{
                    __html: marked(msg.content),
                  }}
                />
              ))}
              {chatLoading && (
                <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
              )}
            </div>
            <div className="border-t border-primary/30">
              <textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && !e.shiftKey && handleChatSubmit()
                }
                placeholder="Type your message..."
                className="w-full h-20 p-2 bg-background border border-primary/30 rounded-lg text-primary resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <Button
                onClick={() => handleChatSubmit()}
                disabled={chatLoading || !chatInput}
                className="mt-2 w-full bg-primary text-white hover:bg-primary/90"
              >
                Send
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
