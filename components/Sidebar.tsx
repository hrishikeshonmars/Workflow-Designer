import React from 'react';
import { NodeType } from '../types';
import { PlayCircle, FileText, CheckCircle, Zap, StopCircle, GripVertical } from 'lucide-react';

export const Sidebar = () => {
  const onDragStart = (event: React.DragEvent, nodeType: NodeType, label: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/reactflow-label', label);
    event.dataTransfer.effectAllowed = 'move';
  };

  const draggables = [
    { type: NodeType.START, label: 'Start Flow', icon: PlayCircle, color: 'text-green-600' },
    { type: NodeType.TASK, label: 'Human Task', icon: FileText, color: 'text-blue-600' },
    { type: NodeType.APPROVAL, label: 'Approval Step', icon: CheckCircle, color: 'text-purple-600' },
    { type: NodeType.AUTOMATED, label: 'Automated Action', icon: Zap, color: 'text-amber-600' },
    { type: NodeType.END, label: 'End Flow', icon: StopCircle, color: 'text-red-600' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full shadow-sm z-10">
      <div className="p-4 border-b border-slate-100">
        <h2 className="font-semibold text-slate-800">Components</h2>
        <p className="text-xs text-slate-500 mt-1">Drag nodes to the canvas</p>
      </div>
      <div className="p-4 flex flex-col gap-3 overflow-y-auto">
        {draggables.map((item) => (
          <div
            key={item.type}
            className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg cursor-grab hover:border-blue-400 hover:shadow-md transition-all active:cursor-grabbing group"
            onDragStart={(event) => onDragStart(event, item.type, item.label)}
            draggable
          >
            <GripVertical className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
            <div className={`p-2 rounded-md bg-slate-50 ${item.color.replace('text-', 'bg-').replace('600', '100')}`}>
              <item.icon className={`w-5 h-5 ${item.color}`} />
            </div>
            <span className="text-sm font-medium text-slate-700">{item.label}</span>
          </div>
        ))}
      </div>
    </aside>
  );
};
