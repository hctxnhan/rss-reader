import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

export function FeedCard({ feed, topic, index }) {
  return (
    <Link
      key={`${topic}-${index}`}
      href={`/feed/${encodeURIComponent(feed.url)}`}
    >
      <Card className="rounded-none group transition-all hover:shadow-primary/30 hover:border-primary bg-background/50 border-primary/30 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJzY2FubGluZXMiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjIiPjxsaW5lIHgxPSIwIiB5MT0iMCIgeDI9IjEwMCUiIHkyPSIwIiBzdHJva2U9ImhzbCh2YXIoLS1wcmltYXJ5KSkiIHN0cm9rZS1vcGFjaXR5PSIwLjAyIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjc2NhbmxpbmVzKSIvPjwvc3ZnPg==')]" />
        <CardHeader>
          <div className="flex items-start justify-between relative">
            <div className="space-y-1">
              <CardTitle className="group-hover:text-primary transition-colors font-mono tracking-wide">
                <span className="opacity-50 mr-2">$</span>
                {feed.title || "Untitled Feed"}
              </CardTitle>
              <CardDescription className="line-clamp-2 text-primary/60 font-mono">
                {feed.description || feed.url}
              </CardDescription>
            </div>
            <ExternalLink className="h-4 w-4 text-primary/40 opacity-0 group-hover:opacity-100 transition-opacity group-hover:rotate-45 transition-transform" />
          </div>
          <div className="flex items-center gap-2 mt-4">
            <Badge
              variant="secondary"
              className="font-normal bg-primary/10 text-primary font-mono hover:bg-primary/20 transition-colors"
            >
              RSS Feed
            </Badge>
            {feed.category && (
              <Badge
                variant="outline"
                className="font-normal border-primary/30 text-primary/60 font-mono hover:border-primary/60 transition-colors"
              >
                {feed.category}
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}