"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Mic, Phone, Settings2, PhoneOff, Volume2 } from "lucide-react";
import { motion } from "framer-motion";
import Modal from "@/components/Modal";
import { useToast } from "@/components/Toast";

interface TranscriptMessage {
  role: "agent" | "user";
  text: string;
}

export default function VoiceReceptionist() {
  const toast = useToast();
  const [isActive, setIsActive] = useState(false);
  const [callSeconds, setCallSeconds] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Configuration Modal State
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [agentPersona, setAgentPersona] = useState(
    "You are a friendly, conversational virtual receptionist for Apex Cooling & HVAC. Keep your answers short (1-2 sentences). Do not use lists or markdown. Speak casually."
  );
  const [greetingText, setGreetingText] = useState("Hi, this is Apex Cooling. How can I help you today?");

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptBottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const ttsQueueRef = useRef<string[]>([]);
  const isSpeakingSentenceRef = useRef(false);
  
  // Refs to avoid stale closures inside event handlers
  const isActiveRef = useRef(isActive);
  const isSpeakingRef = useRef(isSpeaking);
  const agentPersonaRef = useRef(agentPersona);
  const transcriptRef = useRef(transcript);
  useEffect(() => { isActiveRef.current = isActive; }, [isActive]);
  useEffect(() => { isSpeakingRef.current = isSpeaking; }, [isSpeaking]);
  useEffect(() => { agentPersonaRef.current = agentPersona; }, [agentPersona]);
  useEffect(() => { transcriptRef.current = transcript; }, [transcript]);

  // Auto scroll transcript
  useEffect(() => {
    if (transcriptBottomRef.current) {
      transcriptBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [transcript]);

  // ── Process TTS Queue ──
  const processTTSQueue = useCallback(async () => {
    if (isSpeakingSentenceRef.current || ttsQueueRef.current.length === 0) return;
    
    isSpeakingSentenceRef.current = true;
    const text = ttsQueueRef.current.shift()!;
    setIsSpeaking(true);

    const onFinish = () => {
       isSpeakingSentenceRef.current = false;
       if (ttsQueueRef.current.length > 0) {
         processTTSQueue();
       } else {
         setIsSpeaking(false);
         // Resume listening after agent finishes speaking
         if (isActiveRef.current && recognitionRef.current) {
           try {
             recognitionRef.current.start();
             setIsListening(true);
           } catch(e) {}
         }
       }
    };

    // Browser SpeechSynthesis fallback — works with zero external services
    const speakViaBrowser = () => {
      if (typeof window === "undefined" || !window.speechSynthesis) {
        onFinish();
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v =>
        v.name.includes("Samantha") ||
        v.name.includes("Google US English") ||
        v.name.includes("Google UK English Female") ||
        (v.lang === "en-US" && !v.name.includes("Google"))
      );
      if (preferred) utterance.voice = preferred;
      utterance.onend = onFinish;
      utterance.onerror = onFinish;
      window.speechSynthesis.speak(utterance);
    };

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2500);

      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice: "af_heart" }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) throw new Error("TTS failed");

      const arrayBuffer = await res.arrayBuffer();
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.onended = onFinish;
      source.start();
    } catch {
      speakViaBrowser();
    }
  }, []);

  const queueSpeech = useCallback((text: string) => {
    ttsQueueRef.current.push(text);
    processTTSQueue();
  }, [processTTSQueue]);

  const processUserSpeech = useCallback(async (userText: string) => {
    setIsListening(false);
    // Use refs to get current transcript/persona without causing stale closure
    const currentTranscript = transcriptRef.current;
    const newTranscript = [...currentTranscript, { role: "user" as const, text: userText }];
    setTranscript(newTranscript);

    try {
      const chatRes = await fetch("/api/voice/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt: agentPersonaRef.current,
          messages: newTranscript.map(m => ({
            role: m.role === "agent" ? "assistant" : "user",
            content: m.text
          }))
        })
      });

      if (chatRes.ok && chatRes.body) {
        const reader = chatRes.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let accumulatedText = "";
        let sentenceBuffer = "";

        // Add placeholder message for streaming text
        setTranscript(prev => [...prev, { role: "agent", text: "" }]);
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          accumulatedText += chunk;
          sentenceBuffer += chunk;
          
          // Update the transcript in the UI
          setTranscript(prev => {
            const updated = [...prev];
            updated[updated.length - 1].text = accumulatedText;
            return updated;
          });

          // Check for sentence boundaries (. ? !)
          const match = sentenceBuffer.match(/([^.!?]+[.!?]+)(?:\s+|$)/);
          if (match) {
            const sentence = match[1];
            sentenceBuffer = sentenceBuffer.replace(sentence, "").trim();
            queueSpeech(sentence.trim());
          }
        }
        
        // Queue any remaining text
        if (sentenceBuffer.trim()) {
           queueSpeech(sentenceBuffer.trim());
        }
      }
    } catch(e) {
      console.error("Voice chat error:", e);
    }
  }, [queueSpeech]);

  // Initialize SpeechRecognition ONCE. Use refs for all callbacks to avoid stale closures.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      if (text.trim().length > 0) {
        processUserSpeech(text);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      // Use refs — not captured state — to avoid stale closures
      if (isActiveRef.current && !isSpeakingRef.current) {
        setTimeout(() => {
          if (isActiveRef.current && !isSpeakingRef.current) {
            try {
              recognition.start();
              setIsListening(true);
            } catch(e) {}
          }
        }, 500);
      }
    };

    recognitionRef.current = recognition;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processUserSpeech]); // Only re-run if processUserSpeech identity changes (it's stable via useCallback)

  // Call Duration Ticker
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setCallSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => clearInterval(timerRef.current!);
  }, [isActive]);

  const handleStartCall = async () => {
    setTranscript([{ role: "agent", text: greetingText }]);
    setCallSeconds(0);
    setIsActive(true);
    
    // Agent speaks greeting
    queueSpeech(greetingText);
  };

  const handleEndCall = () => {
    setIsActive(false);
    setIsListening(false);
    setIsSpeaking(false);
    ttsQueueRef.current = [];
    isSpeakingSentenceRef.current = false;
    if (recognitionRef.current) recognitionRef.current.stop();
    // Stop browser SpeechSynthesis if it's currently speaking
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen bg-slate-50 dark:bg-[#0a0a0f] text-slate-900 dark:text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Voice Receptionist</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
            Powered by Gemini 2.5 Flash and Kokoro TTS.
          </p>
        </div>
        <button
          onClick={() => setIsConfigOpen(true)}
          className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm flex items-center gap-2"
        >
          <Settings2 className="w-4 h-4" /> Config
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN - THE CALL INTERFACE */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden">
          {!isActive && (
            <div className="flex flex-col items-center z-10">
              <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                <Mic className="w-8 h-8 text-slate-400" />
              </div>
              <h2 className="text-xl font-bold mb-2">Agent Idle</h2>
              <p className="text-slate-500 dark:text-slate-400 text-center text-sm mb-8">
                Ready to take incoming voice calls.
              </p>
              <button
                onClick={handleStartCall}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-2"
              >
                <Phone className="w-5 h-5" /> Start Test Call
              </button>
            </div>
          )}

          {isActive && (
            <div className="flex flex-col items-center w-full z-10">
              <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-8 font-mono bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                {Math.floor(callSeconds / 60)}:{(callSeconds % 60).toString().padStart(2, "0")}
              </div>

              {/* PULSING AVATAR */}
              <div className="relative mb-12">
                {isSpeaking && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute inset-0 bg-blue-500 rounded-full blur-xl"
                  />
                )}
                <div className={`w-32 h-32 rounded-full flex items-center justify-center relative z-10 border-4 transition-colors duration-500 ${isSpeaking ? 'border-blue-500 bg-blue-500/10' : isListening ? 'border-green-500 bg-green-500/10' : 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800'}`}>
                  {isSpeaking ? (
                    <Volume2 className="w-12 h-12 text-blue-500 animate-pulse" />
                  ) : isListening ? (
                    <Mic className="w-12 h-12 text-green-500" />
                  ) : (
                    <Phone className="w-12 h-12 text-slate-400" />
                  )}
                </div>
              </div>

              <div className="h-6 text-sm font-medium mb-12 text-center text-slate-600 dark:text-slate-300">
                {isSpeaking ? "AI is speaking..." : isListening ? "Listening..." : "Processing..."}
              </div>

              <button
                onClick={handleEndCall}
                className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/20 transition-transform active:scale-95"
              >
                <PhoneOff className="w-6 h-6 text-white" />
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN - TRANSCRIPT */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 flex-1 overflow-hidden flex flex-col h-[500px] shadow-sm">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Live Transcript
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {transcript.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl p-4 ${
                    msg.role === "user" 
                      ? "bg-blue-600 text-white rounded-br-none" 
                      : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-none border border-slate-200 dark:border-slate-700"
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              ))}
              <div ref={transcriptBottomRef} />
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        title="Configure AI Receptionist Persona"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">Initial Greeting Text</label>
            <input type="text" value={greetingText} onChange={(e) => setGreetingText(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">AI Persona System Prompt</label>
            <textarea rows={4} value={agentPersona} onChange={(e) => setAgentPersona(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-xs focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </Modal>
    </div>
  );
}
