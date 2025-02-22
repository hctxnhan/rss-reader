"use client";

import { Navigation } from "@/components/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, User } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchRssFeed } from "@/lib/rss-utils";
import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { fetchYoutubeChannel, isYoutubeUrl } from "@/lib/youtube-utils";

const ITEMS_PER_PAGE = 100;

export default function FeedPage({ params }) {
  const decodedUrl = decodeURIComponent(React.use(params).url);
  const [feed, setFeed] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadFeed();
  }, []);

  async function loadFeed() {
    try {
      setLoading(true);
      let data;
      if (!isYoutubeUrl(decodedUrl)) {
        data = await fetchRssFeed(decodedUrl);
      } else {
        data = await fetchYoutubeChannel(decodedUrl);
      }
      setFeed(data);
    } catch (err) {
      setError("Failed to load feed");
    } finally {
      setLoading(false);
    }
  }

  const totalPages = feed?.items
    ? Math.ceil(feed.items.length / ITEMS_PER_PAGE)
    : 0;
  const currentItems = feed?.items?.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );
  return (
    <main className="min-h-screen pb-8 pt-20 bg-background">
      <Navigation />

      <div className="container max-w-2xl px-4">
        <div className="flex flex-col gap-4 mb-8">
          <div>
            <Link href="/">
              <Button
                variant="ghost"
                size="icon"
                className="text-primary hover:text-primary hover:bg-primary/10 transition-all duration-300"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
          </div>
          <div className="relative">
            <h1 className="text-2xl font-bold mb-2 text-primary font-mono tracking-wider animate-pulse break-words">
              {feed?.feed?.title || "Initializing feed..."}
            </h1>
            {feed?.feed?.description && (
              <p className="text-primary/60 text-sm font-mono break-words">
                {feed.feed.description}
              </p>
            )}
            <div className="absolute -inset-1 bg-primary/20 blur opacity-30 group-hover:opacity-100 transition duration-300" />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-primary/60 font-mono">LOADING FEED DATA...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive font-mono font-bold animate-pulse">
              [ERROR] {error}
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3 mb-8">
              {currentItems?.map((item, index) => (
                <Link
                  key={index}
                  href={`/article/${encodeURIComponent(decodedUrl)}/${index}`}
                >
                  <Card className="group rounded-none transition-all hover:shadow-primary/30 hover:border-primary bg-background/50 border-primary/30 backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJzY2FubGluZXMiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjIiPjxsaW5lIHgxPSIwIiB5MT0iMCIgeDI9IjEwMCUiIHkyPSIwIiBzdHJva2U9ImhzbCh2YXIoLS1wcmltYXJ5KSkiIHN0cm9rZS1vcGFjaXR5PSIwLjAyIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjc2NhbmxpbmVzKSIvPjwvc3ZnPg==')]" />
                    <CardHeader className="space-y-3 relative">
                      <CardTitle className="group-hover:text-primary transition-colors font-mono tracking-wide">
                        {item.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 text-primary/60 font-mono">
                        {item.description}
                      </CardDescription>
                      <div className="flex items-center gap-3 text-sm text-primary/40 font-mono">
                        {item.author && (
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{item.author}</span>
                          </div>
                        )}
                        <time dateTime={item.pubDate} className="font-mono">
                          {new Date(item.pubDate).toLocaleDateString()}
                        </time>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>

            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="text-primary hover:bg-primary/10 border-primary/30 disabled:opacity-50 font-mono"
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink className="text-primary font-mono border-primary/30 hover:bg-primary/10">
                    {page} / {totalPages}
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="text-primary hover:bg-primary/10 border-primary/30 disabled:opacity-50 font-mono"
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </>
        )}
      </div>
    </main>
  );
}
