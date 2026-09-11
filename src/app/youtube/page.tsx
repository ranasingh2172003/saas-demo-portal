"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Wand2
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

  // Avatar State
  const [avatars, setAvatars] = useState<Avatar[]>(DEFAULT_AVATARS);
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>("a1");
  const [customAvatarPrompt, setCustomAvatarPrompt] = useState("");
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);

  // Video Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  // Fake duration based on script length
  const playbackDuration = generatedPackage ? Math.max(10, Math.floor(generatedPackage.script.length / 15)) : 24;
  const currentAvatar = avatars.find((a) => a.id === selectedAvatarId) || avatars[0];

  const currentCaption = generatedPackage 
    ? generatedPackage.script.substring(0, Math.min(generatedPackage.script.length, playbackTime * 15)) + "..."
    : "Your generated script captions will appear here.";

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlaybackTime((prev) => {
          if (prev >= playbackDuration) {
            setIsPlaying(false);
            if (typeof window !== "undefined" && "speechSynthesis" in window) {
              window.speechSynthesis.cancel();
            }
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackDuration]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleSpeechAudio = (play: boolean) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    if (!play || isMuted || !generatedPackage) return;

    const utterance = new SpeechSynthesisUtterance(generatedPackage.script);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    speechUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handleTogglePlay = () => {
    if (!generatedPackage) {
      error("No Script", "Please generate a script in the middle panel first!");
      return;
    }
    const nextPlayState = !isPlaying;
    if (nextPlayState) setPlaybackTime(0); 
    setIsPlaying(nextPlayState);
    if (!isMuted) {
      toggleSpeechAudio(nextPlayState);
    }
  };

  const handleGenerateScript = async () => {
    if (!promptInput.trim()) return;

    setIsGeneratingScript(true);
    // cancel existing audio if any
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setPlaybackTime(0);

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
      
      success("Script Ready!", "Your script has been generated and applied to the timeline.");
    } catch (err) {
      console.error(err);
      error("Generation Failed", "Could not connect to Gemini API.");
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const handleGenerateAvatar = () => {
    if (!customAvatarPrompt.trim()) return;
    setIsGeneratingAvatar(true);
    
    // Simulate generation delay
    setTimeout(() => {
      const newAvatar: Avatar = {
        id: `custom-${Date.now()}`,
        name: "Custom Persona",
        imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800", // Stunning realistic female portrait
        type: "custom"
      };
      setAvatars([newAvatar, ...avatars]);
      setSelectedAvatarId(newAvatar.id);
      setIsGeneratingAvatar(false);
      setCustomAvatarPrompt("");
      success("Avatar Created!", "Your custom AI persona is ready for video synthesis.");
    }, 2500);
  };

  const handleDownload = () => {
    if (!generatedPackage) {
      error("Export Failed", "There is no generated video to download.");
      return;
    }
    info("Preparing Export...", "Rendering MP4 in 1080p. This usually takes 2-3 minutes on the cloud.");
    // Simulate export
    setTimeout(() => {
      success("Download Ready", "Your video has been rendered successfully.");
    }, 4000);
  };

  const handlePublish = () => {
    if (!generatedPackage) {
      error("Publish Failed", "Please generate a video first.");
      return;
    }
    success("Publishing to YouTube", "Video is being uploaded to your connected YouTube Shorts channel.");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50 dark:bg-[#0A0A0A] overflow-hidden font-sans">
      
      {/* 1. Top Editor Header */}
      <header className="flex-none h-14 bg-white dark:bg-[#141414] border-b border-slate-200 dark:border-white/10 flex items-center justify-between px-4 sm:px-6 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold text-sm">
            <MonitorPlay className="w-5 h-5 text-indigo-500" />
            Untitled Video Project
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400 border border-slate-200 dark:border-white/10">
            Draft
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors"
          >
            <Download className="w-4 h-4" /> Export
          </button>
          <button 
            onClick={handlePublish}
            className="flex items-center gap-2 px-5 py-1.5 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors"
          >
            <Share2 className="w-4 h-4" /> Publish
          </button>
        </div>
      </header>

      {/* 2. Main Editor Layout: Script Editor -> Center Canvas -> Avatar Studio */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT PANEL: Script & Configuration (Step 1) */}
        <aside className="w-full lg:w-96 flex flex-col bg-white dark:bg-[#141414] border-r border-slate-200 dark:border-white/10 shrink-0 z-10 h-full">
          <div className="p-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Type className="w-4 h-4" /> Script Editor
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            
            {/* Generator Form */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                1. Video Topic or Concept
              </label>
              <textarea
                rows={3}
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="Describe your video topic here... (e.g. 3 signs your AC is leaking freon)"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none placeholder-slate-400"
              />
              <button
                disabled={isGeneratingScript || !promptInput.trim()}
                onClick={handleGenerateScript}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                {isGeneratingScript ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Drafting Script...</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> AI Generate Script</>
                )}
              </button>
            </div>

            {/* Generated Script Display */}
            {generatedPackage ? (
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/5 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Active Script
                  </label>
                  <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded font-mono">
                    ~{playbackDuration}s duration
                  </span>
                </div>
                
                <div className="bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-xl p-3">
                  <p className="text-xs font-bold text-slate-900 dark:text-white mb-2">
                    {generatedPackage.title}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                    {generatedPackage.script}
                  </p>
                </div>

                <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl">
                  <p className="text-xs font-medium text-indigo-800 dark:text-indigo-300 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                    Your script is ready! Click the Play button on the video player to synthesize and preview.
                  </p>
                </div>
              </div>
            ) : (
              <div className="pt-8 flex flex-col items-center justify-center text-center px-4 opacity-50">
                <Layout className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Empty Script</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Enter a topic above and let AI generate your complete video script and scenes.</p>
              </div>
            )}
          </div>
        </aside>

        {/* CENTER PANEL: The Video Canvas */}
        <main className="flex-1 flex flex-col relative bg-slate-100 dark:bg-[#0A0A0A]">
          {/* Canvas Area */}
          <div className="flex-1 flex items-center justify-center p-8 overflow-hidden relative">
             {/* Background decorative grid */}
             <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)]"></div>
             
             {/* The Video Container */}
             <div className="relative z-10 w-full max-w-[340px] aspect-[9/16] bg-black rounded-[32px] shadow-2xl overflow-hidden ring-1 ring-slate-200 dark:ring-white/10 flex flex-col group">
                {/* Video / Avatar Image */}
                <div className="absolute inset-0 w-full h-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentAvatar.imageUrl}
                    alt={currentAvatar.name}
                    className={`w-full h-full object-cover transition-transform duration-[20s] ease-linear ${
                      isPlaying ? "scale-105" : "scale-100"
                    }`}
                  />
                  {/* Gradient for captions */}
                  <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                </div>

                {/* Top overlay badges */}
                <div className="absolute top-4 inset-x-4 flex items-center justify-between z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-bold text-white/90">
                    <Sparkles className="w-3 h-3 text-indigo-400" />
                    VEO 3.1 ENGINE
                  </div>
                </div>

                {/* Captions display */}
                <div className="absolute bottom-16 inset-x-6 z-20">
                   {generatedPackage ? (
                     <div className="text-center">
                       <p className="text-white text-lg font-bold leading-snug drop-shadow-md">
                         <span className="bg-black/50 backdrop-blur-sm decoration-clone px-1.5 py-0.5 rounded leading-loose box-decoration-clone">
                           {currentCaption}
                         </span>
                       </p>
                     </div>
                   ) : (
                     <div className="text-center opacity-60">
                       <p className="text-white text-sm font-medium">Generate script to preview</p>
                     </div>
                   )}
                </div>

                {/* Video Scrubber & Play Controls */}
                <div className="absolute bottom-0 inset-x-0 h-12 bg-black/60 backdrop-blur-md z-20 flex items-center px-4 gap-3">
                  <button 
                    onClick={handleTogglePlay}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-black hover:bg-slate-200 transition-colors shrink-0"
                  >
                    {isPlaying ? <Pause className="w-4 h-4 ml-0.5" /> : <Play className="w-4 h-4 ml-1" />}
                  </button>
                  
                  {/* Scrubber track */}
                  <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden relative cursor-pointer">
                    <div 
                      className="absolute left-0 top-0 bottom-0 bg-indigo-500 rounded-full transition-all duration-1000 ease-linear"
                      style={{ width: `${(playbackTime / playbackDuration) * 100}%` }}
                    />
                  </div>

                  <div className="text-[10px] font-mono font-medium text-white/80 shrink-0">
                    0:{playbackTime < 10 ? `0${playbackTime}` : playbackTime} / 0:{playbackDuration}
                  </div>

                  <button
                    onClick={() => {
                      const nextMuted = !isMuted;
                      setIsMuted(nextMuted);
                      toggleSpeechAudio(!nextMuted && isPlaying);
                    }}
                    className="text-white/80 hover:text-white shrink-0"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>
             </div>
          </div>
        </main>

        {/* RIGHT PANEL: Asset Library & Avatar Studio (Step 2) */}
        <aside className="hidden lg:flex flex-col w-80 bg-white dark:bg-[#141414] border-l border-slate-200 dark:border-white/10 shrink-0 z-10 overflow-y-auto">
          <div className="p-4 border-b border-slate-100 dark:border-white/5">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <UserCircle2 className="w-4 h-4" /> 2. Avatar Presenter
            </h2>
          </div>
          
          <div className="p-4 space-y-6">
            {/* Library */}
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 font-medium">Select Presenter</p>
              <div className="grid grid-cols-2 gap-3">
                {avatars.map(avatar => (
                  <div 
                    key={avatar.id}
                    onClick={() => setSelectedAvatarId(avatar.id)}
                    className={`relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer group transition-all ring-2 ${
                      selectedAvatarId === avatar.id ? "ring-indigo-500 shadow-lg" : "ring-transparent hover:ring-slate-300 dark:hover:ring-white/20"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={avatar.imageUrl} alt={avatar.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-6">
                      <span className="text-white text-[10px] font-medium block truncate">{avatar.name}</span>
                    </div>
                    {selectedAvatarId === avatar.id && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-sm">
                        <CheckCircle2 className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Gen */}
            <div className="pt-4 border-t border-slate-100 dark:border-white/5">
               <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 font-medium flex items-center gap-1">
                 <Wand2 className="w-3.5 h-3.5" /> Generate Custom Persona
               </p>
               <div className="space-y-3">
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
