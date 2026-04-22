import { useEffect, useState, useCallback, useRef } from 'react';
import { fetchAnalysis, analyzeRepo } from './api';
import type { PRAnalysis } from './types';
import Header from './components/Header';
import AnalysisBar from './components/AnalysisBar';
import IdleState from './components/IdleState';
import LoadingState from './components/LoadingState';
import Dashboard from './components/Dashboard';
import { getRelativeTime } from './components/tokens';

type AppState = 'idle' | 'loading' | 'result';

interface LoadingConfig {
  message: string;
  submessage: string;
}

export default function App() {
  // ── Core state ──────────────────────────────────────────────────────────────
  const [appState, setAppState] = useState<AppState>('idle');
  const [analysis, setAnalysis] = useState<PRAnalysis | null>(null);
  const [history, setHistory] = useState<PRAnalysis[]>([]);
  const [lastTimestamp, setLastTimestamp] = useState<string>('');
  const [relativeTime, setRelativeTime] = useState<string>('');
  const [loadingConfig, setLoadingConfig] = useState<LoadingConfig>({
    message: 'Analyzing infrastructure',
    submessage: 'Checking risk levels, cost impact, and performance…',
  });

  // ── Analysis bar state ──────────────────────────────────────────────────────
  const [inputRepo, setInputRepo] = useState('');
  const [inputPr, setInputPr] = useState('');
  const [analyzeError, setAnalyzeError] = useState('');
  const [isManualLoading, setIsManualLoading] = useState(false);

  const appStateRef = useRef<AppState>('idle');
  appStateRef.current = appState;

  // ── Silent background refresh ───────────────────────────────────────────────
  const silentRefresh = useCallback(async () => {
    try {
      const data = await fetchAnalysis();
      if (data.latest) {
        setAnalysis(data.latest);
        setHistory(data.history);
        setLastTimestamp(data.latest.timestamp);
        if (appStateRef.current !== 'loading') setAppState('result');
      }
    } catch (_e) {
      // Silent — don't disrupt the user
    }
  }, []);

  // ── On mount ────────────────────────────────────────────────────────────────
  useEffect(() => {
    silentRefresh();
  }, [silentRefresh]);

  // ── Auto-refresh every 5s ────────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(silentRefresh, 5000);
    return () => clearInterval(id);
  }, [silentRefresh]);

  // ── Relative time ticker ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!lastTimestamp) return;
    setRelativeTime(getRelativeTime(lastTimestamp));
    const id = setInterval(() => setRelativeTime(getRelativeTime(lastTimestamp)), 3000);
    return () => clearInterval(id);
  }, [lastTimestamp]);

  // ── Manual "Header" Analyze button (re-run last settings) ───────────────────
  const handleHeaderAnalyze = useCallback(() => {
    if (inputRepo && inputPr) {
      handleManualAnalyze();
    } else {
      silentRefresh();
    }
  }, [inputRepo, inputPr, silentRefresh]);

  // ── Manual analysis trigger ──────────────────────────────────────────────────
  async function handleManualAnalyze() {
    const repo = inputRepo.trim();
    const pr = parseInt(inputPr.trim(), 10);

    if (!repo.includes('/')) {
      setAnalyzeError('Format must be owner/repo (e.g. kubernetes/kubernetes)');
      return;
    }
    if (isNaN(pr) || pr < 1) {
      setAnalyzeError('PR must be a valid number');
      return;
    }

    setAnalyzeError('');
    setIsManualLoading(true);
    setLoadingConfig({
      message: 'Fetching PR and analyzing infrastructure',
      submessage: `Reading files from ${repo}#${pr}…`,
    });
    setAppState('loading');

    // Minimum 1.5s loading for UX effect
    const [result] = await Promise.allSettled([
      analyzeRepo(repo, pr),
      new Promise((r) => setTimeout(r, 1500)),
    ]);

    setIsManualLoading(false);

    if (result.status === 'fulfilled') {
      const newAnalysis = result.value as PRAnalysis;
      setAnalysis(newAnalysis);
      setHistory((prev) => [newAnalysis, ...prev].slice(0, 20));
      setLastTimestamp(newAnalysis.timestamp);
      setAppState('result');
    } else {
      const err = result.reason as Error;
      const msg = err?.message ?? 'Request failed';
      // Extract the user-friendly part from axios error
      const apiMsg = (err as unknown as { response?: { data?: { error?: string } } })?.response?.data?.error ?? msg;
      setAnalyzeError(apiMsg.slice(0, 100));
      setAppState(analysis ? 'result' : 'idle');
    }
  }

  return (
    <div className="min-h-screen" style={{ background: '#0b0f14' }}>
      <Header
        relativeTime={relativeTime}
        isLive={appState === 'result'}
        onAnalyze={handleHeaderAnalyze}
        isLoading={appState === 'loading'}
      />

      <main className="max-w-5xl mx-auto px-6 py-7">
        {/* Analysis bar — always visible */}
        <AnalysisBar
          repo={inputRepo}
          pr={inputPr}
          onRepoChange={setInputRepo}
          onPrChange={setInputPr}
          onAnalyze={handleManualAnalyze}
          isLoading={isManualLoading}
          error={analyzeError}
        />

        {appState === 'idle'    && <IdleState onAnalyze={handleManualAnalyze} />}
        {appState === 'loading' && <LoadingState message={loadingConfig.message} submessage={loadingConfig.submessage} />}
        {appState === 'result'  && analysis && <Dashboard analysis={analysis} history={history} />}
      </main>
    </div>
  );
}
