"use client";

import { useEffect, useState, useRef } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  BarVisualizer,
  useVoiceAssistant,
  useConnectionState,
  useTranscriptions,
  useLocalParticipant,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { ConnectionState } from "livekit-client";
import { Loader2, Mic, MicOff, Phone, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VoicePage() {
  const [token, setToken] = useState("");
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");

  const startCall = async () => {
    try {
      const res = await fetch("/api/livekit/token");
      if (!res.ok) throw new Error("Failed to get token");
      const data = await res.json();
      if (!data.token) throw new Error("No token in response");
      setToken(data.token);
      setConnected(true);
      setError("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    }
  };

  const endCall = () => {
    setToken("");
    setConnected(false);
  };

  return (
    <div
      className="flex flex-col absolute inset-0 z-10"
      style={{ background: "#0A0A0F", color: "white" }}
    >
      {/* Header */}
      <div
        className="px-8 py-5 border-b flex items-center justify-between"
        style={{ borderColor: "#242438" }}
      >
        <div>
          <h1 className="text-xl font-semibold">Voice Agent</h1>
          <p className="text-sm mt-0.5" style={{ color: "#8B8BA3" }}>
            AI-powered voice assistant — English only
          </p>
        </div>
        {connected && (
          <Button
            onClick={endCall}
            variant="destructive"
            className="gap-2"
            size="sm"
          >
            <PhoneOff className="h-4 w-4" />
            End Call
          </Button>
        )}
      </div>

      {/* Main area */}
      <div className="flex-1 flex">
        {!connected ? (
          /* Start screen */
          <div className="flex-1 flex flex-col items-center justify-center gap-8">
            <div className="text-center space-y-3">
              <div
                className="h-28 w-28 rounded-full mx-auto flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #6C3EFF, #0FCCCE)",
                  boxShadow: "0 0 60px rgba(108,62,255,0.4)",
                }}
              >
                <Mic className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-2xl font-semibold mt-4">
                Talk to Sano AI
              </h2>
              <p className="text-sm max-w-xs mx-auto" style={{ color: "#8B8BA3" }}>
                Click the button below to start a voice session. The AI will
                listen, think, and respond in real-time.
              </p>
            </div>

            {error && (
              <div
                className="px-4 py-2 rounded-lg text-sm"
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  color: "#FCA5A5",
                }}
              >
                {error}
              </div>
            )}

            <Button
              onClick={startCall}
              size="lg"
              className="gap-2 px-8"
              style={{ background: "linear-gradient(135deg, #6C3EFF, #0FCCCE)" }}
            >
              <Phone className="h-4 w-4" />
              Start Voice Session
            </Button>
          </div>
        ) : (
          /* Active call */
          <LiveKitRoom
            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
            token={token}
            connect={true}
            audio={true}
            video={false}
            className="flex flex-1 w-full h-full min-h-0 overflow-hidden"
          >
            <RoomAudioRenderer />
            <ActiveCall />
          </LiveKitRoom>
        )}
      </div>
    </div>
  );
}

