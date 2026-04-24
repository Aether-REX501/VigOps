import { useRef, useState } from 'react';

interface Props {
  repo: string;
  pr: string;
  onRepoChange: (v: string) => void;
  onPrChange: (v: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  error: string;
}

export default function AnalysisBar({ repo, pr, onRepoChange, onPrChange, onAnalyze, isLoading, error }: Props) {
  const prRef = useRef<HTMLInputElement>(null);
  const [repoFocus, setRepoFocus] = useState(false);
  const [prFocus, setPrFocus] = useState(false);

  const canAnalyze = repo.trim().includes('/') && pr.trim() && !isLoading;

  return (
    <div className="card" style={{ padding: 16, marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <span className="badge" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.18)', color: '#818cf8' }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          Instant Analysis
        </span>
        <span style={{ fontSize: 12, color: '#3d4555' }}>Analyze any public GitHub PR</span>
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'stretch' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: repoFocus ? '#818cf8' : '#2d3340', transition: 'color 0.15s' }}>
            repo
          </span>
          <input
            autoFocus
            className="input-field"
            value={repo}
            placeholder="owner/repository"
            onChange={(e) => onRepoChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); prRef.current?.focus(); } }}
            onFocus={() => setRepoFocus(true)}
            onBlur={() => setRepoFocus(false)}
            style={{ paddingLeft: 48 }}
          />
        </div>
        <div style={{ width: 120, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 10, fontWeight: 700, color: prFocus ? '#818cf8' : '#2d3340', fontFamily: 'JetBrains Mono, monospace', transition: 'color 0.15s' }}>
            PR
          </span>
          <input
            ref={prRef}
            className="input-field"
            type="number" min="1"
            value={pr}
            placeholder="#1234"
            onChange={(e) => onPrChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (canAnalyze) onAnalyze(); } }}
            onFocus={() => setPrFocus(true)}
            onBlur={() => setPrFocus(false)}
            style={{ paddingLeft: 32 }}
          />
        </div>
        <button className="btn-primary" onClick={onAnalyze} disabled={!canAnalyze} style={{ minWidth: 120 }}>
          {isLoading ? (
            <><span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite' }} /> Scanning…</>
          ) : (
            <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg> Analyze PR</>
          )}
        </button>
      </div>
      {error && (
        <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          <span style={{ fontSize: 12, fontWeight: 500, color: '#f87171' }}>{error}</span>
        </div>
      )}
    </div>
  );
}
