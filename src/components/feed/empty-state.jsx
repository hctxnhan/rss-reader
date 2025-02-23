import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Newspaper, Plus } from "lucide-react";
import Link from "next/link";

export function EmptyState() {
  return (
    <Card className="border-2 border-dashed border-primary/30 bg-background/50 backdrop-blur-sm relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJzY2FubGluZXMiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjIiPjxsaW5lIHgxPSIwIiB5MT0iMCIgeDI9IjEwMCUiIHkyPSIwIiBzdHJva2U9ImhzbCh2YXIoLS1wcmltYXJ5KSkiIHN0cm9rZS1vcGFjaXR5PSIwLjAyIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjc2NhbmxpbmVzKSIvPjwvc3ZnPg==')]" />
      <CardContent className="flex flex-col items-center justify-center py-12 gap-4 relative">
        <div className="rounded-full bg-primary/10 p-4 group hover:bg-primary/20 transition-all duration-300">
          <Newspaper className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
        </div>
        <div className="text-center">
          <h3 className="font-semibold text-lg mb-2 text-primary font-mono">
            [ERROR] No feeds found
          </h3>
          <p className="text-primary/60 mb-4 font-mono">
            <span className="opacity-50">$</span> Initialize your feed collection
          </p>
          <Link href="/settings">
            <Button className="font-medium border-primary/30 bg-background hover:bg-primary/10 text-primary hover:shadow-primary/30 transition-all duration-300 group font-mono tracking-wide">
              <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform" />
              Add Your First Feed
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}