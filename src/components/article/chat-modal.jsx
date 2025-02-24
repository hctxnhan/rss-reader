"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MessageSquare, Loader2 } from "lucide-react";

export function ChatModal({
  isChatOpen,
  setIsChatOpen,
  chatMessages,
  chatInput,
  setChatInput,
  chatLoading,
  handleChatSubmit,
  includeArticleContext,
  setIncludeArticleContext,
}) {
  return (
    <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed bottom-6 right-6 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all duration-300"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md bg-background/95 border-primary/30 backdrop-blur-sm">
        <SheetHeader>
          <SheetTitle className="text-primary font-mono tracking-wider">
            [Chat with AI]
          </SheetTitle>
        </SheetHeader>

        <div className="mt-8 flex flex-col h-[calc(100vh-10rem)]">
          <div className="flex items-center gap-2 mb-4">
            <Switch
              id="article-context"
              checked={includeArticleContext}
              onCheckedChange={setIncludeArticleContext}
            />
            <Label htmlFor="article-context" className="text-primary/80 font-mono">
              Include article context
            </Label>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {chatMessages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-primary/10 text-primary"} font-mono text-sm`}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 border-primary/30 bg-background/50 text-primary font-mono placeholder:text-primary/30 focus:border-primary transition-colors"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleChatSubmit();
                }
              }}
            />
            <Button
              onClick={handleChatSubmit}
              disabled={chatLoading}
              className="text-primary hover:text-primary hover:bg-primary/10 border border-primary/30 hover:border-primary transition-all duration-300 font-mono"
            >
              {chatLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Send"
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}