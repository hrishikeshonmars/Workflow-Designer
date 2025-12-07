import React, { useState, useRef, useCallback, useMemo } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  MiniMap,
} from 'reactflow';
import { Sidebar } from '../components/Sidebar';
import { PropertiesPanel } from '../components/PropertiesPanel';
import { SimulationPanel } from '../components/SimulationPanel';
import { StartNode, TaskNode, ApprovalNode, AutomatedNode, EndNode } from '../components/nodes/WorkflowNodes';
import { NodeType, NodeData, SimulationResult, WorkflowNode } from '../types';
import { simulateWorkflow } from '../services/mockApi';
import { Play, Download, Upload } from 'lucide-react';

// initial
const initialNodes: Node<NodeData>[] = [
  {
    id: '1',
    type: NodeType.START,
    data: { label: 'Start Onboarding' },
    position: { x: 250, y: 50 },
  },
  {
    id: '2',
    type: NodeType.TASK,
    data: { label: 'Collect Documents', assignee: 'HR Admin' },
    position: { x: 250, y: 200 },
  },
  {
    id: '3',
    type: NodeType.END,
    data: { label: 'End', endMessage: 'All Done' },
    position: { x: 650, y: 200 },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#94a3b8' } },
  { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#94a3b8' } },
];

const WorkflowBuilderContent = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Simulation state
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [showSimPanel, setShowSimPanel] = useState(false);

  const nodeTypes = useMemo(() => ({
    [NodeType.START]: StartNode,
    [NodeType.TASK]: TaskNode,
    [NodeType.APPROVAL]: ApprovalNode,
    [NodeType.AUTOMATED]: AutomatedNode,
    [NodeType.END]: EndNode,
  }), []);

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#94a3b8' } }, eds)), [setEdges]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    if (!reactFlowInstance) return;
    const type = event.dataTransfer.getData('application/reactflow') as NodeType;
    const label = event.dataTransfer.getData('application/reactflow-label');
    if (!type) return;
    const bounds = reactFlowWrapper.current!.getBoundingClientRect();
    const position = reactFlowInstance.project ? reactFlowInstance.project({ x: event.clientX - bounds.left, y: event.clientY - bounds.top }) : reactFlowInstance.clientToGrid ? reactFlowInstance.clientToGrid({ x: event.clientX, y: event.clientY }) : { x: event.clientX - bounds.left, y: event.clientY - bounds.top };

    const newNode: Node<NodeData> = {
      id: `${type}-${Date.now()}`,
      type,
      position,
      data: { label: label || `New ${type}` },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [reactFlowInstance, setNodes]);

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const handleNodeChange = (id: string, newData: NodeData) => {
    setNodes((nds) => nds.map(n => n.id === id ? { ...n, data: newData } : n));
  };

  const handleDeleteNode = (id: string) => {
    // remove edges connected to node
    setEdges((eds) => eds.filter(e => e.source !== id && e.target !== id));
    setNodes((nds) => nds.filter(n => n.id !== id));
    setSelectedNodeId(null);
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || null;

  const handleRunSimulation = async () => {
    setShowSimPanel(true);
    setIsSimulating(true);
    setSimulationResult(null);
    try {
      const result = await simulateWorkflow(nodes as WorkflowNode[], edges);
      setSimulationResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleExport = () => {
    const payload = { nodes, edges };
    const data = JSON.stringify(payload, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workflow.json';
    a.click();
  };

  const handleImport = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (parsed.nodes && parsed.edges) {
          setNodes(parsed.nodes);
          setEdges(parsed.edges);
        } else {
          alert('Invalid workflow JSON');
        }
      } catch (err) {
        alert('Failed to parse JSON');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-20 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold text-lg">HR</div>
          <h1 className="text-xl font-bold text-slate-800">Workflow Designer <span className="text-xs font-normal text-slate-400 ml-2 border border-slate-200 px-2 py-0.5 rounded-full">PROTOTYPE</span></h1>
        </div>

        <div className="flex gap-3 items-center">
          <label className="bg-white border border-slate-300 rounded-md px-3 py-2 cursor-pointer text-sm text-slate-600 hover:bg-slate-50">
            <Upload className="w-4 h-4 inline mr-2" />
            <input hidden type="file" accept="application/json" onChange={(e) => handleImport(e.target.files?.[0] || null)} />
            Import
          </label>

          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50">
            <Download className="w-4 h-4" />
            Export JSON
          </button>

          <button onClick={handleRunSimulation} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-sm">
            <Play className="w-4 h-4" />
            Test Workflow
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <div className="flex-1 relative bg-slate-50" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            snapToGrid
            attributionPosition="bottom-left"
          >
            <Background color="#cbd5e1" variant={BackgroundVariant.Dots} />
            <Controls className="bg-white border border-slate-200 shadow-sm text-slate-600" />
            <MiniMap
              nodeStrokeColor={(n) => {
                if (n.type === NodeType.START) return '#22c55e';
                if (n.type === NodeType.END) return '#ef4444';
                if (n.type === NodeType.TASK) return '#3b82f6';
                return '#64748b';
              }}
              nodeColor={() => '#fff'}
              className="border border-slate-200 shadow-sm rounded-lg overflow-hidden"
            />
          </ReactFlow>
        </div>

        {selectedNode && (
          <PropertiesPanel
            selectedNode={selectedNode}
            onChange={handleNodeChange}
            onDelete={handleDeleteNode}
            onClose={() => setSelectedNodeId(null)}
          />
        )}
      </div>

      {showSimPanel && (
        <SimulationPanel isRunning={isSimulating} result={simulationResult} onClose={() => setShowSimPanel(false)} />
      )}
    </div>
  );
};

export const WorkflowBuilder = () => (
  <ReactFlowProvider>
    <WorkflowBuilderContent />
  </ReactFlowProvider>
);
