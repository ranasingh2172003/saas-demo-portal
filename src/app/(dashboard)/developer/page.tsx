"use client";
import React, { useState, useEffect, useCallback, Suspense, useRef } from 'react';
import { useSearchParams } from "next/navigation";
import { 
  MessageSquare, Sparkles, Send, Database, GitBranch, Filter, Settings, Search, Plus, Terminal, Rocket 
} from "lucide-react";
import { 
  ReactFlow, ReactFlowProvider, addEdge, Background, Controls, Handle, Position, useNodesState, useEdgesState, useReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// --- CUSTOM NODES ---

const TriggerNode = ({ data, selected }: any) => (
  <div className={`w-48 bg-[#1a1a24] border-2 rounded-xl p-4 shadow-lg ${selected ? 'border-purple-400 shadow-purple-900/40' : 'border-purple-500/50 shadow-purple-900/20'}`}>
    <div className="text-[10px] text-purple-400 font-bold mb-2">TRIGGER</div>
    <div className="flex items-center gap-2">
      {data.label === 'API Call' ? <Terminal size={16} className="text-purple-400" /> : <MessageSquare size={16} className="text-purple-400" />}
      <span className="text-sm font-medium text-white">{data.label}</span>
    </div>
    <Handle type="source" position={Position.Bottom} className="!bg-purple-500 !w-3 !h-3 !border-2 !border-[#1a1a24]" />
  </div>
);

const ActionNode = ({ data, selected }: any) => (
  <div className={`w-64 bg-blue-900/20 border-2 rounded-xl p-4 shadow-lg ${selected ? 'border-blue-400 shadow-blue-900/40' : 'border-blue-500/50 shadow-blue-900/20'}`}>
    <Handle type="target" position={Position.Top} className="!bg-blue-500 !w-3 !h-3 !border-2 !border-[#1a1a24]" />
    <div className="text-[10px] text-blue-400 font-bold mb-2">ACTION</div>
    <div className="flex items-center gap-2 mb-2">
      <Sparkles size={16} className="text-blue-400" />
      <span className="text-sm font-medium text-white">{data.label}</span>
    </div>
    <div className="text-xs text-gray-400 bg-black/40 p-2 rounded border border-gray-800 line-clamp-3">
      {data.config?.systemPrompt || "No prompt provided"}
    </div>
    <Handle type="source" position={Position.Bottom} className="!bg-blue-500 !w-3 !h-3 !border-2 !border-[#1a1a24]" />
  </div>
);

const OutputNode = ({ data, selected }: any) => {
  const isSend = data.label === 'Send Reply';
  const color = isSend ? 'green' : 'orange';
  return (
    <div className={`w-48 bg-[#1a1a24] border-2 rounded-xl p-4 shadow-lg ${selected ? `border-${color}-400` : `border-${color}-500/50`}`}>
      <Handle type="target" position={Position.Top} className={`!bg-${color}-500 !w-3 !h-3 !border-2 !border-[#1a1a24]`} />
      <div className={`text-[10px] text-${color}-400 font-bold mb-2`}>OUTPUT</div>
      <div className="flex items-center gap-2">
        {isSend ? <Send size={16} className={`text-${color}-400`} /> : <Database size={16} className={`text-${color}-400`} />}
        <span className="text-sm font-medium text-white">{data.label}</span>
      </div>
    </div>
  );
};

const nodeTypes = {
  triggerNode: TriggerNode,
  actionNode: ActionNode,
  outputNode: OutputNode,
};

// --- MAIN IDE ---

function IDEContent() {
  const searchParams = useSearchParams();
  const agentId = searchParams.get("id");
  
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
  const { screenToFlowPosition } = useReactFlow();
  
  const [agent, setAgent] = useState<any>(null);
  const [loading, setLoading] = useState(!!agentId);
  
  const [selectedNode, setSelectedNode] = useState<any>(null);
  // Local state for the right panel form fields
  const [nodeConfig, setNodeConfig] = useState<any>({});

  useEffect(() => {
    const loadDemoGraph = (prompt: string) => {
      const demoNodes = [
        { id: '1', type: 'triggerNode', position: { x: 300, y: 100 }, data: { label: 'WhatsApp Message', config: { webhookUrl: 'https://saas.dripoffai.com/api/webhook/wa', verifyToken: 'my_secure_token' } } },
        { id: '2', type: 'actionNode', position: { x: 268, y: 250 }, data: { label: 'Gemini AI Engine', config: { systemPrompt: prompt, model: 'Gemini 2.5 Flash' } } },
        { id: '3', type: 'outputNode', position: { x: 150, y: 450 }, data: { label: 'Send Reply', config: { template: 'standard_text' } } },
        { id: '4', type: 'outputNode', position: { x: 450, y: 450 }, data: { label: 'Save to DB', config: { dbUrl: 'postgresql://user:pass@localhost:5432/db', tableName: 'conversations' } } },
      ];
      const demoEdges = [
        { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#4b5563' } },
        { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#4b5563' } },
        { id: 'e2-4', source: '2', target: '4', animated: true, style: { stroke: '#4b5563' } },
      ];
      setNodes(demoNodes);
      setEdges(demoEdges);
    };

    if (agentId) {
      fetch(`/api/agents/${agentId}`)
        .then(res => res.json())
        .then(data => {
           setAgent(data);
           setLoading(false);
           const prompt = data?.workflow_json?.system_prompt || "You are a helpful assistant.";
           loadDemoGraph(prompt);
        })
        .catch(err => {
           console.error(err);
           setLoading(false);
           loadDemoGraph("You are a helpful assistant.");
        });
    } else {
       loadDemoGraph("You are a helpful customer service agent for {{business_name}}. Reply in {{language}}.");
    }
  }, [agentId, setNodes, setEdges]);

  const onConnect = useCallback((params: any) => setEdges((eds: any) => addEdge({ ...params, animated: true, style: { stroke: '#4b5563' } }, eds)), [setEdges]);

  const onDragStart = (event: any, nodeType: string, label: string) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({ type: nodeType, label }));
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDrop = useCallback(
    (event: any) => {
      event.preventDefault();
      if (!reactFlowWrapper.current) return;

      const dataStr = event.dataTransfer.getData('application/reactflow');
      if (!dataStr) return;

      const { type, label } = JSON.parse(dataStr);
      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });

      let defaultConfig = {};
      if (type === 'actionNode') defaultConfig = { systemPrompt: 'New Action Prompt', model: 'Gemini 2.5 Flash' };
      if (label === 'WhatsApp Message') defaultConfig = { webhookUrl: 'https://...', verifyToken: '' };
      if (label === 'Save to DB') defaultConfig = { dbUrl: '', tableName: '' };

      const newNode = {
        id: `dndnode_${Date.now()}`,
        type,
        position,
        data: { label, config: defaultConfig },
      };

      setNodes((nds: any) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes]
  );

  const onDragOver = useCallback((event: any) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onSelectionChange = useCallback(({ nodes }: { nodes: any[] }) => {
    if (nodes.length === 1) {
      setSelectedNode(nodes[0]);
      setNodeConfig(nodes[0].data.config || {});
    } else {
      setSelectedNode(null);
      setNodeConfig({});
    }
  }, []);

  const handleConfigChange = (key: string, value: string) => {
    setNodeConfig((prev: any) => ({ ...prev, [key]: value }));
  };

  const updateNodeData = () => {
    if (selectedNode) {
      setNodes((nds: any) =>
        nds.map((n: any) => {
          if (n.id === selectedNode.id) {
            return {
              ...n,
              data: { ...n.data, config: nodeConfig }
            };
          }
          return n;
        })
      );
    }
  };

  const agentName = agent?.name || "Untitled Agent";

  // Render the right panel fields dynamically based on node type/label
  const renderConfigFields = () => {
    if (!selectedNode) return null;
    const { label } = selectedNode.data;

    if (label === 'Gemini AI' || label === 'Gemini AI Engine') {
      return (
        <>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Model</label>
            <select 
              className="w-full bg-[#1a1a24] border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none text-white"
              value={nodeConfig.model ?? 'Gemini 2.5 Flash'}
              onChange={(e) => handleConfigChange('model', e.target.value)}
            >
              <option>Gemini 2.5 Flash</option>
              <option>Gemini 2.5 Pro</option>
              <option>Whisper (Audio)</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex justify-between">
              System Prompt <span className="text-purple-400 hover:text-purple-300 cursor-pointer">{`{x} Variables`}</span>
            </label>
            <textarea 
              className="w-full bg-[#1a1a24] border border-gray-700 rounded-lg px-3 py-2 text-sm h-64 focus:outline-none resize-none font-mono text-[13px] text-blue-300"
              value={nodeConfig.systemPrompt ?? ''}
              onChange={(e) => handleConfigChange('systemPrompt', e.target.value)}
              placeholder="You are a helpful assistant..."
            ></textarea>
          </div>
        </>
      );
    }

    if (label === 'WhatsApp Message') {
      return (
        <>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Webhook URL (Copy to Meta)</label>
            <input type="text" value={nodeConfig.webhookUrl || ''} onChange={(e) => handleConfigChange('webhookUrl', e.target.value)} className="w-full bg-[#1a1a24] border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none font-mono text-gray-300" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Verify Token</label>
            <input type="text" value={nodeConfig.verifyToken || ''} onChange={(e) => handleConfigChange('verifyToken', e.target.value)} className="w-full bg-[#1a1a24] border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none" placeholder="Enter secure token" />
          </div>
        </>
      );
    }

    if (label === 'Save to DB') {
      return (
        <>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Database Connection String</label>
            <input type="password" value={nodeConfig.dbUrl || ''} onChange={(e) => handleConfigChange('dbUrl', e.target.value)} className="w-full bg-[#1a1a24] border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none" placeholder="postgresql://..." />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Table Name</label>
            <input type="text" value={nodeConfig.tableName || ''} onChange={(e) => handleConfigChange('tableName', e.target.value)} className="w-full bg-[#1a1a24] border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none" placeholder="e.g. leads" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">JSON Payload Mapping</label>
            <textarea 
              className="w-full bg-[#1a1a24] border border-gray-700 rounded-lg px-3 py-2 text-sm h-32 focus:outline-none resize-none font-mono text-[13px] text-gray-400"
              value={nodeConfig.payload ?? '{\n  "message": "{{trigger.text}}"\n}'}
              onChange={(e) => handleConfigChange('payload', e.target.value)}
            ></textarea>
          </div>
        </>
      );
    }
    
    if (label === 'Send Reply') {
      return (
        <>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Message Template</label>
            <select 
              className="w-full bg-[#1a1a24] border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none text-white"
              value={nodeConfig.template ?? 'standard_text'}
              onChange={(e) => handleConfigChange('template', e.target.value)}
            >
              <option value="standard_text">Standard Text</option>
              <option value="interactive_button">Interactive Buttons</option>
              <option value="media_image">Image / Media</option>
            </select>
          </div>
        </>
      );
    }

    return <div className="text-gray-500 text-sm">Additional configuration not required for this node.</div>;
  };

  return (
    <div className="flex h-screen bg-[#0d0d14] text-white font-sans overflow-hidden">
      <div className="flex flex-col flex-1 w-full">
        <div className="h-16 bg-[#111118] border-b border-gray-800 flex items-center justify-between px-6 z-10">
          <h1 className="text-xl font-bold text-gray-100 flex items-center gap-2">
             <span className="text-purple-500">AI Agent IDE</span>
          </h1>
          <div className="flex items-center gap-4">
            <div className="px-4 py-1.5 bg-gray-800 rounded-full text-sm font-medium border border-gray-700">
              {agentName}
            </div>
            <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors border border-gray-700">Test</button>
            <button className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
              <Rocket size={16} /> Deploy
            </button>
          </div>
        </div>

        <div className="flex flex-1 h-[calc(100vh-64px)] relative">
          
          {/* Left Panel */}
          <div className="w-64 h-full bg-[#111118] border-r border-gray-800 flex flex-col z-20 hidden lg:flex">
            <div className="p-4 border-b border-gray-800 font-medium text-sm text-gray-300">Node Library</div>
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              
              <div>
                <h3 className="text-xs font-semibold text-purple-400 mb-2 px-1">TRIGGERS</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2 bg-[#1a1a24] border-l-2 border-purple-500 rounded cursor-grab hover:bg-gray-800" draggable onDragStart={(e) => onDragStart(e, 'triggerNode', 'WhatsApp Message')}>
                    <MessageSquare size={16} className="text-gray-400" />
                    <span className="text-sm font-medium text-gray-300">WhatsApp Message</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-[#1a1a24] border-l-2 border-purple-500 rounded cursor-grab hover:bg-gray-800" draggable onDragStart={(e) => onDragStart(e, 'triggerNode', 'API Call')}>
                    <Terminal size={16} className="text-gray-400" />
                    <span className="text-sm font-medium text-gray-300">API Call</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-blue-400 mb-2 px-1">ACTIONS</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2 bg-[#1a1a24] border-l-2 border-blue-500 rounded cursor-grab hover:bg-gray-800" draggable onDragStart={(e) => onDragStart(e, 'actionNode', 'Gemini AI')}>
                    <Sparkles size={16} className="text-gray-400" />
                    <span className="text-sm font-medium text-gray-300">Gemini AI</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-orange-400 mb-2 px-1">OUTPUTS</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2 bg-[#1a1a24] border-l-2 border-green-500 rounded cursor-grab hover:bg-gray-800" draggable onDragStart={(e) => onDragStart(e, 'outputNode', 'Send Reply')}>
                    <Send size={16} className="text-gray-400" />
                    <span className="text-sm font-medium text-gray-300">Send Reply</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-[#1a1a24] border-l-2 border-orange-500 rounded cursor-grab hover:bg-gray-800" draggable onDragStart={(e) => onDragStart(e, 'outputNode', 'Save to DB')}>
                    <Database size={16} className="text-gray-400" />
                    <span className="text-sm font-medium text-gray-300">Save to DB</span>
                  </div>
                </div>
              </div>
              
            </div>
          </div>

          {/* Center Panel (Canvas) */}
          <div className="flex-1 relative w-full h-full bg-[#0a0a0f]" ref={reactFlowWrapper}>
            {loading ? (
               <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
                 <div className="animate-pulse text-xl text-blue-400">Loading IDE context...</div>
               </div>
            ) : null}

            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onSelectionChange={onSelectionChange}
              nodeTypes={nodeTypes}
              fitView
              className="bg-[#0a0a0f]"
            >
              <Background color="#333" gap={24} size={1} />
              <Controls className="!bg-[#111118] !border-gray-800 !fill-gray-400" />
            </ReactFlow>
          </div>

          {/* Right Panel */}
          <div className="w-full md:w-80 h-64 md:h-full shrink-0 bg-[#111118] border-t md:border-t-0 md:border-l border-gray-800 flex flex-col z-20 hidden md:flex">
            <div className="p-4 border-b border-gray-800 font-medium text-sm text-gray-300">
              {selectedNode ? 'Node Configuration' : 'Select a Node'}
            </div>
            
            {selectedNode ? (
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Label</label>
                  <input type="text" value={selectedNode.data.label} readOnly className="w-full bg-[#1a1a24] border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                </div>

                {/* DYNAMIC NODE SPECIFIC FIELDS */}
                {renderConfigFields()}

                <div className="mt-auto pt-4">
                  <button 
                    onClick={updateNodeData}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 rounded-lg transition-colors text-sm"
                  >
                    Apply Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500 text-sm p-8 text-center">
                Click on a node in the canvas to edit its properties.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AIIDE() {
  return (
    <ReactFlowProvider>
      <Suspense fallback={<div>Loading IDE...</div>}>
        <IDEContent />
      </Suspense>
    </ReactFlowProvider>
  );
}
