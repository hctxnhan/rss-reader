import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const defaultPrompt = `You are author of the article that help me to read this article in less time but still effective and understand everything, use less jargon, explain abstract term and keep the main topic of the article, without abusing bullet point or over summarize or simply. Keep every important detail with refinement.

      Preserve each section main topic and also preserve image.
      
      Return in markdown format without explaining any else. Just pure markdown.`