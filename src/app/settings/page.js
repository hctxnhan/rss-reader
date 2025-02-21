"use client";

import { Navigation } from "@/components/navigation";
import { useTerminalColor } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchRssFeed } from "@/lib/rss-utils";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function Settings() {
  const [feeds, setFeeds] = useState([]);
  const [newFeedUrl, setNewFeedUrl] = useState("");
  const [openRouterKey, setOpenRouterKey] = useState("");
  const [aiModel, setAiModel] = useState("gpt-3.5-turbo");
  const [defaultPrompt, setDefaultPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("rss");
  const [models, setModels] = useState([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const savedFeeds = localStorage.getItem("rssFeeds");
    const savedKey = localStorage.getItem("openRouterKey");
    const savedModel = localStorage.getItem("aiModel");
    const savedPrompt = localStorage.getItem("defaultPrompt") || "Summarize this article:";

    if (savedFeeds) setFeeds(JSON.parse(savedFeeds));
    if (savedKey) {
      setOpenRouterKey(savedKey);
      fetchModels(savedKey);
    }
    if (savedModel) setAiModel(savedModel);
    if (savedPrompt) setDefaultPrompt(savedPrompt);
  }, []);

  const fetchModels = async (key) => {
    if (!key) return;
    setLoadingModels(true);
    try {
      const response = await fetch("https://openrouter.ai/api/v1/models", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setModels(data.data);
    } catch (error) {
      console.error("Failed to fetch models:", error);
    } finally {
      setLoadingModels(false);
    }
  };

  const sortedAndFilteredModels = models.filter((model) =>
    model.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectModel = (model) => {
    setAiModel(model);
    localStorage.setItem("aiModel", model);
  };

  return (
    <main className="min-h-screen pt-20 bg-black/95">
      <Navigation />

      <div className="max-w-3xl mx-auto">
        <div className="px-4 mb-6">
          <h1 className="text-xl font-bold text-[#0ff] font-mono animate-pulse">
            System Configuration
          </h1>
        </div>

        <div className="border border-[#0ff]/30 rounded-lg overflow-hidden backdrop-blur-sm">
          <div className="border-b border-[#0ff]/30 p-2 flex gap-4">
            <button
              onClick={() => setActiveTab("rss")}
              className={`px-4 py-2 rounded font-mono text-sm transition-colors ${
                activeTab === "rss"
                  ? "bg-[#0ff]/10 text-[#0ff]"
                  : "text-[#0ff]/60 hover:text-[#0ff] hover:bg-[#0ff]/5"
              }`}
            >
              [RSS Feeds]
            </button>
            <button
              onClick={() => setActiveTab("ai")}
              className={`px-4 py-2 rounded font-mono text-sm transition-colors ${
                activeTab === "ai"
                  ? "bg-[#0ff]/10 text-[#0ff]"
                  : "text-[#0ff]/60 hover:text-[#0ff] hover:bg-[#0ff]/5"
              }`}
            >
              [AI Config]
            </button>
          </div>

          <div className="p-6 space-y-6">
            {activeTab === "rss" && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter RSS feed URL"
                    value={newFeedUrl}
                    onChange={(e) => setNewFeedUrl(e.target.value)}
                    className="border-[#0ff]/30 bg-black/50 text-[#0ff] font-mono placeholder:text-[#0ff]/30 focus:border-[#0ff] transition-colors"
                  />
                  <Button
                    onClick={async () => {
                      if (!newFeedUrl) return;
                      setLoading(true);
                      try {
                        const response = await fetchRssFeed(newFeedUrl);
                        const newFeed = {
                          url: newFeedUrl,
                          title: response.feed.title || "Untitled Feed",
                          description: response.feed.description || "",
                        };
                        const updatedFeeds = [...feeds, newFeed];
                        setFeeds(updatedFeeds);
                        localStorage.setItem(
                          "rssFeeds",
                          JSON.stringify(updatedFeeds)
                        );
                        setNewFeedUrl("");
                      } catch (error) {
                        console.error("Failed to add feed:", error);
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                    className="text-[#0ff] bg-transparent hover:bg-[#0ff]/10 transition-all font-mono"
                  >
                    Add
                  </Button>
                </div>

                <div className="space-y-2 mt-4">
                  {feeds.map((feed, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between group p-2 rounded hover:bg-[#0ff]/5 transition-colors"
                    >
                      <span className="text-[#0ff]/80 font-mono truncate">
                        {feed.title || feed.url}
                      </span>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          const updatedFeeds = feeds.filter(
                            (_, i) => i !== index
                          );
                          setFeeds(updatedFeeds);
                          localStorage.setItem(
                            "rssFeeds",
                            JSON.stringify(updatedFeeds)
                          );
                        }}
                        className="text-[#0ff]/60 hover:text-[#0ff] hover:bg-[#0ff]/10 font-mono"
                      >
                        rm
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "ai" && (
              <div className="space-y-8">
                <div className="space-y-2">
                  <Label className="text-[#0ff]/80 font-mono">
                    OpenRouter API Key
                  </Label>
                  <Input
                    type="password"
                    value={openRouterKey}
                    onChange={(e) => {
                      setOpenRouterKey(e.target.value);
                      localStorage.setItem("openRouterKey", e.target.value);
                    }}
                    className="border-[#0ff]/30 bg-black/50 text-[#0ff] font-mono focus:border-[#0ff] transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#0ff]/80 font-mono">
                    Default Prompt
                  </Label>
                  <textarea
                    value={defaultPrompt}
                    onChange={(e) => {
                      setDefaultPrompt(e.target.value);
                      localStorage.setItem("defaultPrompt", e.target.value);
                    }}
                    placeholder="Enter your default prompt template..."
                    className="w-full h-32 p-3 rounded-lg border border-[#0ff]/30 bg-black/50 text-[#0ff] font-mono focus:border-[#0ff] transition-colors placeholder:text-[#0ff]/30 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#0ff]/80 font-mono">
                  Selected Model
                  </Label>

                  <div className="border border-[#0ff]/30 rounded-lg overflow-hidden bg-black/50">
                    <div className="p-3 text-[#0ff]/80 font-mono">
                      {aiModel}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[#0ff]/80 font-mono">
                    Available Models
                  </Label>
                  <Input
                    type="text"
                    placeholder="Search models..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-[#0ff]/30 bg-black/50 text-[#0ff] font-mono focus:border-[#0ff] transition-colors mb-4"
                  />
                  {loadingModels ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-[#0ff]" />
                    </div>
                  ) : sortedAndFilteredModels.length > 0 ? (
                    <div className="border border-[#0ff]/30 rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-[#0ff]/10">
                              <th className="p-3 text-left text-[#0ff] font-mono font-normal border-b border-[#0ff]/30 cursor-pointer hover:bg-[#0ff]/20 transition-colors"></th>
                              <th className="p-3 text-left text-[#0ff] font-mono font-normal border-b border-[#0ff]/30 cursor-pointer hover:bg-[#0ff]/20 transition-colors">
                                Model
                              </th>
                              <th className="p-3 text-left text-[#0ff] font-mono font-normal border-b border-[#0ff]/30 cursor-pointer hover:bg-[#0ff]/20 transition-colors">
                                Input (1M tokens)
                              </th>
                              <th className="p-3 text-left text-[#0ff] font-mono font-normal border-b border-[#0ff]/30 cursor-pointer hover:bg-[#0ff]/20 transition-colors">
                                Output (1M tokens){" "}
                              </th>
                              <th className="p-3 text-left text-[#0ff] font-mono font-normal border-b border-[#0ff]/30 cursor-pointer hover:bg-[#0ff]/20 transition-colors">
                                Context Length{" "}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {sortedAndFilteredModels.map((model) => (
                              <tr
                                key={model.id}
                                className="hover:bg-[#0ff]/5 transition-colors"
                              >
                                <td className="p-3 text-[#0ff]/80 font-mono border-b border-[#0ff]/10">
                                  <Button
                                    variant="ghost"
                                    onClick={() => {
                                      selectModel(model.id);
                                    }}
                                    className="text-[#0ff]/60 hover:text-[#0ff] hover:bg-[#0ff]/10 font-mono"
                                  >
                                    Select
                                  </Button>
                                </td>
                                <td className="p-3 text-[#0ff]/80 font-mono border-b border-[#0ff]/10">
                                  {model.name}
                                </td>
                                <td className="p-3 text-[#0ff]/80 font-mono border-b border-[#0ff]/10">
                                  ${(model.pricing.prompt * 1000000).toFixed(4)}
                                </td>
                                <td className="p-3 text-[#0ff]/80 font-mono border-b border-[#0ff]/10">
                                  $
                                  {(model.pricing.completion * 1000000).toFixed(
                                    4
                                  )}
                                </td>
                                <td className="p-3 text-[#0ff]/80 font-mono border-b border-[#0ff]/10">
                                  {model.context_length.toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : openRouterKey ? (
                    <div className="text-[#0ff]/60 font-mono p-4 border border-[#0ff]/30 rounded-lg bg-black/50">
                      No models available. Please check your API key.
                    </div>
                  ) : (
                    <div className="text-[#0ff]/60 font-mono p-4 border border-[#0ff]/30 rounded-lg bg-black/50">
                      Enter your OpenRouter API key to view available models.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
