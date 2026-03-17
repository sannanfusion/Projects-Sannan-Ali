import { useState } from "react";
import { Download, Link2, Video, Loader2, AlertCircle, CheckCircle2, Music, Play } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

interface VideoInfo {
  videoId: string;
  title: string;
  thumbnail: string;
  author: string;
}

type Quality = "144" | "240" | "360" | "480" | "720" | "1080" | "1440" | "2160" | "audio";

const qualities: { label: string; value: Quality; badge?: string }[] = [
  { label: "144p", value: "144" },
  { label: "240p", value: "240" },
  { label: "360p", value: "360" },
  { label: "480p", value: "480" },
  { label: "720p", value: "720", badge: "HD" },
  { label: "1080p", value: "1080", badge: "FHD" },
  { label: "1440p", value: "1440", badge: "2K" },
  { label: "4K", value: "2160", badge: "UHD" },
  { label: "Audio Only", value: "audio" },
];

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export default function YoutubeDownloader() {
  const [url, setUrl] = useState("");
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [selectedQuality, setSelectedQuality] = useState<Quality>("720");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const fetchVideoInfo = async () => {
    setError("");
    setVideoInfo(null);
    setDownloadSuccess(false);

    const trimmed = url.trim();
    if (!trimmed) {
      setError("Please enter a YouTube URL.");
      return;
    }

    const videoId = extractVideoId(trimmed);
    if (!videoId) {
      setError("Invalid YouTube URL. Please check and try again.");
      return;
    }

    setLoading(true);
    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
      const res = await fetch(oembedUrl);
      if (!res.ok) throw new Error("Could not fetch video info.");
      const data = await res.json();

      setVideoInfo({
        videoId,
        title: data.title,
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        author: data.author_name,
      });
    } catch {
      setError("Could not fetch video details. Please check the URL.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!videoInfo) return;
    setDownloading(true);
    setDownloadSuccess(false);
    setError("");

    try {
      const isAudio = selectedQuality === "audio";
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const fnUrl = `https://${projectId}.supabase.co/functions/v1/youtube-download`;

      const res = await fetch(fnUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": anonKey,
        },
        body: JSON.stringify({
          videoId: videoInfo.videoId,
          quality: selectedQuality,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        const err = data.error || "Download failed.";
        if (data.rapidApiUrl) {
          window.open(data.rapidApiUrl, "_blank");
        }
        throw new Error(err);
      }

      if (data.url) {
        // Open the stream URL in a new tab so the browser handles the download
        window.open(data.url, "_blank");

        // If it's a video-only stream (no embedded audio), also open audio separately
        if (data.videoOnly && data.audioUrl) {
          setTimeout(() => {
            window.open(data.audioUrl, "_blank");
          }, 800);
          setError("This quality has separate video & audio tracks — both tabs opened. Merge them with a tool like FFmpeg if needed.");
        }

        setDownloadSuccess(true);
      } else {
        throw new Error("No download link received.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Download failed. Please try again.";
      setError(msg);
    } finally {
      setDownloading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") fetchVideoInfo();
  };

  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{ backgroundImage: `url(${heroBg})`, backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px]" />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="py-6 px-4 text-center">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-lg">
              <Download className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-primary tracking-tight">TubeGrab</span>
          </div>
          <p className="text-muted-foreground text-sm font-medium">Download YouTube videos in any quality</p>
        </header>

        {/* Main */}
        <main className="flex-1 flex flex-col items-center justify-start px-4 pb-16 pt-4">
          {/* Hero Card */}
          <div className="w-full max-w-2xl animate-bounce-in">
            <div
              className="bg-card/90 backdrop-blur-md rounded-3xl card-shadow p-6 sm:p-10 border border-border"
            >
              {/* Title */}
              <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2">
                  YouTube <span className="font-display italic">Downloader</span>
                </h1>
                <p className="text-muted-foreground">Paste a YouTube link and download in any quality</p>
              </div>

              {/* URL Input */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="flex-1 relative">
                  <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => { setUrl(e.target.value); setError(""); setDownloadSuccess(false); }}
                    onKeyDown={handleKeyDown}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-border bg-background/80 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                  />
                </div>
                <button
                  onClick={fetchVideoInfo}
                  disabled={loading}
                  className="px-6 py-3.5 gradient-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 active:scale-95 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap shadow-md"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Fetching...</>
                  ) : (
                    <><Video className="w-4 h-4" /> Get Video</>
                  )}
                </button>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 text-destructive bg-destructive/10 rounded-xl px-4 py-3 mb-4 text-sm animate-bounce-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Success */}
              {downloadSuccess && (
                <div className="flex items-center gap-2 text-accent bg-accent/10 rounded-xl px-4 py-3 mb-4 text-sm animate-bounce-in border border-accent/20">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Download started! Check your downloads folder.</span>
                </div>
              )}

              {/* Video Info */}
              {videoInfo && (
                <div className="animate-bounce-in">
                  {/* Thumbnail */}
                  <div className="relative rounded-2xl overflow-hidden mb-6 bg-muted shadow-md group">
                    <img
                      src={videoInfo.thumbnail}
                      alt={videoInfo.title}
                      className="w-full object-cover aspect-video"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoInfo.videoId}/hqdefault.jpg`;
                      }}
                    />
                    <a
                      href={`https://www.youtube.com/watch?v=${videoInfo.videoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 flex items-center justify-center bg-primary/0 group-hover:bg-primary/20 transition-all"
                    >
                      <div className="w-14 h-14 bg-primary/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 shadow-xl">
                        <Play className="w-6 h-6 text-primary-foreground ml-1" />
                      </div>
                    </a>
                  </div>

                  {/* Video Title & Author */}
                  <div className="mb-5">
                    <h2 className="font-bold text-foreground text-base sm:text-lg leading-snug mb-1 line-clamp-2">{videoInfo.title}</h2>
                    <p className="text-muted-foreground text-sm flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full gradient-primary inline-block" />
                      {videoInfo.author}
                    </p>
                  </div>

                  {/* Quality Selection */}
                  <div className="mb-6">
                    <p className="text-sm font-semibold text-foreground mb-3">Select Quality</p>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {qualities.map((q) => (
                        <button
                          key={q.value}
                          onClick={() => setSelectedQuality(q.value)}
                          className={`relative py-2.5 px-2 rounded-xl text-sm font-medium transition-all duration-200 border ${
                            selectedQuality === q.value
                              ? "gradient-primary text-primary-foreground border-primary shadow-md scale-105"
                              : "bg-background/70 text-foreground border-border hover:border-primary/50 hover:bg-secondary"
                          } ${q.value === "audio" ? "col-span-3 sm:col-span-2" : ""}`}
                        >
                          {q.value === "audio" ? (
                            <span className="flex items-center justify-center gap-1.5">
                              <Music className="w-3.5 h-3.5" />
                              {q.label}
                            </span>
                          ) : (
                            <span>{q.label}</span>
                          )}
                          {q.badge && (
                            <span
                              className={`absolute -top-2 -right-1 text-[9px] font-bold px-1 py-0.5 rounded-full ${
                                selectedQuality === q.value
                                  ? "bg-primary-foreground/30 text-primary-foreground"
                                  : "bg-accent/20 text-accent"
                              }`}
                            >
                              {q.badge}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Download Button */}
                  <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="w-full py-4 gradient-primary text-primary-foreground font-bold rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base shadow-lg"
                  >
                    {downloading ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Processing Download...</>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        Download {selectedQuality === "audio" ? "Audio (MP3)" : `${selectedQuality === "2160" ? "4K" : selectedQuality + "p"} Video`}
                      </>
                    )}
                  </button>

                  <p className="text-center text-xs text-muted-foreground mt-3">
                    For personal use only • Respect copyright laws
                  </p>
                </div>
              )}

              {/* Empty State */}
              {!videoInfo && !loading && !error && (
                <div className="text-center py-6 text-muted-foreground">
                  <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Video className="w-8 h-8 text-primary/40" />
                  </div>
                  <p className="text-sm">Paste a YouTube URL above to get started</p>
                </div>
              )}
            </div>
          </div>

          {/* Features */}
          <div className="w-full max-w-2xl mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: "🎬", title: "Any Quality", desc: "144p up to 4K Ultra HD" },
              { icon: "🎵", title: "Audio Only", desc: "Extract MP3 audio tracks" },
              { icon: "⚡", title: "Fast & Free", desc: "No sign-up required" },
            ].map((f) => (
              <div key={f.title} className="bg-card/70 backdrop-blur-sm rounded-2xl p-4 border border-border text-center card-shadow">
                <div className="text-2xl mb-2">{f.icon}</div>
                <p className="font-semibold text-foreground text-sm">{f.title}</p>
                <p className="text-muted-foreground text-xs mt-0.5">{f.desc}</p>
              </div>
            ))}
          </div>
        </main>

        {/* Footer */}
        <footer className="py-4 text-center text-xs text-muted-foreground relative z-10">
          <p>TubeGrab • Use responsibly and respect copyright laws</p>
        </footer>
      </div>
    </div>
  );
}
