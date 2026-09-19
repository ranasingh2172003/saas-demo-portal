"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, Phone, Settings2, PhoneOff, Code, CheckCircle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface TranscriptMessage {
  role: "agent" | "user" | "system";
  text: string;
}

export default function VoiceBuilder() {
  const router = useRouter();
  
  // State
  const [isActive, setIsActive] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [aiSteps, setAiSteps] = useState<string[]>([]);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Refs for callbacks
  const isActiveRef = useRef(isActive);
  const isBuildingRef = useRef(isBuilding);
  const isSpeakingRef = useRef(isSpeaking);
  const transcriptRef = useRef(transcript);
  const isListeningRef = useRef(isListening);

  useEffect(() => { isActiveRef.current = isActive; }, [isActive]);
  useEffect(() => { isBuildingRef.current = isBuilding; }, [isBuilding]);
  useEffect(() => { isSpeakingRef.current = isSpeaking; }, [isSpeaking]);
  useEffect(() => { transcriptRef.current = transcript; }, [transcript]);
  useEffect(() => { isListeningRef.current = isListening; }, [isListening]);

  const DEVELOPER_PERSONA = `You are Apex, the elite AI Systems Architect for a SaaS platform. 
Your goal is to interview the user about the automation module they want to build. 
Available modules: Website, WhatsApp agent, Voice receptionist, Recruitment engine, Lead generation, LinkedIn automation, QR code.
1. Greet them as their personal AI Architect. Ask what they want to build.
2. Ask 1-2 clarifying questions to get specific requirements (e.g. inbound vs outbound, theme, tone).
3. Keep your replies very brief and conversational.
4. IMPORTANT: Once you have gathered enough specific details to confidently build their exact request, you must reply with ONLY this exact phrase: [INITIATE_BUILD]. Do not say anything else in that message.`;

  const transcriptBottomRef = useRef<HTMLDivElement>(null);
  
  // MediaRecorder & VAD Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const vadStreamRef = useRef<MediaStream | null>(null);
  const vadAnalyserRef = useRef<AnalyserNode | null>(null);
  const vadSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const vadIntervalRef = useRef<any>(null);
  const lastSpeechTimeRef = useRef<number>(Date.now());
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (transcriptBottomRef.current) {
      transcriptBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [transcript]);

  useEffect(() => {
    return () => {
      if (vadStreamRef.current) {
        vadStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (vadIntervalRef.current) clearInterval(vadIntervalRef.current);
    };
  }, []);

  // ── Speak text: tries Kokoro TTS first, falls back to browser SpeechSynthesis ──
  const speakText = async (text: string) => {
    setIsSpeaking(true);

    // Helper: speak via browser's built-in SpeechSynthesis (works without any server)
    const speakViaBrowser = () => {
      if (typeof window === "undefined" || !window.speechSynthesis) {
        setIsSpeaking(false);
        if (isActiveRef.current && !isBuildingRef.current) startListening();
        return;
      }
      window.speechSynthesis.cancel(); // clear any pending speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      // Pick a higher quality voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v =>
        v.name.includes("Samantha") ||
        v.name.includes("Google US English") ||
        v.name.includes("Google UK English Female") ||
        (v.lang === "en-US" && !v.name.includes("Google"))
      );
      if (preferred) utterance.voice = preferred;
      utterance.onend = () => {
        setIsSpeaking(false);
        if (isActiveRef.current && !isBuildingRef.current) startListening();
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        if (isActiveRef.current && !isBuildingRef.current) startListening();
      };
      window.speechSynthesis.speak(utterance);
    };

    try {
      // Use POST /api/tts with a generous 45s timeout for XTTS (runs on CPU, ~7-10s per sentence)
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 45000);

      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!response.ok) throw new Error("TTS backend unavailable");

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      if (audioElementRef.current) {
        audioElementRef.current.src = blobUrl;
        audioElementRef.current.play().catch(() => {
          URL.revokeObjectURL(blobUrl);
          speakViaBrowser();
        });
      }
    } catch (e) {
      console.info("XTTS unavailable, using browser SpeechSynthesis fallback:", e);
      speakViaBrowser();
    }
  };

  const handleAudioEnded = () => {
    setIsSpeaking(false);
    if (isActiveRef.current && !isBuildingRef.current) {
      startListening();
    }
  };


  const processBuild = async (fullTranscript: TranscriptMessage[]) => {
    setIsBuilding(true);
    setIsActive(false);
    stopListening(false);

    setAiSteps(["Analyzing complete interview transcript..."]);
    
    try {
      const messages = fullTranscript.map(m => ({
        role: m.role === "agent" ? "assistant" : "user",
        content: m.text
      }));

      const res = await fetch("/api/agents/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages })
      });
      
      if (res.ok) {
        setAiSteps(prev => [...prev, "Provisioning custom LLM configuration...", "Compiling workflow blueprint...", "Saving to PostgreSQL Database...", "✅ Module successfully built!"]);
        setTimeout(() => setIsDone(true), 2500);
      } else {
        setAiSteps(prev => [...prev, "❌ Failed to build module."]);
      }
    } catch (e) {
      setAiSteps(prev => [...prev, "❌ Network Error during build."]);
    }
  };

  const processUserSpeechText = async (userText: string) => {
    const newTranscript = [...transcriptRef.current, { role: "user" as const, text: userText }];
    setTranscript(newTranscript);
    
    try {
      const chatRes = await fetch("/api/voice/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt: DEVELOPER_PERSONA,
          messages: newTranscript.map(m => ({
            role: m.role === "agent" ? "assistant" : "user",
            content: m.text
          }))
        })
      });
      
      if (chatRes.ok && chatRes.body) {
        // Read streaming text response
        const reader = chatRes.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let reply = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          reply += decoder.decode(value, { stream: true });
        }
        reply = reply.trim();

        if (reply.includes("[INITIATE_BUILD]")) {
           setTranscript(prev => [...prev, { role: "system", text: "AI Architect has gathered all requirements. Initiating build process..." }]);
           processBuild(newTranscript);
        } else {
           setTranscript(prev => [...prev, { role: "agent", text: reply }]);
           await speakText(reply);
        }
      } else {
        if (isActiveRef.current && !isBuildingRef.current) startListening();
      }
    } catch(e) {
      console.error(e);
      if (isActiveRef.current && !isBuildingRef.current) startListening();
    }
  };

  const processAudioBlob = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "audio.webm");

      const res = await fetch("/api/voice/stt", {
        method: "POST",
        body: formData
      });

      if (res.ok) {
        const { text } = await res.json();
        if (text && text.trim().length > 2) {
          await processUserSpeechText(text.trim());
          return;
        }
      }
    } catch (error) {
      console.error("STT Process Error", error);
    }
    
    if (isActiveRef.current && !isBuildingRef.current && !isSpeakingRef.current) {
       startListening();
    }
  };

  const stopListening = (processAudio: boolean = true) => {
    setIsListening(false);
    if (vadIntervalRef.current) {
      clearInterval(vadIntervalRef.current);
      vadIntervalRef.current = null;
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      if (!processAudio) {
         mediaRecorderRef.current.onstop = null;
      }
      mediaRecorderRef.current.stop();
    }
  };

  const startListening = async () => {
    if (isListeningRef.current || isSpeakingRef.current || isBuildingRef.current || !isActiveRef.current) return;
    
    try {
      if (!vadStreamRef.current) {
        vadStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume();
      }

      if (!vadAnalyserRef.current) {
        vadSourceRef.current = audioContextRef.current.createMediaStreamSource(vadStreamRef.current);
        vadAnalyserRef.current = audioContextRef.current.createAnalyser();
        vadAnalyserRef.current.fftSize = 256;
        vadSourceRef.current.connect(vadAnalyserRef.current);
      }

      audioChunksRef.current = [];
      mediaRecorderRef.current = new MediaRecorder(vadStreamRef.current);
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        if (audioBlob.size > 0 && isActiveRef.current && !isBuildingRef.current) {
          processAudioBlob(audioBlob);
        }
      };

      mediaRecorderRef.current.start(200);
      setIsListening(true);
      lastSpeechTimeRef.current = Date.now();

      // Start VAD Loop
      const dataArray = new Uint8Array(vadAnalyserRef.current.frequencyBinCount);
      vadIntervalRef.current = setInterval(() => {
        if (!vadAnalyserRef.current || !isListeningRef.current) return;
        
        vadAnalyserRef.current.getByteFrequencyData(dataArray);
        let maxVol = 0;
        for (let i = 0; i < dataArray.length; i++) {
          if (dataArray[i] > maxVol) maxVol = dataArray[i];
        }
        
        // Threshold for speaking
        if (maxVol > 15) {
          lastSpeechTimeRef.current = Date.now();
        } else {
          // If silent for > 1500ms, trigger stop
          if (Date.now() - lastSpeechTimeRef.current > 1500) {
            stopListening(true);
          }
        }
      }, 100);

    } catch (e) {
      console.error("Microphone permission denied or failed to initialize", e);
      alert("Microphone permission is required to talk to the AI.");
      setIsActive(false);
    }
  };

  const handleStartCall = async () => {
    try {
      if (!vadStreamRef.current) {
        vadStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
    } catch(e) {
      alert("Microphone access is required.");
      return;
    }

    const greeting = "Hi there. I'm Apex, your personal AI Architect. What kind of automation module would you like to build today?";
    setTranscript([{ role: "agent", text: greeting }]);
    setIsActive(true);
    await speakText(greeting);
  };

  const handleEndCall = () => {
    setIsActive(false);
    stopListening(false);
    setIsSpeaking(false);
    // Stop both audio element AND browser SpeechSynthesis
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.src = "";
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (vadStreamRef.current) {
      vadStreamRef.current.getTracks().forEach(track => track.stop());
      vadStreamRef.current = null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col p-6 md:p-10 relative">
      <audio ref={audioElementRef} onEnded={handleAudioEnded} className="hidden" />
      
      <Link href="/sbo/dashboard" className="absolute top-8 left-8 p-2 text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
        <ArrowLeft className="w-5 h-5" />
        <span className="hidden sm:inline">Back to Dashboard</span>
      </Link>

      <div className="max-w-4xl mx-auto w-full mt-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">AI Architect Interview</h1>
          <p className="text-slate-400">Have a conversation with our Lead AI Developer to instantly build and deploy custom modules.</p>
        </div>

        {isBuilding && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#13131a] rounded-3xl border border-blue-500/30 p-10 flex flex-col items-center justify-center min-h-[400px] shadow-2xl shadow-blue-900/20">
            <Code className="w-16 h-16 text-blue-500 animate-pulse mb-6" />
            <h2 className="text-2xl font-bold mb-8">Building Your Module...</h2>
            
            <div className="w-full max-w-md space-y-4">
              {aiSteps.map((step, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: -20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  className="flex items-center text-blue-100 bg-blue-950/30 p-4 rounded-xl border border-blue-900/50"
                >
                  <CheckCircle className="w-5 h-5 text-blue-500 mr-3 shrink-0" />
                  <span className="text-sm font-medium">{step}</span>
                </motion.div>
              ))}
            </div>

            {isDone && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-10">
                <button onClick={() => router.push("/developer/agents")} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all hover:scale-105 shadow-lg shadow-blue-600/20">
                  View Deployed Module
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {!isBuilding && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#13131a] rounded-3xl border border-slate-800 p-8 flex flex-col items-center justify-center min-h-[400px]">
              {!isActive ? (
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-6">
                    <Settings2 className="w-8 h-8 text-slate-400" />
                  </div>
                  <h2 className="text-xl font-bold mb-2">Architect is Ready</h2>
                  <p className="text-slate-400 text-sm mb-8">Tap below to call the developer.</p>
                  <button onClick={handleStartCall} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-transform active:scale-95">
                    <Phone className="w-5 h-5" /> Start Interview
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="relative mb-12">
                    {isSpeaking && (
                      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }} className="absolute inset-0 bg-blue-500 rounded-full blur-xl" />
                    )}
                    <div className={`w-32 h-32 rounded-full flex items-center justify-center relative z-10 border-4 transition-colors duration-500 ${isSpeaking ? 'border-blue-500 bg-blue-500/10' : isListening ? 'border-green-500 bg-green-500/10' : 'border-slate-700 bg-slate-800'}`}>
                      {isSpeaking ? <Settings2 className="w-12 h-12 text-blue-500 animate-pulse" /> : isListening ? <Mic className="w-12 h-12 text-green-500" /> : <Phone className="w-12 h-12 text-slate-400" />}
                    </div>
                  </div>
                  <div className="h-6 text-sm font-medium mb-12 text-slate-300">
                    {isSpeaking ? "Architect is speaking..." : isListening ? "Listening... (auto-submits on pause)" : "Processing voice..."}
                  </div>
                  <button onClick={handleEndCall} className="w-16 h-16 bg-red-500 hover:bg-red-400 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95">
                    <PhoneOff className="w-6 h-6 text-white" />
                  </button>
                </div>
              )}
            </div>

            <div className="bg-[#13131a] rounded-3xl border border-slate-800 flex flex-col h-[400px] overflow-hidden">
              <div className="p-4 border-b border-slate-800 bg-[#0f0f15] flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <h3 className="font-bold text-sm text-slate-300">Live Interview Transcript</h3>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {transcript.length === 0 && (
                  <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                    Transcript will appear here...
                  </div>
                )}
                {transcript.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : msg.role === "system" ? "justify-center" : "justify-start"}`}>
                    <div className={`max-w-[85%] rounded-2xl p-4 text-sm ${
                      msg.role === "user" ? "bg-blue-600 text-white rounded-br-none" 
                      : msg.role === "system" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono text-xs w-full text-center"
                      : "bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700"
                    }`}>
                      <p className="leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                ))}
                <div ref={transcriptBottomRef} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
