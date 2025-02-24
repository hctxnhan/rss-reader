"use client";

import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchRssFeed } from "@/lib/rss-utils";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { defaultPrompt as utilDefaultPrompt } from "@/lib/utils";
import { fetchYoutubeChannel, isYoutubeUrl } from "@/lib/youtube-utils";
export default function Settings() {
  const [feeds, setFeeds] = useState([]);
  const [newFeedUrl, setNewFeedUrl] = useState("");
  const [openRouterKey, setOpenRouterKey] = useState("");
  const [aiModel, setAiModel] = useState("gpt-3.5-turbo");
  const [prompts, setPrompts] = useState([]);
  const [selectedPromptId, setSelectedPromptId] = useState(null);
  const [newPromptName, setNewPromptName] = useState("");
  const [newPromptContent, setNewPromptContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("rss");
  const [models, setModels] = useState([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const savedFeeds = localStorage.getItem("rssFeeds");
    const savedKey = localStorage.getItem("openRouterKey");
    const savedModel = localStorage.getItem("aiModel");
    const savedPrompts = localStorage.getItem("prompts");
    const savedSelectedPromptId = localStorage.getItem("selectedPromptId");

    if (savedFeeds) setFeeds(JSON.parse(savedFeeds));
    if (savedKey) {
      setOpenRouterKey(savedKey);
      fetchModels(savedKey);
    }
    if (savedModel) setAiModel(savedModel);
    if (savedPrompts) {
      const parsedPrompts = JSON.parse(savedPrompts);
      setPrompts(parsedPrompts);
      if (savedSelectedPromptId) {
        setSelectedPromptId(savedSelectedPromptId);
      } else if (parsedPrompts.length > 0) {
        setSelectedPromptId(parsedPrompts[0].id);
      }
    } else {
      // Initialize with default prompt
      const defaultPromptObj = {
        id: "default",
        name: "Default Prompt",
        content: utilDefaultPrompt,
      };
      setPrompts([defaultPromptObj]);
      setSelectedPromptId("default");
      localStorage.setItem("prompts", JSON.stringify([defaultPromptObj]));
      localStorage.setItem("selectedPromptId", "default");
    }
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

  const addFeed = async () => {
    if (loading) return;
    setLoading(true);
    try {
      let feed;
      if (isYoutubeUrl(newFeedUrl)) {
        feed = await fetchYoutubeChannel(newFeedUrl);
      } else {
        feed = await fetchRssFeed(newFeedUrl);
      }
      if (feed) {
        setFeeds([
          ...feeds,
          {
            title: feed.title,
            url: feed.url,
            description: feed.description,
            type: isYoutubeUrl(newFeedUrl) ? "youtube" : "rss",
          },
        ]);
        localStorage.setItem("rssFeeds", JSON.stringify([...feeds, feed]));
      }
    } catch (error) {
      console.error("Failed to add feed:", error);
    } finally {
      setLoading(false);
      setNewFeedUrl("");
    }
  };

  return (
    <main className="min-h-screen pt-20 bg-background">
      <Navigation />

      <div className="max-w-3xl mx-auto">
        <div className="px-4 mb-6">
          <h1 className="text-xl font-bold text-primary font-mono animate-pulse">
            System Configuration
          </h1>
        </div>

        <div className="border border-primary/30 rounded-lg overflow-hidden backdrop-blur-sm">
          <div className="border-b border-primary/30 p-2 flex gap-4">
            <button
              onClick={() => setActiveTab("rss")}
              className={`px-4 py-2 rounded font-mono text-sm transition-colors ${
                activeTab === "rss"
                  ? "bg-primary/10 text-primary"
                  : "text-primary/60 hover:text-primary hover:bg-primary/5"
              }`}
            >
              [Feeds]
            </button>
            <button
              onClick={() => setActiveTab("ai")}
              className={`px-4 py-2 rounded font-mono text-sm transition-colors ${
                activeTab === "ai"
                  ? "bg-primary/10 text-primary"
                  : "text-primary/60 hover:text-primary hover:bg-primary/5"
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
                    placeholder="Enter RSS feed URL or YouTube channel URL"
                    value={newFeedUrl}
                    onChange={(e) => setNewFeedUrl(e.target.value)}
                    className="border-primary/30 bg-background/50 text-primary font-mono placeholder:text-primary/30 focus:border-primary transition-colors"
                  />
                  <Button
                    onClick={addFeed}
                    disabled={loading}
                    className="text-primary bg-transparent hover:bg-primary/10 transition-all font-mono"
                  >
                    Add
                  </Button>
                </div>

                <div className="space-y-2 mt-4">
                  {feeds.map((feed, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between group p-2 rounded hover:bg-primary/5 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-primary/60 font-mono text-sm">
                          [{feed.type || "rss"}]
                        </span>
                        <span className="text-primary/80 font-mono truncate">
                          {feed.title || feed.url}
                        </span>
                      </div>
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
                        className="text-primary/60 hover:text-primary hover:bg-primary/10 font-mono"
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
                  <Label className="text-primary/80 font-mono">
                    OpenRouter API Key
                  </Label>
                  <Input
                    type="password"
                    value={openRouterKey}
                    onChange={(e) => {
                      setOpenRouterKey(e.target.value);
                      localStorage.setItem("openRouterKey", e.target.value);
                    }}
                    className="border-primary/30 bg-background/50 text-primary font-mono focus:border-primary transition-colors"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-primary/80 font-mono">Prompts</Label>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        const newPrompt = {
                          id: Date.now().toString(),
                          name: newPromptName || "New Prompt",
                          content: newPromptContent || utilDefaultPrompt,
                        };
                        const updatedPrompts = [...prompts, newPrompt];
                        setPrompts(updatedPrompts);
                        setSelectedPromptId(newPrompt.id);
                        localStorage.setItem(
                          "prompts",
                          JSON.stringify(updatedPrompts)
                        );
                        localStorage.setItem("selectedPromptId", newPrompt.id);
                        setNewPromptName("");
                        setNewPromptContent("");
                      }}
                      className="text-primary/60 hover:text-primary hover:bg-primary/10 font-mono text-sm"
                    >
                      Add New
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Prompt name"
                        value={newPromptName}
                        onChange={(e) => setNewPromptName(e.target.value)}
                        className="border-primary/30 bg-background/50 text-primary font-mono placeholder:text-primary/30 focus:border-primary transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      {prompts.map((prompt) => (
                        <div
                          key={prompt.id}
                          className={`p-3 rounded-lg border ${
                            selectedPromptId === prompt.id
                              ? "border-primary"
                              : "border-primary/30"
                          } bg-background/50 hover:border-primary transition-colors cursor-pointer`}
                          onClick={() => {
                            setSelectedPromptId(prompt.id);
                            localStorage.setItem("selectedPromptId", prompt.id);
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-primary font-mono">
                              {prompt.name}
                            </span>
                            {prompt.id !== "default" && (
                              <Button
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const updatedPrompts = prompts.filter(
                                    (p) => p.id !== prompt.id
                                  );
                                  setPrompts(updatedPrompts);
                                  if (selectedPromptId === prompt.id) {
                                    const newSelectedId =
                                      updatedPrompts[0]?.id || null;
                                    setSelectedPromptId(newSelectedId);
                                    localStorage.setItem(
                                      "selectedPromptId",
                                      newSelectedId
                                    );
                                  }
                                  localStorage.setItem(
                                    "prompts",
                                    JSON.stringify(updatedPrompts)
                                  );
                                }}
                                className="text-primary/60 hover:text-primary hover:bg-primary/10 font-mono"
                              >
                                rm
                              </Button>
                            )}
                          </div>
                          <textarea
                            value={prompt.content}
                            onChange={(e) => {
                              const updatedPrompts = prompts.map((p) =>
                                p.id === prompt.id
                                  ? { ...p, content: e.target.value }
                                  : p
                              );
                              setPrompts(updatedPrompts);
                              localStorage.setItem(
                                "prompts",
                                JSON.stringify(updatedPrompts)
                              );
                            }}
                            placeholder="Enter your prompt template..."
                            className="w-full h-32 p-3 rounded-lg border border-primary/30 bg-background/50 text-primary font-mono focus:border-primary transition-colors placeholder:text-primary/30 resize-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-primary/80 font-mono">
                    Selected Model
                  </Label>

                  <div className="border border-primary/30 rounded-lg overflow-hidden bg-background/50">
                    <div className="p-3 text-primary/80 font-mono">
                      {aiModel}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-primary/80 font-mono">
                    Available Models
                  </Label>
                  <Input
                    type="text"
                    placeholder="Search models..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-primary/30 bg-background/50 text-primary font-mono focus:border-primary transition-colors mb-4"
                  />
                  {loadingModels ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : sortedAndFilteredModels.length > 0 ? (
                    <div className="border border-primary/30 rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-primary/10">
                              <th className="p-3 text-left text-primary font-mono font-normal border-b border-primary/30 cursor-pointer hover:bg-primary/20 transition-colors"></th>
                              <th className="p-3 text-left text-primary font-mono font-normal border-b border-primary/30 cursor-pointer hover:bg-primary/20 transition-colors">
                                Model
                              </th>
                              <th className="p-3 text-left text-primary font-mono font-normal border-b border-primary/30 cursor-pointer hover:bg-primary/20 transition-colors">
                                Input (1M tokens)
                              </th>
                              <th className="p-3 text-left text-primary font-mono font-normal border-b border-primary/30 cursor-pointer hover:bg-primary/20 transition-colors">
                                Output (1M tokens)
                              </th>
                              <th className="p-3 text-left text-primary font-mono font-normal border-b border-primary/30 cursor-pointer hover:bg-primary/20 transition-colors">
                                Context Length
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {sortedAndFilteredModels.map((model) => (
                              <tr
                                key={model.id}
                                className="hover:bg-primary/5 transition-colors"
                              >
                                <td className="p-3 text-primary/80 font-mono border-b border-primary/10">
                                  <Button
                                    variant="ghost"
                                    onClick={() => {
                                      selectModel(model.id);
                                    }}
                                    className="text-primary/60 hover:text-primary hover:bg-primary/10 font-mono"
                                  >
                                    Select
                                  </Button>
                                </td>
                                <td className="p-3 text-primary/80 font-mono border-b border-primary/10">
                                  {model.name}
                                </td>
                                <td className="p-3 text-primary/80 font-mono border-b border-primary/10">
                                  ${(model.pricing.prompt * 1000000).toFixed(4)}
                                </td>
                                <td className="p-3 text-primary/80 font-mono border-b border-primary/10">
                                  $
                                  {(model.pricing.completion * 1000000).toFixed(
                                    4
                                  )}
                                </td>
                                <td className="p-3 text-primary/80 font-mono border-b border-primary/10">
                                  {model.context_length.toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : openRouterKey ? (
                    <div className="text-primary/60 font-mono p-4 border border-primary/30 rounded-lg bg-background/50">
                      No models available. Please check your API key.
                    </div>
                  ) : (
                    <div className="text-primary/60 font-mono p-4 border border-primary/30 rounded-lg bg-background/50">
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
