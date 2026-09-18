"use client";
import { Rocket, Copy, Play, Square, AlertCircle, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function DeployedAgents() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAgents() {
      try {
        const res = await fetch("/api/agents");
        if (res.ok) {
          const data = await res.json();
          setAgents(data);
        }
      } catch (e) {
        console.error("Failed to fetch agents", e);
      } finally {
        setLoading(false);
      }
    }
    fetchAgents();
  }, []);

  return (
    <div className="min-h-screen bg-[#0d0d14] text-white p-8 font-sans">
      <div className="max-w-6xl mx-auto flex flex-col h-full">
        
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-100">My Deployed Agents</h1>
          <Link href="/sbo" className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors text-sm">
            <Plus size={16} /> New Agent (Voice Builder)
          </Link>
        </div>

        {loading ? (
          <div className="text-gray-400">Loading your AI modules...</div>
        ) : agents.length === 0 ? (
          <div className="text-gray-400 bg-[#111118] border border-gray-800 rounded-xl p-8 text-center">
            You haven't built any agents yet. Click "New Agent" to talk to the AI Architect.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {agents.map((agent) => {
              const status = agent.status === "stopped" ? "Paused" : "Running";
              const date = new Date(agent.created_at).toLocaleDateString();
              
              return (
                <div key={agent.id} className="bg-[#111118] border border-gray-800 rounded-xl p-6 flex flex-col relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-full h-1 ${
                    status === "Running" ? "bg-green-500" :
                    agent.status === "error" ? "bg-red-500" : "bg-gray-600"
                  }`} />

                  <div className="flex justify-between items-start mb-6 mt-1">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-100">{agent.name || "Custom Agent"}</h2>
                      <p className="text-sm text-gray-500 mt-1">Deployed {date}</p>
                    </div>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                      status === "Running" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                      status === "Paused" ? "bg-gray-800 text-gray-400 border-gray-700" : 
                      "bg-gray-800 text-gray-400 border-gray-700"
                    }`}>
                      {status === "Running" && <Play size={10} fill="currentColor" />}
                      {status === "Paused" && <Square size={10} fill="currentColor" />}
                      {status}
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="text-sm text-gray-400 line-clamp-2">
                      {agent.description || "Custom AI automation module."}
                    </p>
                  </div>

                  <div className="mt-auto flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 bg-[#1a1a24] border border-gray-700 rounded-lg flex items-center justify-between px-3 py-2 group cursor-pointer hover:bg-gray-800 transition-colors">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Agent ID</span>
                        <span className="text-xs text-gray-300 font-mono truncate max-w-[150px]">{agent.id}</span>
                      </div>
                      <Copy size={14} className="text-gray-500 group-hover:text-gray-300" />
                    </div>
                    
                    <Link href={`/developer?id=${agent.id}`} className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors bg-gray-800 hover:bg-gray-700 text-white`}>
                      Open IDE
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
