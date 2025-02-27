"use client";

import { Button } from "@/components/ui/button";
import { marked } from "marked";
import { useEffect, useRef } from "react";

export function Article({
  article,
  fontFamily,
  fontSizes,
  fontSizeIndex,
  summary,
  setArticle,
  activeTab,
  setActiveTab,
  setShowSummarizeDialog,
  openRouterKey,
  setError,
  fetchFullRssText,
}) {
  const articleRef = useRef(null);

  const formatContent = (content) => {
    if (!content) return "";
    const modifiedContent = content
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
      .replaceAll(
        /<a /g,
        `<a class="text-primary hover:underline font-medium" onclick="window.handleArticleLink(event)" `
      )
      .replaceAll(/<hr>/g, `<hr class="my-6 border-primary/20">`)
      .replaceAll(/href="http/g, `data-href="http`);

    return modifiedContent;
  };

  useEffect(() => {
    window.handleArticleLink = async (event) => {
      event.preventDefault();
      const link = event.target.closest("a");
      if (!link) return;

      const href = link.getAttribute("data-href");
      if (!href) return;

      try {
        const data = await fetchFullRssText(href, openRouterKey);
        setArticle({
          title: data.title || "External Article",
          content: marked(data.content),
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
      }
    };

    return () => {
      delete window.handleArticleLink;
    };
  }, [openRouterKey]);

  return (
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
            variant={summary && activeTab === "summary" ? "default" : "outline"}
            onClick={() => setShowSummarizeDialog(true)}
            className="flex-1 text-primary hover:text-primary hover:bg-primary/10 border-primary/30 transition-all duration-300 font-mono"
          >
            {summary ? "[Summary]" : "[Generate Summary]"}
          </Button>
        </div>
      </div>

      <div
        className="prose prose-zinc max-w-none"
        dangerouslySetInnerHTML={{
          __html:
            activeTab === "summary" ? summary : formatContent(article.content),
        }}
      />
    </article>
  );
}
