import React, { useEffect, useState } from 'react';
import { Node } from 'reactflow';
import { NodeData, NodeType, AutomationAction } from '../types';
import { fetchAutomations } from '../services/mockApi';
import { X, Save, AlertCircle, Plus, Trash2 } from 'lucide-react';

interface PropertiesPanelProps {
  selectedNode: Node<NodeData> | null;
  onChange: (id: string, data: NodeData) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

// Reusable key-value editor
const KeyValueEditor = ({ title, data, onChange }: { title: string; data: Record<string, string> | undefined; onChange: (newData: Record<string, string>) => void }) => {
  const [pairs, setPairs] = useState<{ key: string; value: string }[]>([]);

  useEffect(() => {
    if (data) setPairs(Object.entries(data).map(([k, v]) => ({ key: k, value: v })));
    else setPairs([]);
  }, [data]);

  const updateParent = (newPairs: { key: string; value: string }[]) => {
    setPairs(newPairs);
    const obj = newPairs.reduce((acc: Record<string, string>, curr) => {
      if (curr.key) acc[curr.key] = curr.value;
      return acc;
    }, {});
    onChange(obj);
  };

  const addPair = () => updateParent([...pairs, { key: '', value: '' }]);
  const removePair = (index: number) => {
    const newPairs = [...pairs];
    newPairs.splice(index, 1);
    updateParent(newPairs);
  };
  const handlePairChange = (index: number, field: 'key' | 'value', val: string) => {
    const newPairs = [...pairs];
    newPairs[index][field] = val;
    updateParent(newPairs);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-slate-700">{title}</label>
        <button onClick={addPair} type="button" className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1">
          <Plus className="w-3 h-3" /> Add
        </button>
      </div>

      <div className="space-y-2">
        {pairs.length === 0 && <p className="text-xs text-slate-400 italic">No items defined.</p>}
        {pairs.map((pair, idx) => (
          <div key={idx} className="flex gap-2 items-center">
            <input placeholder="Key" value={pair.key} onChange={(e) => handlePairChange(idx, 'key', e.target.value)} className="w-1/3 px-2 py-1 border border-slate-300 rounded text-xs" />
            <input placeholder="Value" value={pair.value} onChange={(e) => handlePairChange(idx, 'value', e.target.value)} className="flex-1 px-2 py-1 border border-slate-300 rounded text-xs" />
            <button onClick={() => removePair(idx)} className="text-red-400 hover:text-red-600">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ selectedNode, onChange, onDelete, onClose }) => {
  const [formData, setFormData] = useState<NodeData | null>(null);
  const [automations, setAutomations] = useState<AutomationAction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedNode) {
      // ensure there's always an actionParams object
      const base = { ...selectedNode.data };
      if (!base.actionParams) base.actionParams = {};
      setFormData(base);
    } else {
      setFormData(null);
    }
  }, [selectedNode]);

  useEffect(() => {
    if (selectedNode?.type === NodeType.AUTOMATED && automations.length === 0) {
      setLoading(true);
      fetchAutomations().then((data) => {
        setAutomations(data);
        setLoading(false);
      });
    }
  }, [selectedNode, automations.length]);

  const handleChange = <K extends keyof NodeData>(field: K, value: NodeData[K]) => {
    if (!formData || !selectedNode) return;
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onChange(selectedNode.id, newData);
  };

  // special handler for action param changes
  const handleActionParamChange = (param: string, value: string) => {
    if (!formData || !selectedNode) return;
    const newParams = { ...(formData.actionParams || {}), [param]: value };
    handleChange('actionParams', newParams);
  };

  if (!selectedNode || !formData) {
    return (
      <aside className="w-80 bg-slate-50 border-l border-slate-200 h-full flex items-center justify-center text-slate-400 p-8 text-center">
        <div>
          <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Select a node to edit its configuration</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-80 bg-white border-l border-slate-200 h-full flex flex-col shadow-xl z-20">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <div>
          <h2 className="font-semibold text-slate-800">Configuration</h2>
          <p className="text-xs text-slate-500 uppercase tracking-wide mt-0.5">{selectedNode.type} Node</p>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded text-slate-500">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Node Label <span className="text-red-500">*</span></label>
          <input type="text" value={formData.label} onChange={(e) => handleChange('label', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
        </div>

        {selectedNode.type === NodeType.START && (
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 rounded-md text-sm text-blue-700">Process Entry Point.</div>
            <KeyValueEditor title="Metadata" data={formData.meta} onChange={(newMeta) => handleChange('meta', newMeta)} />
          </div>
        )}

        {selectedNode.type === NodeType.TASK && (
          <>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Description</label>
              <textarea rows={3} value={formData.description || ''} onChange={(e) => handleChange('description', e.target.value)} placeholder="Describe the task..." className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Assignee</label>
              <input type="text" placeholder="e.g. john.doe@company.com" value={formData.assignee || ''} onChange={(e) => handleChange('assignee', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Due Date</label>
              <input type="date" value={formData.dueDate || ''} onChange={(e) => handleChange('dueDate', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm" />
            </div>
            <KeyValueEditor title="Custom Fields" data={formData.customFields} onChange={(newFields) => handleChange('customFields', newFields)} />
          </>
        )}

        {selectedNode.type === NodeType.APPROVAL && (
          <>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Approver Role</label>
              <select value={formData.approverRole || 'Manager'} onChange={(e) => handleChange('approverRole', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm">
                <option value="Manager">Manager</option>
                <option value="HRBP">HR Business Partner</option>
                <option value="Director">Director</option>
                <option value="Finance">Finance Controller</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Auto-Approve Threshold (Hours)</label>
              <input type="number" value={formData.autoApproveThreshold || 0} onChange={(e) => handleChange('autoApproveThreshold', parseInt(e.target.value || '0'))} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm" />
              <p className="text-xs text-slate-500">Auto-approves if no action taken within hours.</p>
            </div>
          </>
        )}

        {selectedNode.type === NodeType.AUTOMATED && (
          <>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Action Type</label>
              {loading ? (
                <div className="text-sm text-slate-500 animate-pulse">Loading actions...</div>
              ) : (
                <select value={formData.actionId || ''} onChange={(e) => handleChange('actionId', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm">
                  <option value="">Select an action...</option>
                  {automations.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
                </select>
              )}
            </div>

            {formData.actionId && (
              <div className="space-y-2 bg-slate-50 p-3 rounded border border-slate-200">
                <p className="text-xs font-semibold text-slate-700 mb-2">Required Parameters:</p>
                {automations.find(a => a.id === formData.actionId)?.params.map(param => (
                  <div key={param} className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500 capitalize">{param.replace('_', ' ')}</label>
                    <input className="text-xs p-1 border rounded w-full" placeholder={`Value for ${param}`} value={formData.actionParams?.[param] || ''} onChange={(e) => handleActionParamChange(param, e.target.value)} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {selectedNode.type === NodeType.END && (
          <>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">End Message</label>
              <textarea rows={3} value={formData.endMessage || ''} onChange={(e) => handleChange('endMessage', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isSummary" checked={formData.isSummary || false} onChange={(e) => handleChange('isSummary', e.target.checked)} className="rounded border-slate-300 text-blue-600" />
              <label htmlFor="isSummary" className="text-sm text-slate-700">Send Summary Report</label>
            </div>
          </>
        )}
      </div>

      <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col gap-2">
        <button onClick={onClose} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium">
          <Save className="w-4 h-4" />
          Done
        </button>
        <button onClick={() => onDelete(selectedNode.id)} className="w-full flex items-center justify-center gap-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 py-2 px-4 rounded-md text-sm font-medium">
          <Trash2 className="w-4 h-4" />
          Delete Node
        </button>
      </div>
    </aside>
  );
};
