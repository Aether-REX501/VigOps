import axios from 'axios';
import type { AnalysisResponse, PRAnalysis } from './types';

const BASE_URL = 'http://localhost:4040';

export async function fetchAnalysis(): Promise<AnalysisResponse> {
  const res = await axios.get<AnalysisResponse>(`${BASE_URL}/analysis`);
  return res.data;
}

export async function analyzeRepo(repo: string, pr: number): Promise<PRAnalysis> {
  const res = await axios.get<{ analysis: PRAnalysis }>(
    `${BASE_URL}/analyze?repo=${encodeURIComponent(repo)}&pr=${pr}`
  );
  return res.data.analysis;
}
