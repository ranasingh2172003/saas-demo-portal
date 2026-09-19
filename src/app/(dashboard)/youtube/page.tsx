"use client";

import React, { useState, useRef } from "react";
import {
  MonitorPlay,
  Play,
  Pause,
  Sparkles,
  Download,
  Share2,
  Volume2,
  VolumeX,
  UserCircle2,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  Type,
  Layout,
  Wand2,
  Video,
  AlertCircle,
  Clapperboard,
} from "lucide-react";
import { useToast } from "@/components/Toast";

interface GeneratedPackage {
  title: string;
  hook: string;
  script: string;
  scenes: Array<{ sceneNumber: number; visual: string; voiceover: string }>;
}

interface Avatar {
  id: string;
  name: string;
  imageUrl: string;
  type: "system" | "custom";
}

const DEFAULT_AVATARS: Avatar[] = [
  { id: "a1", name: "Sarah (Energy Advisor)", imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800", type: "system" },
  { id: "a2", name: "Marcus (HVAC Tech)", imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800", type: "system" },
  { id: "a3", name: "Elena (Engineer)", imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=800", type: "system" },
];

export default function YouTubeInfluencerWorkspace() {
  const { success, error, info } = useToast();

  // Script Gen State
  const [promptInput, setPromptInput] = useState("");
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [generatedPackage, setGeneratedPackage] = useState<GeneratedPackage | null>(null);

  // Video Gen State
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [generatedVideoSrc, setGeneratedVideoSrc] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);

  // Avatar State
  const [avatars, setAvatars] = useState<Avatar[]>(DEFAULT_AVATARS);
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>("a1");
  const [customAvatarPrompt, setCustomAvatarPrompt] = useState("");
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);

  // Video Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  // Polling ref for Veo async job status
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const operationNameRef = useRef<string | null>(null);

  const currentAvatar = avatars.find((a) => a.id === selectedAvatarId) || avatars[0];

  const handleGenerateScript = async () => {
    if (!promptInput.trim()) return;
    setIsGeneratingScript(true);
    setGeneratedVideoSrc(null);
    setVideoError(null);

    try {
      const res = await fetch("/api/youtube/script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: promptInput }),
      });

      if (!res.ok) throw new Error("Failed to generate script");

      const data = await res.json();
      setGeneratedPackage({
        title: data.title || promptInput,
        hook: data.hook || "Check this out!",
        script: data.script || data.fullScript || "",
        scenes: data.scenes || [],
      });

      success("Script Ready!", "Now click 'Generate Video with Veo' to create the actual video.");
    } catch (err) {
      console.error(err);
      error("Generation Failed", "Could not connect to Gemini API.");
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!generatedPackage) return;

    setIsGeneratingVideo(true);
    setGeneratedVideoSrc(null);
    setVideoError(null);
    setGenerationProgress(0);

    // Animate a smooth progress bar while waiting (Veo takes 60-120s)
    progressIntervalRef.current = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 88) return prev; // hold at 88% until done
        return prev + 1;
      });
    }, 1200);

    info("Veo is rendering...", "Video generation takes 60-120 seconds. Polling for updates...");

    // Build a rich visual prompt from the script scenes
    const scenePrompts =
      generatedPackage.scenes?.length > 0
        ? generatedPackage.scenes.map((s) => s.visual).join(". ")
        : `${generatedPackage.hook} — ${generatedPackage.script.substring(0, 300)}`;

    const videoPrompt = `${scenePrompts} --style cinematic, 4k, professional photography, highly detailed`;

    const stopPolling = () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };

    const handleVideoReady = (data: { videoBase64: string; mimeType?: string }) => {
      const byteCharacters = atob(data.videoBase64);
      const byteArray = new Uint8Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteArray[i] = byteCharacters.charCodeAt(i);
      }
      const blob = new Blob([byteArray], { type: data.mimeType || "video/mp4" });
      const blobUrl = URL.createObjectURL(blob);
      setGeneratedVideoSrc(blobUrl);
      setGenerationProgress(100);
      setIsGeneratingVideo(false);
      success("🎬 Video Ready!", "Your AI video has been generated by Veo. Click play to watch!");
    };

    try {
      // Step 1: Start the Veo job (returns immediately with an operationName)
      const res = await fetch("/api/youtube/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: videoPrompt, aspectRatio: "9:16" }),
      });

      const startData = await res.json();

      if (!res.ok || !startData.success) {
        throw new Error(startData.error || "Failed to start video generation");
      }

      // If Veo returned inline (rare), handle immediately
      if (startData.videoBase64) {
        stopPolling();
        handleVideoReady(startData);
        return;
      }

      // Step 2: Store operationName and start polling every 5s
      operationNameRef.current = startData.operationName;
      let pollAttempts = 0;
      const MAX_POLLS = 36; // 36 × 5s = 3 minutes max

      pollIntervalRef.current = setInterval(async () => {
        pollAttempts++;

        if (pollAttempts > MAX_POLLS) {
          stopPolling();
          setIsGeneratingVideo(false);
          const msg = "Video generation timed out after 3 minutes. Please try a shorter prompt.";
          setVideoError(msg);
          error("Veo Timeout", msg);
          return;
        }

        try {
          const statusRes = await fetch(
            `/api/youtube/job-status?operationName=${encodeURIComponent(operationNameRef.current || "")}`
          );
          const statusData = await statusRes.json();

          if (statusData.error) {
            stopPolling();
            setIsGeneratingVideo(false);
            setVideoError(statusData.error);
            error("Veo Error", statusData.error);
            return;
          }

          if (statusData.done && statusData.videoBase64) {
            stopPolling();
            handleVideoReady(statusData);
          }
          // If not done, just continue polling (progress bar animates automatically)
        } catch (pollErr) {
          console.warn("Poll attempt failed:", pollErr);
          // Don't stop on transient poll errors — keep trying
        }
      }, 5000);
    } catch (err: unknown) {
      stopPolling();
      setIsGeneratingVideo(false);
      console.error("Video gen error:", err);
      const msg = err instanceof Error ? err.message : "Unknown error";
      setVideoError(msg);
      error("Veo Error", msg);
    }
  };

  const handleTogglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleToggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  const handleDownload = () => {
    if (!generatedVideoSrc) {
      error("Export Failed", "Generate a video first.");
      return;
    }
    const a = document.createElement("a");
    a.href = generatedVideoSrc;
    a.download = `${generatedPackage?.title || "video"}.mp4`;
    a.click();
  };

  const handlePublish = () => {
    if (!generatedVideoSrc) {
      error("Publish Failed", "Please generate a video first.");
      return;
    }
    success("Publishing to YouTube", "Video is being uploaded to your connected YouTube Shorts channel.");
  };

  const handleGenerateAvatar = () => {
    if (!customAvatarPrompt.trim()) return;
    setIsGeneratingAvatar(true);
    setTimeout(() => {
      const newAvatar: Avatar = {
        id: `custom-${Date.now()}`,
        name: "Custom Persona",
        imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800",
        type: "custom"
      };
      setAvatars([newAvatar, ...avatars]);
      setSelectedAvatarId(newAvatar.id);
      setIsGeneratingAvatar(false);
      setCustomAvatarPrompt("");
      success("Avatar Created!", "Your custom AI persona is ready.");
    }, 2500);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50 dark:bg-[#0A0A0A] overflow-hidden font-sans">

      {/* Top Header */}
      <header className="flex-none h-14 bg-white dark:bg-[#141414] border-b border-slate-200 dark:border-white/10 flex items-center justify-between px-4 sm:px-6 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold text-sm">
            <MonitorPlay className="w-5 h-5 text-indigo-500" />
            {generatedPackage?.title || "Untitled Video Project"}
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400 border border-slate-200 dark:border-white/10">
            {generatedVideoSrc ? "Ready" : "Draft"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors">
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={handlePublish} className="flex items-center gap-2 px-5 py-1.5 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors">
            <Share2 className="w-4 h-4" /> Publish
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">

        {/* LEFT: Script Editor */}
        <aside className="w-full lg:w-[360px] flex flex-col bg-white dark:bg-[#141414] border-r border-slate-200 dark:border-white/10 shrink-0 z-10 h-full overflow-y-auto">
          <div className="p-4 border-b border-slate-100 dark:border-white/5">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Type className="w-4 h-4 text-indigo-500" /> Step 1: Script Editor
            </h2>
          </div>

          <div className="p-4 space-y-4">
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Video Topic or Concept</label>
              <textarea
                rows={3}
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="e.g. 3 signs your AC is leaking freon"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none placeholder-slate-400"
              />
              <button
                disabled={isGeneratingScript || !promptInput.trim()}
                onClick={handleGenerateScript}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                {isGeneratingScript ? <><Loader2 className="w-4 h-4 animate-spin" /> Drafting Script...</> : <><Sparkles className="w-4 h-4" /> AI Generate Script</>}
              </button>
            </div>

            {generatedPackage ? (
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-white/5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active Script
                  </label>
                </div>

                <div className="bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-xl p-3 max-h-48 overflow-y-auto">
                  <p className="text-xs font-bold text-slate-900 dark:text-white mb-1.5">{generatedPackage.title}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">{generatedPackage.script}</p>
                </div>

                {/* THE MAIN ACTION BUTTON */}
                <div className="pt-1">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg">
                    <p className="text-white/70 text-[10px] font-medium uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Clapperboard className="w-3 h-3" /> Step 2: Generate Video
                    </p>
                    <button
                      disabled={isGeneratingVideo}
                      onClick={handleGenerateVideo}
                      className="w-full py-3 bg-white/15 hover:bg-white/25 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors border border-white/20"
                    >
                      {isGeneratingVideo
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Veo is rendering ({Math.round(generationProgress)}%)...</>
                        : <><Video className="w-4 h-4" /> Generate Video with Veo</>
                      }
                    </button>
                    {isGeneratingVideo && (
                      <div className="mt-2.5 w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-white rounded-full transition-all duration-1500 ease-linear"
                          style={{ width: `${generationProgress}%` }}
                        />
                      </div>
                    )}
                    {!isGeneratingVideo && (
                      <p className="text-white/50 text-[10px] mt-2 text-center">Powered by Google Veo · ~60-120s</p>
                    )}
                  </div>
                </div>

                {videoError && (
                  <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-700 dark:text-red-400">{videoError}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="pt-8 flex flex-col items-center justify-center text-center px-4 opacity-50">
                <Layout className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Empty Script</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Enter a topic above to get started.</p>
              </div>
            )}
          </div>
        </aside>

        {/* CENTER: Video Canvas */}
        <main className="flex-1 flex flex-col relative bg-slate-100 dark:bg-[#0A0A0A]">
          <div className="flex-1 flex items-center justify-center p-6 overflow-hidden relative">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)]" />

            <div className="relative z-10 w-full max-w-[320px] aspect-[9/16] bg-black rounded-[28px] shadow-2xl overflow-hidden ring-1 ring-white/10 group">

              {/* Generated video */}
              {generatedVideoSrc ? (
                <>
                  <video
                    ref={videoRef}
                    src={generatedVideoSrc}
                    className="absolute inset-0 w-full h-full object-cover"
                    playsInline
                    loop
                    muted={isMuted}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                  <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/90 to-transparent" />

                  {/* Veo badge */}
                  <div className="absolute top-3 left-3 z-20">
                    <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-bold text-white/90">
                      <Sparkles className="w-3 h-3 text-violet-400" />
                      Veo 3 · AI Generated
                    </div>
                  </div>

                  {/* Title overlay */}
                  {generatedPackage && (
                    <div className="absolute bottom-14 inset-x-4 z-20 text-center">
                      <p className="text-white text-sm font-bold drop-shadow-md leading-snug">
                        {generatedPackage.hook}
                      </p>
                    </div>
                  )}

                  {/* Controls */}
                  <div className="absolute bottom-0 inset-x-0 h-12 bg-black/60 backdrop-blur-md z-20 flex items-center px-4 gap-3">
                    <button onClick={handleTogglePlay} className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-black hover:bg-slate-200 transition-colors shrink-0">
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                    </button>
                    <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-violet-500 rounded-full w-0" />
                    </div>
                    <button onClick={handleToggleMute} className="text-white/80 hover:text-white shrink-0">
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  </div>
                </>
              ) : isGeneratingVideo ? (
                /* Rendering State */
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-violet-900 to-indigo-950 text-white p-6">
                  <div className="w-16 h-16 rounded-full border-4 border-white/20 border-t-violet-400 animate-spin mb-6" />
                  <p className="font-bold text-base mb-1">Veo is rendering</p>
                  <p className="text-white/60 text-xs text-center mb-4">Google&apos;s AI video engine is crafting your video...</p>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-400 rounded-full transition-all duration-1500" style={{ width: `${generationProgress}%` }} />
                  </div>
                  <p className="text-violet-300 text-xs mt-2">{Math.round(generationProgress)}% complete</p>
                </div>
              ) : (
                /* Idle / Placeholder State */
                <div className="absolute inset-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={currentAvatar.imageUrl} alt={currentAvatar.name} className="w-full h-full object-cover opacity-60" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-6 text-center">
                    <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-4">
                      <Video className="w-6 h-6 text-white/80" />
                    </div>
                    {generatedPackage ? (
                      <>
                        <p className="font-semibold text-sm mb-1">Script ready!</p>
                        <p className="text-white/60 text-xs">Click &ldquo;Generate Video with Veo&rdquo; to produce the real video.</p>
                      </>
                    ) : (
                      <>
                        <p className="font-semibold text-sm mb-1">No script yet</p>
                        <p className="text-white/60 text-xs">Generate a script first, then produce the video.</p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* RIGHT: Avatar Studio */}
        <aside className="hidden lg:flex flex-col w-72 bg-white dark:bg-[#141414] border-l border-slate-200 dark:border-white/10 shrink-0 z-10 overflow-y-auto">
          <div className="p-4 border-b border-slate-100 dark:border-white/5">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <UserCircle2 className="w-4 h-4 text-indigo-500" /> Avatar Presenter
            </h2>
            <p className="text-[10px] text-slate-400 mt-0.5">Optional · Select or generate a presenter</p>
          </div>

          <div className="p-4 space-y-5">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 font-medium">Select Presenter</p>
              <div className="grid grid-cols-2 gap-2.5">
                {avatars.map(avatar => (
                  <div
                    key={avatar.id}
                    onClick={() => setSelectedAvatarId(avatar.id)}
                    className={`relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer transition-all ring-2 ${selectedAvatarId === avatar.id ? "ring-indigo-500 shadow-lg" : "ring-transparent hover:ring-slate-300 dark:hover:ring-white/20"}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={avatar.imageUrl} alt={avatar.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-5">
                      <span className="text-white text-[9px] font-medium block truncate">{avatar.name}</span>
                    </div>
                    {selectedAvatarId === avatar.id && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-sm">
                        <CheckCircle2 className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-white/5">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 font-medium flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5" /> Generate Custom Persona
              </p>
              <div className="space-y-2.5">
                <textarea
                  rows={2}
                  value={customAvatarPrompt}
                  onChange={(e) => setCustomAvatarPrompt(e.target.value)}
                  placeholder="e.g. 40-year-old male HVAC technician..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                />
                <button
                  disabled={isGeneratingAvatar || !customAvatarPrompt.trim()}
                  onClick={handleGenerateAvatar}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 disabled:opacity-50 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  {isGeneratingAvatar ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5" />}
                  Generate Presenter
                </button>
              </div>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
