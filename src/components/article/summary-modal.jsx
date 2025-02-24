"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export function SummaryModal({
  showSummarizeDialog,
  setShowSummarizeDialog,
  selectedPromptId,
  setSelectedPromptId,
  selectedLength,
  setSelectedLength,
  prompts,
  summarizing,
  summarizeArticle,
}) {
  return (
    <Dialog open={showSummarizeDialog} onOpenChange={setShowSummarizeDialog}>
      <DialogContent className="bg-background/95 border-primary/30 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-primary font-mono tracking-wider">
            [Summary Configuration]
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-4">
            <Label className="text-primary/80 font-mono">Summary Length</Label>
            <RadioGroup
              value={selectedLength}
              onValueChange={setSelectedLength}
              className="grid grid-cols-3 gap-4"
            >
              <div>
                <RadioGroupItem
                  value="short"
                  id="short"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="short"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-primary/30 bg-background p-4 hover:bg-primary/10 hover:border-primary [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/10 cursor-pointer"
                >
                  <span className="text-primary/80 font-mono">Short</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="medium"
                  id="medium"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="medium"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-primary/30 bg-background p-4 hover:bg-primary/10 hover:border-primary [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/10 cursor-pointer"
                >
                  <span className="text-primary/80 font-mono">Medium</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="long"
                  id="long"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="long"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-primary/30 bg-background p-4 hover:bg-primary/10 hover:border-primary [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/10 cursor-pointer"
                >
                  <span className="text-primary/80 font-mono">Long</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="detailed long"
                  id="detailed-long"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="detailed-long"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-primary/30 bg-background p-4 hover:bg-primary/10 hover:border-primary [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/10 cursor-pointer"
                >
                  <span className="text-primary/80 font-mono">
                    Detailed Long
                  </span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <Label className="text-primary/80 font-mono">Summary Style</Label>
            <Select
              value={selectedPromptId}
              onValueChange={setSelectedPromptId}
            >
              <SelectTrigger className="w-full border-primary/30 bg-background/50 text-primary font-mono focus:border-primary transition-colors">
                <SelectValue placeholder="Select a prompt style" />
              </SelectTrigger>
              <SelectContent className="bg-background/95 border-primary/30 backdrop-blur-sm">
                {prompts.map((prompt) => (
                  <SelectItem
                    key={prompt.id}
                    value={prompt.id}
                    className="text-primary/80 font-mono hover:text-primary hover:bg-primary/10"
                  >
                    {prompt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={summarizeArticle}
            disabled={summarizing}
            className="w-full text-primary hover:text-primary hover:bg-primary/10 border border-primary/30 hover:border-primary transition-all duration-300 font-mono"
          >
            {summarizing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Summary...
              </>
            ) : (
              "Generate Summary"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
