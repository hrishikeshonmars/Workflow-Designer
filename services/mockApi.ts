// src/services/mockApi.ts
import { AutomationAction, SimulationResult, WorkflowNode, SimulationLog } from '../types';
import { Edge } from 'reactflow';
import { NodeType } from '../types';

// Mock list of automations
const MOCK_AUTOMATIONS: AutomationAction[] = [
  { id: 'send_email', label: 'Send Email', params: ['to', 'subject', 'body'] },
  { id: 'generate_doc', label: 'Generate PDF Document', params: ['template_id', 'recipient'] },
  { id: 'slack_msg', label: 'Send Slack Notification', params: ['channel', 'message'] },
  { id: 'update_hrms', label: 'Update HR System', params: ['employee_id', 'field', 'value'] },
];

export const fetchAutomations = async (): Promise<AutomationAction[]> => {
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_AUTOMATIONS), 350));
};

export const simulateWorkflow = async (nodes: WorkflowNode[], edges: Edge[]): Promise<SimulationResult> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const errors: string[] = [];
      const logs: SimulationLog[] = [];

      // Basic structural checks
      const startNodes = nodes.filter(n => n.type === NodeType.START);
      if (startNodes.length === 0) {
        errors.push('Workflow must contain one Start Node.');
      } else if (startNodes.length > 1) {
        errors.push('Workflow should contain only one Start Node.');
      }

      const endCount = nodes.filter(n => n.type === NodeType.END).length;
      if (endCount === 0) {
        errors.push('Workflow must contain at least one End Node.');
      }

      // Ensure every node has a non-empty label (title required)
      const unlabeled = nodes.filter(n => !n.data?.label || String(n.data.label).trim() === '');
      if (unlabeled.length > 0) {
        errors.push(`Every node must have a title/label. Missing on: ${unlabeled.map(n => `${n.id}`).join(', ')}`);
      }

      if (errors.length > 0) {
        resolve({ valid: false, errors, logs: [] });
        return;
      }

      // Build adjacency and reverse-adjacency maps
      const outgoing = new Map<string, string[]>();
      const incoming = new Map<string, string[]>();
      nodes.forEach(n => { outgoing.set(n.id, []); incoming.set(n.id, []); });

      edges.forEach(e => {
        if (outgoing.has(e.source)) outgoing.get(e.source)!.push(e.target);
        if (incoming.has(e.target)) incoming.get(e.target)!.push(e.source);
      });

      // Start node must have no incoming edges
      const startNode = startNodes[0];
      if ((incoming.get(startNode.id) || []).length > 0) {
        errors.push('Start Node must not have incoming connections. Please remove incoming edges to Start.');
        resolve({ valid: false, errors, logs: [] });
        return;
      }

      // Detect cycles using DFS
      const visited = new Set<string>();
      const inStack = new Set<string>();
      let hasCycle = false;
      const dfs = (nodeId: string) => {
        if (hasCycle) return;
        visited.add(nodeId);
        inStack.add(nodeId);
        const neighbors = outgoing.get(nodeId) || [];
        for (const nb of neighbors) {
          if (!visited.has(nb)) {
            dfs(nb);
          } else if (inStack.has(nb)) {
            hasCycle = true;
            return;
          }
        }
        inStack.delete(nodeId);
      };
      dfs(startNode.id);

      if (hasCycle) {
        errors.push('Workflow contains a cycle. Please remove cyclic edges.');
        resolve({ valid: false, errors, logs: [] });
        return;
      }

      // Check reachability of all nodes from start
      const reachable = new Set<string>();
      const queue: string[] = [startNode.id];
      while (queue.length > 0) {
        const cur = queue.shift()!;
        if (reachable.has(cur)) continue;
        reachable.add(cur);
        (outgoing.get(cur) || []).forEach(nxt => queue.push(nxt));
      }
      const unreachable = nodes.filter(n => !reachable.has(n.id)).map(n => n.data.label || n.id);
      if (unreachable.length > 0) {
        errors.push(`Some nodes are unreachable from Start: ${unreachable.join(', ')}`);
        resolve({ valid: false, errors, logs: [] });
        return;
      }

      // Build execution logs via BFS order from Start
      let step = 1;
      const execQueue = [startNode.id];
      const execVisited = new Set<string>();
      while (execQueue.length > 0) {
        const id = execQueue.shift()!;
        if (execVisited.has(id)) continue;
        execVisited.add(id);
        const node = nodes.find(n => n.id === id);
        if (!node) continue;
        logs.push({
          stepId: step++,
          nodeId: node.id,
          nodeLabel: node.data.label,
          status: 'success',
          message: `Simulated ${node.type} node: ${node.data.label}`,
          timestamp: new Date().toISOString()
        });
        (outgoing.get(id) || []).forEach(t => execQueue.push(t));
      }

      resolve({ valid: true, errors: [], logs });
    }, 900);
  });
};
