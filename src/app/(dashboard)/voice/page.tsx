"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Phone, PhoneOff, Settings2, Volume2 } from "lucide-react";
import Modal from "@/components/Modal";
import { motion } from "framer-motion";

export default function VoiceAgent() {
  const [isActive, setIsActive] = useState(false);
  const [callSeconds, setCallSeconds] = useState(0);
  const [transcript, setTranscript] = useState<{ role: string; text: string }[]>([]);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // WebSocket for PersonaPlex (Moshi)
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
    try {
      // 1. Get Microphone Access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // 2. Setup AudioContext for sending PCM to Moshi and playing audio back
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = audioCtx;
      
      // 3. Setup WebSocket to PersonaPlex Server (Port 8998)
      // Since Codespace forwards ports, we connect to the forwarded URL or localhost
      const wsUrl = window.location.hostname.includes('github.dev') 
          ? `wss://${window.location.hostname.replace('3000', '8998')}/chat`
          : 'ws://localhost:8998/chat';
          
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setTranscript((prev) => [...prev, { role: "system", text: "Connected to PersonaPlex (Moshi) Server." }]);
        setIsActive(true);
        setCallSeconds(0);
      };

      ws.onmessage = async (event) => {
        // Moshi returns audio frames (binary) and transcript (JSON text)
        if (typeof event.data === "string") {
          try {
            const data = JSON.parse(event.data);
            if (data.text) {
              setTranscript((prev) => [...prev, { role: "agent", text: data.text }]);
            }
          } catch (e) {
            console.error("Failed to parse Moshi text frame", e);
          }
        } else if (event.data instanceof Blob) {
          // Play the audio frame returned by Moshi
          setIsSpeaking(true);
          const arrayBuffer = await event.data.arrayBuffer();
          audioCtx.decodeAudioData(arrayBuffer, (audioBuffer) => {
            const source = audioCtx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioCtx.destination);
            source.onended = () => setIsSpeaking(false);
            source.start(0);
          });
        }
      };

      ws.onclose = () => {
        handleEndCall();
      };

      // 4. Capture Mic Audio and stream to WebSocket
      const source = audioCtx.createMediaStreamSource(stream);
      microphoneRef.current = source;
      
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;
      
      source.connect(processor);
      processor.connect(audioCtx.destination);
      
      processor.onaudioprocess = (e) => {
        if (ws.readyState === WebSocket.OPEN) {
          const inputData = e.inputBuffer.getChannelData(0);
          // Convert Float32 to Int16 PCM (Moshi expects 16-bit PCM)
          const pcm16 = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            pcm16[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
          }
          ws.send(pcm16.buffer);
        }
      };
      
    } catch (err) {
      console.error("Failed to start call:", err);
      setTranscript((prev) => [...prev, { role: "system", text: "Error: Could not connect to PersonaPlex server or access microphone." }]);
    }
  };

  const handleEndCall = () => {
    setIsActive(false);
    setIsSpeaking(false);
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (processorRef.current && microphoneRef.current) {
      microphoneRef.current.disconnect();
      processorRef.current.disconnect();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    setTranscript((prev) => [...prev, { role: "system", text: "Call Ended." }]);
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen bg-slate-50 dark:bg-[#0a0a0f] text-slate-900 dark:text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Voice Receptionist</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
            Powered by NVIDIA PersonaPlex (Moshi) Full-Duplex Audio
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
              <h2 className="text-xl font-bold mb-2">PersonaPlex Idle</h2>
              <p className="text-slate-500 dark:text-slate-400 text-center text-sm mb-8">
                Ready to take full-duplex conversational calls.
              </p>
              <button
                onClick={handleStartCall}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-2"
              >
                <Phone className="w-5 h-5" /> Connect via WebSocket
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
                <div className={`w-32 h-32 rounded-full flex items-center justify-center relative z-10 border-4 transition-colors duration-500 ${isSpeaking ? 'border-blue-500 bg-blue-500/10' : 'border-green-500 bg-green-500/10'}`}>
                  {isSpeaking ? (
                    <Volume2 className="w-12 h-12 text-blue-500 animate-pulse" />
                  ) : (
                    <Mic className="w-12 h-12 text-green-500" />
                  )}
                </div>
              </div>

              <div className="h-6 text-sm font-medium mb-12 text-center text-slate-600 dark:text-slate-300">
                {isSpeaking ? "AI is speaking..." : "Listening & Processing..."}
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
                WebSocket Feed
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {transcript.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "system" ? "justify-center" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl p-4 ${
                    msg.role === "system" 
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs text-center border border-slate-200 dark:border-slate-700" 
                      : "bg-blue-50 text-blue-900 dark:bg-blue-900/20 dark:text-blue-100 rounded-bl-none border border-blue-100 dark:border-blue-800"
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        title="PersonaPlex Configuration"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Note: PersonaPlex runs entirely on WebSockets and streams raw audio natively. System prompts must be configured on the Moshi Python backend, not the frontend.
          </p>
        </div>
      </Modal>
    </div>
  );
}
