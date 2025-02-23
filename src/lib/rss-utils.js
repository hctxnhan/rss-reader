import axios from "axios";
import { Readability } from "@mozilla/readability";

export async function fetchRssFeed(url) {
  console.log("test");
  const response = await axios.get("/api/rss", {
    params: {
      url: url,
    },
  });
  return response.data;
}

export async function fetchFullRssText(targetUrl, openRouterKey) {
  try {
    const response = await axios.get("/api/rss/fullText", {
      params: {
        url: targetUrl,
        openRouterKey,
      },
    });

    return response.data;
  } catch (err) {
    console.error("Full text fetch error:", err);
    throw new Error("Failed to fetch and summarize full article");
  }
}
