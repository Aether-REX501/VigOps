export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type IssueSeverity = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Issue {
  title: string;
  description: string;
  severity: IssueSeverity;
}

export interface PRAnalysis {
  id: string;
  repo: string;
  pr: number;
  prTitle: string;
  action: string;
  sender: string;
  branchFrom: string;
  branchTo: string;
  prUrl: string;
  riskLevel: RiskLevel;
  issues: Issue[];
  costImpact: string;
  simulation: string;
  suggestions: string[];
  analyzedFiles: string[];
  source: 'webhook' | 'manual';
  timestamp: string;
}
