import React from 'react';
import { SimulationResult, SimulationLog } from '../types';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface SimulationPanelProps {
  result: SimulationResult | null;
  isRunning: boolean;
  onClose: () => void;
}

export const SimulationPanel: React.FC<SimulationPanelProps> = ({ result, isRunning, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-fade-in-up">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Workflow Sandbox</h2>
            <p className="text-sm text-slate-500">Testing current workflow logic</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {isRunning ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-slate-500 font-medium">Simulating execution flow...</p>
            </div>
          ) : result ? (
            <div className="space-y-6">
              <div className={`p-4 rounded-lg border ${result.valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-center gap-3">
                  {result.valid ? (<CheckCircle className="w-6 h-6 text-green-600" />) : (<XCircle className="w-6 h-6 text-red-600" />)}
                  <div>
                    <h3 className={`font-semibold ${result.valid ? 'text-green-800' : 'text-red-800'}`}>
                      {result.valid ? 'Validation Passed' : 'Validation Failed'}
                    </h3>
                    {!result.valid && (
                      <ul className="list-disc list-inside mt-1 text-sm text-red-700">
                        {result.errors.map((err, idx) => <li key={idx}>{err}</li>)}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              {result.valid && (
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4">Execution Log</h3>
                  <div className="relative space-y-0 pl-4 border-l-2 border-slate-200 ml-2">
                    {result.logs.map((log: SimulationLog) => (
                      <div key={log.stepId} className="relative pb-6 last:pb-0">
                        <span className="absolute -left-[23px] top-1 w-4 h-4 rounded-full bg-blue-500 border-2 border-white ring-2 ring-blue-100"></span>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-slate-800 text-sm">{log.nodeLabel}</h4>
                            <p className="text-xs text-slate-500 mt-0.5">{log.message}</p>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-slate-400 mt-10">
              <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>No simulation data available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
