import { PRAnalysis } from './types';

const MAX_HISTORY = 20;
let analysisHistory: PRAnalysis[] = [];

export function storeAnalysis(analysis: PRAnalysis): void {
  analysisHistory.unshift(analysis);
  if (analysisHistory.length > MAX_HISTORY) {
    analysisHistory = analysisHistory.slice(0, MAX_HISTORY);
  }
  console.log(
    `[Store] ✅ Saved analysis for PR #${analysis.pr} on "${analysis.repo}" — Risk: ${analysis.riskLevel}`
  );
}

export function getLatestAnalysis(): PRAnalysis | null {
  return analysisHistory.length > 0 ? analysisHistory[0] : null;
}

export function getAllAnalyses(): PRAnalysis[] {
  return analysisHistory;
}