function ActiveCall() {
  const connectionState = useConnectionState();
  const { state, audioTrack } = useVoiceAssistant();
  const transcriptions = useTranscriptions();
  const [muted, setMuted] = useState(false);
  const transcriptRef = useRef<HTMLDivElement>(null);

  const { localParticipant } = useLocalParticipant();

  const toggleMute = async () => {
    const newMuted = !muted;
    setMuted(newMuted);
    if (localParticipant) {
      await localParticipant.setMicrophoneEnabled(!newMuted);
    }
  };


  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcriptions]);

  const getOrbStyle = () => {
    switch (state) {
      case "listening":
        return {
          bg: "linear-gradient(135deg, #10B981, #34D399)",
          shadow: "0 0 50px rgba(16,185,129,0.5)",
          label: "Listening...",
        };
      case "speaking":
        return {
          bg: "linear-gradient(135deg, #6C3EFF, #0FCCCE)",
          shadow: "0 0 50px rgba(108,62,255,0.6)",
          label: "Speaking...",
        };
      case "thinking":
        return {
          bg: "linear-gradient(135deg, #F59E0B, #FCD34D)",
          shadow: "0 0 50px rgba(245,158,11,0.5)",
          label: "Thinking...",
        };
      default:
        return {
          bg: "linear-gradient(135deg, #374151, #6B7280)",
          shadow: "none",
          label:
            connectionState === ConnectionState.Connecting
              ? "Connecting..."
              : "Idle",
        };
    }
  };

  const orb = getOrbStyle();

  return (
    <div className="absolute inset-0 flex overflow-hidden">
      {/* Orb panel */}
      <div
        className="flex-1 flex flex-col items-center justify-center gap-8"
        style={{ borderRight: "1px solid #242438" }}
      >
        {/* Animated orb */}
        <div className="relative flex items-center justify-center">
          {/* Pulse rings */}
          {(state === "speaking" || state === "listening") && (
            <>
              <div
                className="absolute rounded-full animate-ping"
                style={{
                  width: 220,
                  height: 220,
                  background: orb.bg,
                  opacity: 0.08,
                  animationDuration: "2.5s",
                }}
              />
              <div
                className="absolute rounded-full animate-pulse"
                style={{
                  width: 190,
                  height: 190,
                  background: orb.bg,
                  opacity: 0.15,
                }}
              />
            </>
          )}

          {/* Core */}
          <div
            className="relative z-10 flex items-center justify-center rounded-full transition-all duration-500"
            style={{
              width: 160,
              height: 160,
              background: orb.bg,
              boxShadow: orb.shadow,
            }}
          >
            {audioTrack && state === "speaking" ? (
              <BarVisualizer
                trackRef={audioTrack}
                className="h-16 w-20"
                barCount={6}
                options={{ minHeight: 4 }}
              />
            ) : connectionState === ConnectionState.Connecting ? (
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            ) : (
              <Mic className="h-10 w-10 text-white" />
            )}
          </div>
        </div>

        <p className="text-lg font-medium" style={{ color: "#D1D5DB" }}>
          {orb.label}
        </p>

        {/* Mute button */}
        <Button
          variant={muted ? "destructive" : "secondary"}
          size="lg"
          className="rounded-full h-14 w-14 p-0"
          onClick={toggleMute}
          title={muted ? "Unmute" : "Mute"}
        >
          {muted ? (
            <MicOff className="h-5 w-5" />
          ) : (
            <Mic className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Transcript panel */}
      <div
        className="w-96 flex flex-col h-full min-h-0"
        style={{ background: "#13131F" }}
      >
        <div
          className="px-5 py-4 border-b"
          style={{ borderColor: "#242438" }}
        >
          <h3 className="text-sm font-semibold">Transcript</h3>
          <p className="text-xs mt-0.5" style={{ color: "#8B8BA3" }}>
            Live conversation log
          </p>
        </div>

        <div
          ref={transcriptRef}
          className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0"
        >
          {transcriptions.length === 0 ? (
            <div
              className="flex h-full items-center justify-center"
              style={{ color: "#4A4A6A" }}
            >
              <p className="text-sm text-center">
                Conversation will appear here
                <br />
                once you start speaking
              </p>
            </div>
          ) : (
            transcriptions.map((t) => {
              const isAgent =
                t.participantInfo?.identity?.startsWith("agent") ?? false;
              return (
                <div
                  key={t.streamInfo?.id ?? Math.random()}
                  className={`flex ${isAgent ? "justify-start" : "justify-end"}`}
                >
                  <div>
                    <p
                      className="text-xs mb-1"
                      style={{ color: "#4A4A6A" }}
                    >
                      {isAgent ? "Sano AI" : "You"}
                    </p>
                    <div
                      className="px-4 py-2.5 rounded-2xl text-sm max-w-[280px]"
                      style={{
                        background: isAgent
                          ? "rgba(108,62,255,0.15)"
                          : "#1F2937",
                        color: isAgent ? "#C4B5FD" : "white",
                        border: isAgent
                          ? "1px solid rgba(108,62,255,0.3)"
                          : "1px solid #374151",
                      }}
                    >
                      {t.text ?? "..."}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
