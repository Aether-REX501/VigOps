import { useEffect, useState, useCallback, useRef } from 'react';
import { fetchAnalysis, analyzeRepo } from './api';
import type { PRAnalysis } from './types';
import Header from './components/Header';
import AnalysisBar from './components/AnalysisBar';
import IdleState from './components/IdleState';
import LoadingState from './components/LoadingState';
import Dashboard from './components/Dashboard';
import { getRelativeTime } from './components/tokens';
import { useToast, ToastContainer } from './components/Toast';
import { ActivityFeed, ShortcutHint } from './components/Extras';

type AppState = 'idle' | 'loading' | 'result';
type View = 'dashboard' | 'history';

export default function App() {
  const [appState, setAppState] = useState<AppState>('idle');
  const [analysis, setAnalysis] = useState<PRAnalysis | null>(null);
  const [history, setHistory] = useState<PRAnalysis[]>([]);
  const [lastTimestamp, setLastTimestamp] = useState('');
  const [relativeTime, setRelativeTime] = useState('');
  const [activeView, setActiveView] = useState<View>('dashboard');

  const [inputRepo, setInputRepo] = useState('');
  const [inputPr, setInputPr] = useState('');
  const [analyzeError, setAnalyzeError] = useState('');
  const [isManualLoading, setIsManualLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState({ message: '', submessage: '' });

  const { toasts, addToast, dismiss } = useToast();
  const appStateRef = useRef<AppState>('idle');
  const lastIdRef = useRef<string>('');
  const repoInputRef = useRef<HTMLInputElement>(null);

  appStateRef.current = appState;

  // Request browser notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Keyboard shortcut: Ctrl+K or Cmd+K to focus search
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Focus the repo input
        const input = document.querySelector('input[placeholder="owner/repository"]') as HTMLInputElement;
        input?.focus();
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Silent background refresh with new-webhook detection
  const silentRefresh = useCallback(async () => {
    try {
      const data = await fetchAnalysis();
      if (data.latest) {
        // Detect NEW webhook
        if (lastIdRef.current && data.latest.id !== lastIdRef.current && data.latest.source === 'webhook') {
          const riskEmoji = data.latest.riskLevel === 'HIGH' ? '🔴' : data.latest.riskLevel === 'MEDIUM' ? '🟡' : '🟢';
          addToast(
            `${riskEmoji} New PR Analyzed`,
            `#${data.latest.pr} ${data.latest.prTitle} — Risk: ${data.latest.riskLevel}`,
            data.latest.riskLevel === 'HIGH' ? 'danger' : data.latest.riskLevel === 'MEDIUM' ? 'warning' : 'success'
          );
          // Browser notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`VigOps — ${data.latest.riskLevel} Risk`, {
              body: `PR #${data.latest.pr}: ${data.latest.prTitle}`,
              icon: '⚡',
            });
          }
        }
        lastIdRef.current = data.latest.id;
        setAnalysis(data.latest);
        setHistory(data.history);
        setLastTimestamp(data.latest.timestamp);
        if (appStateRef.current !== 'loading') setAppState('result');
      }
    } catch { /* silent */ }
  }, []);

  useEffect(() => { silentRefresh(); }, [silentRefresh]);
  useEffect(() => { const id = setInterval(silentRefresh, 5000); return () => clearInterval(id); }, [silentRefresh]);
  useEffect(() => {
    if (!lastTimestamp) return;
    setRelativeTime(getRelativeTime(lastTimestamp));
    const id = setInterval(() => setRelativeTime(getRelativeTime(lastTimestamp)), 3000);
    return () => clearInterval(id);
  }, [lastTimestamp]);

  const handleHeaderAnalyze = useCallback(() => {
    if (inputRepo && inputPr) handleManualAnalyze();
    else silentRefresh();
  }, [inputRepo, inputPr, silentRefresh]);

  async function handleManualAnalyze() {
    const repo = inputRepo.trim();
    const pr = parseInt(inputPr.trim(), 10);
    if (!repo.includes('/')) { setAnalyzeError('Format: owner/repo'); return; }
    if (isNaN(pr) || pr < 1) { setAnalyzeError('PR must be a valid number'); return; }

    setAnalyzeError('');
    setIsManualLoading(true);
    setLoadingMsg({ message: 'Fetching PR & analyzing infrastructure', submessage: `Scanning ${repo}#${pr}…` });
    setAppState('loading');
    setActiveView('dashboard');

    addToast('📡 Analysis Started', `Scanning ${repo}#${pr}…`, 'info');

    const [result] = await Promise.allSettled([analyzeRepo(repo, pr), new Promise(r => setTimeout(r, 2200))]);
    setIsManualLoading(false);

    if (result.status === 'fulfilled') {
      const a = result.value as PRAnalysis;
      lastIdRef.current = a.id;
      setAnalysis(a);
      setHistory(prev => [a, ...prev].slice(0, 20));
      setLastTimestamp(a.timestamp);
      setAppState('result');
      const riskEmoji = a.riskLevel === 'HIGH' ? '🔴' : a.riskLevel === 'MEDIUM' ? '🟡' : '🟢';
      addToast(`${riskEmoji} Analysis Complete`, `${a.issues.length} issues found — Risk: ${a.riskLevel}`, a.riskLevel === 'HIGH' ? 'danger' : 'success');
    } else {
      const err = result.reason as Error;
      const apiMsg = (err as unknown as { response?: { data?: { error?: string } } })?.response?.data?.error ?? err?.message ?? 'Failed';
      setAnalyzeError(apiMsg.slice(0, 100));
      setAppState(analysis ? 'result' : 'idle');
      addToast('❌ Analysis Failed', apiMsg.slice(0, 80), 'danger');
    }
  }

  function handleSelectHistory(a: PRAnalysis) {
    setAnalysis(a);
    setActiveView('dashboard');
    setAppState('result');
  }

  const NAV = [
    { id: 'dashboard' as View, label: 'Dashboard', icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
    )},
    { id: 'history' as View, label: 'History', icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
    )},
  ];

  return (
    <div className="app-layout">
      {/* Ambient */}
      <div className="ambient" style={{ width: 500, height: 500, top: -150, left: -100, background: '#1d4ed8' }} />
      <div className="ambient" style={{ width: 350, height: 350, bottom: 50, right: -50, background: '#06b6d4' }} />

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      {/* ── Sidebar ──────────────────────────────── */}
      <aside className="sidebar">
        {/* Brand */}
        <div style={{ padding: '18px 16px 20px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(37,99,235,0.3)',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#e8ecf2', lineHeight: 1 }}>VigOps</div>
            <div style={{ fontSize: 10, color: '#3d4555', marginTop: 2 }}>DevOps Intelligence</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '12px 0', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '0 16px 8px', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#1e2430' }}>
            Navigation
          </div>
          {NAV.map(n => (
            <div
              key={n.id}
              className={`nav-item ${activeView === n.id ? 'active' : ''}`}
              onClick={() => setActiveView(n.id)}
            >
              <span className="nav-icon">{n.icon}</span>
              {n.label}
              {n.id === 'history' && history.length > 0 && (
                <span style={{
                  marginLeft: 'auto', fontSize: 10, fontWeight: 700,
                  background: 'rgba(59,130,246,0.1)', color: '#60a5fa',
                  padding: '1px 7px', borderRadius: 6,
                }}>
                  {history.length}
                </span>
              )}
            </div>
          ))}

          <div style={{ padding: '16px 16px 8px', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#1e2430' }}>
            Quick Links
          </div>
          <a href="http://localhost:4040/health" target="_blank" rel="noreferrer" className="nav-item">
            <span className="nav-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </span>
            Health Check
          </a>
          <a href="http://localhost:4040/analysis" target="_blank" rel="noreferrer" className="nav-item">
            <span className="nav-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </span>
            API Response
          </a>

          {/* Activity feed */}
          <div style={{ flex: 1, overflow: 'hidden auto', marginTop: 8 }}>
            <ActivityFeed history={history} />
          </div>
        </nav>

        {/* Bottom */}
        <div style={{
          padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.05)',
        }}>
          <ShortcutHint />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: appState === 'result' ? '#34d399' : '#fbbf24', boxShadow: appState === 'result' ? '0 0 6px rgba(52,211,153,0.5)' : 'none' }} />
            <span style={{ color: '#4b5563', fontWeight: 500, fontSize: 11 }}>Backend</span>
            <span style={{ color: '#3d4555', fontSize: 10 }}>:4040</span>
          </div>
          <div style={{ color: '#1e2430', fontSize: 10, marginTop: 2 }}>v3.0.0</div>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────── */}
      <div className="main-content">
        <Header
          relativeTime={relativeTime}
          isLive={appState === 'result'}
          onAnalyze={handleHeaderAnalyze}
          isLoading={appState === 'loading'}
        />

        <div className="scroll-area">
          {activeView === 'dashboard' && (
            <>
              <AnalysisBar repo={inputRepo} pr={inputPr} onRepoChange={setInputRepo} onPrChange={setInputPr} onAnalyze={handleManualAnalyze} isLoading={isManualLoading} error={analyzeError} />
              {appState === 'idle' && <IdleState onAnalyze={handleManualAnalyze} />}
              {appState === 'loading' && <LoadingState message={loadingMsg.message} submessage={loadingMsg.submessage} />}
              {appState === 'result' && analysis && <Dashboard analysis={analysis} history={history} onSelectHistory={handleSelectHistory} />}
            </>
          )}
          {activeView === 'history' && appState === 'result' && analysis && (
            <Dashboard analysis={analysis} history={history} onSelectHistory={handleSelectHistory} />
          )}
          {activeView === 'history' && appState !== 'result' && (
            <div className="anim-fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 200px)', color: '#3d4555', fontSize: 14, fontWeight: 500 }}>
              No analysis history yet. Scan a PR to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
