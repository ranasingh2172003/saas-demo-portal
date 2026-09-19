"use client";

import { useState, useEffect } from "react";
import { Mic, Phone, Settings2, PhoneOff, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { LiveKitRoom, RoomAudioRenderer, VoiceAssistantControlBar, BarVisualizer, useVoiceAssistant } from "@livekit/components-react";
import "@livekit/components-styles";

export default function VoiceBuilder() {
  const [token, setToken] = useState("");
  const [isActive, setIsActive] = useState(false);

  const handleStartCall = async () => {
    try {
      const res = await fetch(`/api/livekit/token?room=builder-${Date.now()}&participantName=User`);
      const data = await res.json();
      if (data.token) {
        setToken(data.token);
        setIsActive(true);
      } else {
        alert("Failed to get token");
      }
    } catch (e) {
      console.error(e);
      alert("Error starting call");
    }
  };

  const handleEndCall = () => {
    setIsActive(false);
    setToken("");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col p-6 md:p-10 relative">
      <Link href="/sbo/dashboard" className="absolute top-8 left-8 p-2 text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
        <ArrowLeft className="w-5 h-5" />
        <span className="hidden sm:inline">Back to Dashboard</span>
      </Link>

      <div className="max-w-4xl mx-auto w-full mt-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">AI Architect Interview</h1>
          <p className="text-slate-400">Have a conversation with our Lead AI Developer to instantly build and deploy custom modules.</p>
        </div>

        <div className="bg-[#13131a] rounded-3xl border border-slate-800 p-8 flex flex-col items-center justify-center min-h-[400px]">
          {!isActive ? (
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-6">
                <Settings2 className="w-8 h-8 text-slate-400" />
              </div>
              <h2 className="text-xl font-bold mb-2">Architect is Ready</h2>
              <p className="text-slate-400 text-sm mb-8">Tap below to call the developer (LiveKit).</p>
              <button onClick={handleStartCall} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-transform active:scale-95">
                <Phone className="w-5 h-5" /> Start Interview
              </button>
            </div>
          ) : (
            <LiveKitRoom
              serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
              token={token}
              connect={true}
              audio={true}
              video={false}
              onDisconnected={handleEndCall}
              className="flex flex-col items-center w-full"
            >
              <RoomAudioRenderer />
              <AssistantUI onEndCall={handleEndCall} />
            </LiveKitRoom>
          )}
        </div>
      </div>
    </div>
  );
}

function AssistantUI({ onEndCall }: { onEndCall: () => void }) {
  const { state, audioTrack } = useVoiceAssistant();
  const isSpeaking = state === "speaking";
  const isListening = state === "listening";

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative mb-12 flex justify-center w-full">
        {isSpeaking && (
          <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }} className="absolute inset-0 bg-blue-500 rounded-full blur-xl w-32 h-32 mx-auto" />
        )}
        <div className={`w-32 h-32 rounded-full flex items-center justify-center relative z-10 border-4 transition-colors duration-500 ${isSpeaking ? 'border-blue-500 bg-blue-500/10' : isListening ? 'border-green-500 bg-green-500/10' : 'border-slate-700 bg-slate-800'}`}>
          {isSpeaking ? <Settings2 className="w-12 h-12 text-blue-500 animate-pulse" /> : isListening ? <Mic className="w-12 h-12 text-green-500" /> : <Phone className="w-12 h-12 text-slate-400" />}
        </div>
      </div>
      
      <div className="h-24 w-full max-w-md flex items-center justify-center mb-8">
        {audioTrack && <BarVisualizer state={state} barCount={5} trackRef={audioTrack} className="h-full w-full" />}
      </div>

      <div className="h-6 text-sm font-medium mb-12 text-slate-300">
        {state === "connecting" ? "Connecting to Architect..." : state === "speaking" ? "Architect is speaking..." : state === "listening" ? "Listening..." : "Processing voice..."}
      </div>
      
      <div className="flex gap-4">
        <VoiceAssistantControlBar />
        <button onClick={onEndCall} className="w-12 h-12 bg-red-500 hover:bg-red-400 rounded-lg flex items-center justify-center shadow-lg transition-transform active:scale-95">
          <PhoneOff className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
}
