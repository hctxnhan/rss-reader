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
  fetchVideoTranscript,
  fetchYoutubeChannel,
  isYoutubeUrl,
} from "@/lib/youtube-utils";
import { ArrowLeft, FileText, Loader2, Type } from "lucide-react";
import { marked } from "marked";
import Link from "next/link";
import React, { useEffect, useState } from "react";

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

import { Article } from "@/components/article/article";
import { ChatModal } from "@/components/article/chat-modal";
import { SummaryModal } from "@/components/article/summary-modal";

export default function ArticlePage({ params }) {
  const resolvedParams = React.use(params);
  const decodedUrl = decodeURIComponent(resolvedParams.article?.[0]);
  const articleId = parseInt(resolvedParams.article?.[1]);

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
  const [showSummarizeDialog, setShowSummarizeDialog] = useState(false);
  const [selectedPromptId, setSelectedPromptId] = useState(null);
  const [selectedLength, setSelectedLength] = useState("short");
  const [includeArticleContext, setIncludeArticleContext] = useState(false);
  const prompts = localStorage.getItem("prompts")
    ? JSON.parse(localStorage.getItem("prompts"))
    : [];

  useEffect(() => {
    loadArticle();
  }, []);

  async function loadArticle() {
    try {
      setLoading(true);

      console.log(!isNaN(articleId), articleId);

      // Check if this is a direct URL input (not from RSS feed)
      // Direct URLs will have NaN articleId since they don't have a numeric index
      if (isNaN(articleId)) {
        // This is a direct URL input, fetch the full text directly
        const data = await fetchFullRssText(decodedUrl);
        setArticle({
          title: data.title || "External Article",
          content: data.content,
          link: decodedUrl,
          pubDate: new Date().toISOString(),
        });
      } else {
        // This is from an RSS feed, use the regular flow
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
      }
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
      const selectedPrompt = prompts.find((p) => p.id === selectedPromptId);
      const lengthPrefix = `Generate a ${selectedLength} summary. `;
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
                content:
                  lengthPrefix + (selectedPrompt?.content || defaultPrompt),
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
      setShowSummarizeDialog(false);
      setActiveTab("summary");
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

    if (includeArticleContext) {
      newMessages.unshift({
        role: "system",
        content: `${article.title}\n\n${article.content}`,
      });
    }

    // Display messages in UI without the full article context
    const displayMessages = newMessages.map((msg) => {
      if (msg.role === "system" && msg.content.includes(article.content)) {
        return { ...msg, content: "[Article included as context]" };
      }
      return msg;
    });

    setChatMessages(displayMessages);
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
            messages: newMessages, // Send full context including article
          }),
        }
      );
      const data = await response.json();
      setChatMessages([
        ...displayMessages,
        { role: "assistant", content: data.choices[0].message.content },
      ]);
    } catch (err) {
      setError("Failed to get chat response");
    } finally {
      setChatLoading(false);
    }
  }

  useEffect(() => {
    // Add global handler for article links
    window.handleArticleLink = async (event) => {
      event.preventDefault();
      const link = event.target.closest("a");
      if (!link) return;

      const href = link.getAttribute("data-href");
      if (!href) return;

      try {
        setLoading(true);
        const data = await fetchFullRssText(href, openRouterKey);
        setArticle({
          title: data.title || "External Article",
          content: data.content,
          link: href,
          pubDate: new Date().toISOString(),
        });
        window.history.pushState(
          {},
          "",
          `/article/${encodeURIComponent(href)}/0`
        );
      } catch (err) {
        console.error(err);
        setError("Failed to load external article");
      } finally {
        setLoading(false);
      }
    };

    return () => {
      delete window.handleArticleLink;
    };
  }, [openRouterKey]);

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
          <Article
            article={article}
            fontFamily={fontFamily}
            fontSizes={fontSizes}
            fontSizeIndex={fontSizeIndex}
            summary={summary}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            setArticle={setArticle}
            setShowSummarizeDialog={setShowSummarizeDialog}
            openRouterKey={openRouterKey}
            setError={setError}
            fetchFullRssText={fetchFullRssText}
          />
        )}
      </main>

      <SummaryModal
        showSummarizeDialog={showSummarizeDialog}
        setShowSummarizeDialog={setShowSummarizeDialog}
        selectedPromptId={selectedPromptId}
        setSelectedPromptId={setSelectedPromptId}
        selectedLength={selectedLength}
        setSelectedLength={setSelectedLength}
        prompts={prompts}
        summarizing={summarizing}
        summarizeArticle={summarizeArticle}
      />

      <ChatModal
        isChatOpen={isChatOpen}
        setIsChatOpen={setIsChatOpen}
        chatMessages={chatMessages}
        chatInput={chatInput}
        setChatInput={setChatInput}
        chatLoading={chatLoading}
        handleChatSubmit={handleChatSubmit}
        includeArticleContext={includeArticleContext}
        setIncludeArticleContext={setIncludeArticleContext}
      />

      <Button
        onClick={async () => {
          const data = await fetchFullRssText(article.link);
          setArticle({
            ...article,
            content: data.content,
          });
        }}
        disabled={fetchingFullText}
        className="fixed bottom-24 right-6 h-12 w-12 shadow-primary/30 bg-background border border-primary/30 text-primary hover:bg-primary/10 transition-all duration-300 group z-50"
        size="icon"
        title="Fetch and summarize full article"
      >
        {fetchingFullText ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : (
          <FileText className="h-6 w-6" />
        )}
      </Button>
    </div>
  );
}
