"use client";

import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { LoadingState } from "@/components/feed/loading-state";
import { EmptyState } from "@/components/feed/empty-state";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FeedCard } from "@/components/feed/feed-card";

export default function Home() {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [url, setUrl] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchDefaultFeeds = async () => {
      try {
        const response = await fetch(
          "https://api.jsonsilo.com/public/064164f5-6907-4fd5-92d6-32a0bd63eb4f"
        );
        const defaultFeeds = await response.json();

        // Get user defined feeds from localStorage
        const savedFeeds = localStorage.getItem("rssFeeds");
        const userFeeds = savedFeeds
          ? JSON.parse(savedFeeds).map((feed) => ({
              ...feed,
              topic: "User Defined",
            }))
          : [];

        // Combine default and user feeds
        setFeeds([...defaultFeeds, ...userFeeds]);
      } catch (error) {
        console.error("Error fetching default feeds:", error);
        // If fetch fails, fall back to local feeds only
        const savedFeeds = localStorage.getItem("rssFeeds");
        if (savedFeeds) {
          setFeeds(
            JSON.parse(savedFeeds).map((feed) => ({
              ...feed,
              topic: "User Defined",
            }))
          );
        }
      }
      setLoading(false);
    };

    // Simulate loading for smoother transition
    setTimeout(fetchDefaultFeeds, 500);
  }, []);

  // Group feeds by topic
  const feedsByTopic = feeds.reduce((acc, feed) => {
    const topic = feed.topic || "Uncategorized";
    if (!acc[topic]) acc[topic] = [];
    acc[topic].push(feed);
    return acc;
  }, {});

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (url) {
      router.push(`/article/${encodeURIComponent(url)}`);
    }
  };

  return (
    <div className="relative min-h-screen bg-background">
      <Navigation />

      <main className="container max-w-2xl px-4 pt-20 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2 text-primary font-mono animate-pulse">
              [~/feeds]$
            </h1>
            <p className="text-primary/60 font-mono">
              <span className="opacity-50">$</span> cat welcome.txt
            </p>
          </div>

          <Link href="/settings">
            <Button className="bg-transparent font-mono font-medium text-primary hover:bg-primary/10 border border-primary/30 hover:border-primary hover:text-primary hover:shadow-primary/30 transition-all duration-300 group">
              <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform" />
              <span className="tracking-wide">Add Feed</span>
            </Button>
          </Link>
        </div>

        {loading ? (
          <LoadingState />
        ) : feeds.length === 0 ? (
          <EmptyState />
        ) : (
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="grid gap-4">
              <Accordion type="single" collapsible className="w-full">
                {Object.entries(feedsByTopic).map(([topic, topicFeeds]) => (
                  <AccordionItem key={topic} value={topic}>
                    <AccordionTrigger className="text-primary font-mono">
                      {topic}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid gap-4 pt-2">
                        {topicFeeds.map((feed, index) => (
                          <FeedCard
                            key={`${topic}-${index}`}
                            feed={feed}
                            topic={topic}
                            index={index}
                          />
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </ScrollArea>
        )}
      </main>

      {/* Floating button and modal */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 p-4 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300"
      >
        <Plus className="h-6 w-6" />
      </button>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Article URL</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUrlSubmit} className="space-y-4">
            <Input
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              type="url"
              required
            />
            <Button type="submit" className="w-full">
              Go to Article
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
