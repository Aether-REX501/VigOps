import { useRef, useState } from 'react';

interface AnalysisBarProps {
  repo: string;
  pr: string;
  onRepoChange: (v: string) => void;
  onPrChange: (v: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  error: string;
}

const INPUT_STYLE: React.CSSProperties = {
  background: '#0b0f14',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  color: '#f9fafb',
  fontSize: 13,
  padding: '7px 12px',
  outline: 'none',
  fontFamily: 'JetBrains Mono, monospace',
  transition: 'border-color 0.15s',
  width: '100%',
};

export default function AnalysisBar({
  repo,
  pr,
  onRepoChange,
  onPrChange,
  onAnalyze,
  isLoading,
  error,
}: AnalysisBarProps) {
  const prRef = useRef<HTMLInputElement>(null);
  const [repoFocused, setRepoFocused] = useState(false);
  const [prFocused, setPrFocused] = useState(false);

  function handleRepoKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      prRef.current?.focus();
    }
  }

  function handlePrKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (repo.trim() && pr.trim()) onAnalyze();
    }
  }

  const canAnalyze = repo.trim().includes('/') && pr.trim() && !isLoading;

  return (
    <div
      className="rounded-xl p-4 mb-5"
      style={{
        background: '#111827',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* Label row */}
      <div className="flex items-center gap-2 mb-3">
        <div
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold"
          style={{
            background: 'rgba(99,102,241,0.1)',
            border: '1px solid rgba(99,102,241,0.2)',
            color: '#818cf8',
          }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          Instant Analysis
        </div>
        <span className="text-xs" style={{ color: '#4b5563' }}>
          Analyze any public GitHub PR instantly
        </span>
      </div>

      {/* Input row */}
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Repo input */}
        <div className="flex-1 relative">
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 text-xs select-none"
            style={{ color: '#4b5563', fontFamily: 'JetBrains Mono, monospace' }}
          >
            repo
          </span>
          <input
            autoFocus
            type="text"
            value={repo}
            placeholder="kubernetes/kubernetes"
            onChange={(e) => onRepoChange(e.target.value)}
            onKeyDown={handleRepoKeyDown}
            onFocus={() => setRepoFocused(true)}
            onBlur={() => setRepoFocused(false)}
            style={{
              ...INPUT_STYLE,
              paddingLeft: 44,
              borderColor: repoFocused ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.1)',
            }}
          />
        </div>

        {/* PR number input */}
        <div className="relative" style={{ width: '100%', maxWidth: 140 }}>
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 text-xs select-none"
            style={{ color: '#4b5563', fontFamily: 'JetBrains Mono, monospace' }}
          >
            PR #
          </span>
          <input
            ref={prRef}
            type="number"
            min="1"
            value={pr}
            placeholder="1234"
            onChange={(e) => onPrChange(e.target.value)}
            onKeyDown={handlePrKeyDown}
            onFocus={() => setPrFocused(true)}
            onBlur={() => setPrFocused(false)}
            style={{
              ...INPUT_STYLE,
              paddingLeft: 36,
              borderColor: prFocused ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.1)',
            }}
          />
        </div>

        {/* Analyze button */}
        <button
          onClick={onAnalyze}
          disabled={!canAnalyze}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 shrink-0"
          style={{
            background: canAnalyze ? '#1d4ed8' : 'rgba(29,78,216,0.3)',
            border: '1px solid rgba(59,130,246,0.25)',
            color: canAnalyze ? '#fff' : '#60a5fa',
            cursor: canAnalyze ? 'pointer' : 'not-allowed',
            minWidth: 110,
          }}
          onMouseEnter={(e) => {
            if (canAnalyze) (e.currentTarget as HTMLButtonElement).style.background = '#1e40af';
          }}
          onMouseLeave={(e) => {
            if (canAnalyze) (e.currentTarget as HTMLButtonElement).style.background = '#1d4ed8';
          }}
        >
          {isLoading ? (
            <>
              <span
                className="w-3.5 h-3.5 rounded-full border border-blue-400 border-t-transparent"
                style={{ animation: 'spin 0.9s linear infinite', flexShrink: 0 }}
              />
              Analyzing…
            </>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
              Analyze PR
            </>
          )}
        </button>
      </div>

      {/* Hint row */}
      <div className="flex items-center justify-between mt-2.5">
        <p className="text-xs" style={{ color: '#374151' }}>
          Press <kbd style={{ padding: '1px 4px', borderRadius: 4, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#6b7280', fontSize: 10 }}>Enter</kbd> in repo field to jump to PR, then <kbd style={{ padding: '1px 4px', borderRadius: 4, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#6b7280', fontSize: 10 }}>Enter</kbd> to analyze
        </p>
        {error && (
          <p className="text-xs" style={{ color: '#f87171' }}>⚠ {error}</p>
        )}
      </div>
    </div>
  );
}
