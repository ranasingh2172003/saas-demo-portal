"use client";

import { useState } from "react";
import { Mic, Phone, PhoneOff, Settings2 } from "lucide-react";
import { motion } from "framer-motion";
import { LiveKitRoom, RoomAudioRenderer, VoiceAssistantControlBar, BarVisualizer, useVoiceAssistant } from "@livekit/components-react";
import "@livekit/components-styles";

export default function VoiceReceptionist() {
  const [token, setToken] = useState("");
  const [isActive, setIsActive] = useState(false);

  const handleStartCall = async () => {
    try {
      const res = await fetch(`/api/livekit/token?room=receptionist-${Date.now()}&participantName=User`);
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
    <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen bg-slate-50 dark:bg-[#0a0a0f] text-slate-900 dark:text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Voice Receptionist</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
            Powered by LiveKit WebRTC and our local Voice Agent.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 flex flex-col items-center justify-center min-h-[500px] shadow-sm relative overflow-hidden">
        {!isActive ? (
          <div className="flex flex-col items-center z-10 text-center">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
              <Mic className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">Agent Idle</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">Ready to take incoming voice calls.</p>
            <button
              onClick={handleStartCall}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-2"
            >
              <Phone className="w-5 h-5" /> Start Test Call
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
        <div className={`w-32 h-32 rounded-full flex items-center justify-center relative z-10 border-4 transition-colors duration-500 ${isSpeaking ? 'border-blue-500 bg-blue-500/10' : isListening ? 'border-green-500 bg-green-500/10' : 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800'}`}>
          {isSpeaking ? <Settings2 className="w-12 h-12 text-blue-500 animate-pulse" /> : isListening ? <Mic className="w-12 h-12 text-green-500" /> : <Phone className="w-12 h-12 text-slate-400" />}
        </div>
      </div>
      
      <div className="h-24 w-full max-w-md flex items-center justify-center mb-8">
        {audioTrack && <BarVisualizer state={state} barCount={5} trackRef={audioTrack} className="h-full w-full text-blue-500" />}
      </div>

      <div className="h-6 text-sm font-medium mb-12 text-slate-600 dark:text-slate-300">
        {state === "connecting" ? "Connecting to Agent..." : state === "speaking" ? "Agent is speaking..." : state === "listening" ? "Listening..." : "Processing voice..."}
      </div>
      
      <div className="flex gap-4">
        <VoiceAssistantControlBar />
        <button onClick={onEndCall} className="w-12 h-12 bg-red-500 hover:bg-red-600 rounded-lg flex items-center justify-center shadow-lg transition-transform active:scale-95">
          <PhoneOff className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
}
