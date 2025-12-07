import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { PlayCircle, CheckCircle, FileText, Zap, StopCircle } from 'lucide-react';
import { NodeData } from '../../types';

// BaseNode to reduce duplication
const BaseNode = ({ children, icon: Icon, colorClass, label, selected }: { children?: React.ReactNode; icon: React.ElementType; colorClass: string; label: string; selected?: boolean }) => (
  <div className={`custom-node-wrapper w-64 shadow-md rounded-lg bg-white border border-slate-200 transition-all duration-200 ${selected ? 'ring-2 ring-blue-500 border-blue-500' : ''}`}>
    <div className={`flex items-center px-4 py-2 rounded-t-lg border-b border-slate-100 ${colorClass} bg-opacity-10`}>
      <Icon className={`w-4 h-4 mr-2 ${colorClass.replace('bg-', 'text-')}`} />
      <span className="font-semibold text-sm text-slate-700">{label}</span>
    </div>
    <div className="p-3 text-xs text-slate-500">
      {children || <span className="italic opacity-50">No configuration</span>}
    </div>
  </div>
);

export const StartNode = memo(({ data, selected }: NodeProps<NodeData>) => {
  return (
    <>
      <BaseNode icon={PlayCircle} colorClass="bg-green-500 text-green-600" label={data.label} selected={selected}>
        <div>Process Entry Point</div>
      </BaseNode>
      <Handle type="source" position={Position.Right} className="!bg-green-500" />
    </>
  );
});

export const TaskNode = memo(({ data, selected }: NodeProps<NodeData>) => {
  return (
    <>
      <Handle type="target" position={Position.Left} className="!bg-blue-400" />
      <BaseNode icon={FileText} colorClass="bg-blue-500 text-blue-600" label={data.label} selected={selected}>
        <div className="flex flex-col gap-1">
          <p><strong>Assignee:</strong> {data.assignee || 'Unassigned'}</p>
          {data.dueDate && <p><strong>Due:</strong> {data.dueDate}</p>}
        </div>
      </BaseNode>
      <Handle type="source" position={Position.Right} className="!bg-blue-400" />
    </>
  );
});

export const ApprovalNode = memo(({ data, selected }: NodeProps<NodeData>) => {
  return (
    <>
      <Handle type="target" position={Position.Left} className="!bg-purple-400" />
      <BaseNode icon={CheckCircle} colorClass="bg-purple-500 text-purple-600" label={data.label} selected={selected}>
        <div className="flex flex-col gap-1">
          <p><strong>Role:</strong> {data.approverRole || 'Manager'}</p>
          {data.autoApproveThreshold !== undefined && <p><strong>Auto-Approve:</strong> &lt; {data.autoApproveThreshold}h</p>}
        </div>
      </BaseNode>
      <Handle type="source" position={Position.Right} className="!bg-purple-400" />
    </>
  );
});

export const AutomatedNode = memo(({ data, selected }: NodeProps<NodeData>) => {
  return (
    <>
      <Handle type="target" position={Position.Left} className="!bg-amber-400" />
      <BaseNode icon={Zap} colorClass="bg-amber-500 text-amber-600" label={data.label} selected={selected}>
        <div className="flex flex-col gap-1">
          <p><strong>Action:</strong> {data.actionId || 'None'}</p>
          {data.actionParams && Object.keys(data.actionParams).length > 0 && (
            <div className="mt-2 text-xs text-slate-600">
              <strong>Params:</strong>
              <ul className="list-disc list-inside">
                {Object.entries(data.actionParams).map(([k, v]) => <li key={k}>{k}: {String(v)}</li>)}
              </ul>
            </div>
          )}
        </div>
      </BaseNode>
      <Handle type="source" position={Position.Right} className="!bg-amber-400" />
    </>
  );
});

export const EndNode = memo(({ data, selected }: NodeProps<NodeData>) => {
  return (
    <>
      <Handle type="target" position={Position.Left} className="!bg-red-400" />
      <BaseNode icon={StopCircle} colorClass="bg-red-500 text-red-600" label={data.label} selected={selected}>
        <div className="truncate">{data.endMessage || 'Process Completed'}</div>
      </BaseNode>
    </>
  );
});
