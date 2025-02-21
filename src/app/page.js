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
import { Plus, Loader2, Newspaper, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for smoother transition
    setTimeout(() => {
      const savedFeeds = localStorage.getItem("rssFeeds");
      if (savedFeeds) {
        setFeeds(JSON.parse(savedFeeds));
      }
      setLoading(false);
    }, 500);
  }, []);

  return (
    <div className="relative min-h-screen bg-black">
      <Navigation />

      <main className="container max-w-2xl px-4 pt-20 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2 text-[#0ff] font-mono animate-pulse">
              [~/feeds]$
            </h1>
            <p className="text-[#0ff]/60 font-mono">
              <span className="opacity-50">$</span> cat welcome.txt
            </p>
          </div>

          <Link href="/settings">
            <Button className="bg-transparent font-mono font-medium text-[#0ff] hover:bg-[#0ff]/10 border border-[#0ff]/30 hover:border-[#0ff] hover:text-[#0ff] hover:shadow-[0_0_15px_rgba(0,255,255,0.3)] transition-all duration-300 group">
              <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform" />
              <span className="tracking-wide">Add Feed</span>
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-[#0ff]" />
            <p className="text-[#0ff]/60 font-mono">
              INITIALIZING FEED DATABASE...
            </p>
          </div>
        ) : feeds.length === 0 ? (
          <Card className="border-2 border-dashed border-[#0ff]/30 bg-black/50 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJzY2FubGluZXMiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjIiPjxsaW5lIHgxPSIwIiB5MT0iMCIgeDI9IjEwMCUiIHkyPSIwIiBzdHJva2U9IiMwZmYiIHN0cm9rZS1vcGFjaXR5PSIwLjAyIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjc2NhbmxpbmVzKSIvPjwvc3ZnPg==')]" />
            <CardContent className="flex flex-col items-center justify-center py-12 gap-4 relative">
              <div className="rounded-full bg-[#0ff]/10 p-4 group hover:bg-[#0ff]/20 transition-all duration-300">
                <Newspaper className="h-8 w-8 text-[#0ff] group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-lg mb-2 text-[#0ff] font-mono">
                  [ERROR] No feeds found
                </h3>
                <p className="text-[#0ff]/60 mb-4 font-mono">
                  <span className="opacity-50">$</span> Initialize your feed
                  collection
                </p>
                <Link href="/settings">
                  <Button className="font-medium border-[#0ff]/30 bg-black hover:bg-[#0ff]/10 text-[#0ff] hover:shadow-[0_0_15px_rgba(0,255,255,0.3)] transition-all duration-300 group font-mono tracking-wide">
                    <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform" />
                    Add Your First Feed
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="grid gap-4">
              {feeds.map((feed, index) => (
                <Link
                  key={index}
                  href={`/feed/${encodeURIComponent(feed.url)}`}
                >
                  <Card className="rounded-none group transition-all hover:shadow-[0_0_15px_rgba(0,255,255,0.3)] hover:border-[#0ff] bg-black/50 border-[#0ff]/30 backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0ff]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJzY2FubGluZXMiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjIiPjxsaW5lIHgxPSIwIiB5MT0iMCIgeDI9IjEwMCUiIHkyPSIwIiBzdHJva2U9IiMwZmYiIHN0cm9rZS1vcGFjaXR5PSIwLjAyIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjc2NhbmxpbmVzKSIvPjwvc3ZnPg==')]" />
                    <CardHeader>
                      <div className="flex items-start justify-between relative">
                        <div className="space-y-1">
                          <CardTitle className="group-hover:text-[#0ff] transition-colors font-mono tracking-wide">
                            <span className="opacity-50 mr-2">$</span>
                            {feed.title || "Untitled Feed"}
                          </CardTitle>
                          <CardDescription className="line-clamp-2 text-[#0ff]/60 font-mono">
                            {feed.description || feed.url}
                          </CardDescription>
                        </div>
                        <ExternalLink className="h-4 w-4 text-[#0ff]/40 opacity-0 group-hover:opacity-100 transition-opacity group-hover:rotate-45 transition-transform" />
                      </div>
                      <div className="flex items-center gap-2 mt-4">
                        <Badge
                          variant="secondary"
                          className="font-normal bg-[#0ff]/10 text-[#0ff] font-mono hover:bg-[#0ff]/20 transition-colors"
                        >
                          RSS Feed
                        </Badge>
                        {feed.category && (
                          <Badge
                            variant="outline"
                            className="font-normal border-[#0ff]/30 text-[#0ff]/60 font-mono hover:border-[#0ff]/60 transition-colors"
                          >
                            {feed.category}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </ScrollArea>
        )}
      </main>
    </div>
  );
}
