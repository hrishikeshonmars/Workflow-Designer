import { Node, Edge } from 'reactflow';

export enum NodeType {
  START = 'start',
  TASK = 'task',
  APPROVAL = 'approval',
  AUTOMATED = 'automated',
  END = 'end',
}

export interface NodeData {
  label: string;
  description?: string;
  // Start Node
  meta?: Record<string, string>;
  // Task Node
  assignee?: string;
  dueDate?: string;
  customFields?: Record<string, string>;
  // Approval Node
  approverRole?: string;
  autoApproveThreshold?: number;
  // Automated Node
  actionId?: string;
  actionParams?: Record<string, any>;
  // End Node
  endMessage?: string;
  isSummary?: boolean;
}

export interface AutomationAction {
  id: string;
  label: string;
  params: string[];
}

export interface SimulationLog {
  stepId: number;
  nodeId: string;
  nodeLabel: string;
  status: 'pending' | 'success' | 'failed' | 'skipped';
  message: string;
  timestamp: string;
}

export interface SimulationResult {
  valid: boolean;
  errors: string[];
  logs: SimulationLog[];
}

export type WorkflowNode = Node<NodeData>;
export type WorkflowEdge = Edge;
