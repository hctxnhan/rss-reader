import axios from "axios";

export async function fetchYoutubeChannel(channelUrl) {
  try {
    const response = await axios.get("/api/youtube/channel", {
      params: {
        url: channelUrl,
      },
    });
    return response.data;
  } catch (err) {
    console.error("YouTube channel fetch error:", err);
    throw new Error("Failed to fetch YouTube channel data");
  }
}

export async function fetchVideoTranscript(videoId) {
  try {
    const response = await axios.get("/api/youtube/transcript", {
      params: {
        videoId,
      },
    });
    return response.data;
  } catch (err) {
    console.error("Video transcript fetch error:", err);
    throw new Error("Failed to fetch video transcript");
  }
}

export function isYoutubeUrl(url) {
  return url.includes("youtube.com") || url.includes("youtu.be");
}

export function extractVideoId(url) {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}
