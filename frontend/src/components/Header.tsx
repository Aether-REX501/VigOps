interface HeaderProps {
  relativeTime: string;
  isLive: boolean;
  onAnalyze: () => void;
  isLoading: boolean;
}

export default function Header({ relativeTime, isLive, onAnalyze, isLoading }: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between px-6 h-14"
      style={{
        background: '#0b0f14',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center w-7 h-7 rounded-lg text-sm"
          style={{ background: '#1d4ed8' }}
        >
          ⚡
        </div>
        <span className="text-sm font-semibold tracking-tight text-white">VigOps</span>
        <span className="text-xs hidden sm:block" style={{ color: '#4b5563' }}>
          DevOps Intelligence
        </span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {relativeTime && (
          <span className="text-xs hidden sm:block" style={{ color: '#6b7280' }}>
            Last analyzed: <span style={{ color: '#9ca3af' }}>{relativeTime}</span>
          </span>
        )}

        {/* Status pill */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
          style={{
            background: isLive ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${isLive ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.08)'}`,
            color: isLive ? '#34d399' : '#6b7280',
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: isLive ? '#34d399' : '#374151',
              ...(isLive ? { animation: 'pulse-dot 2s ease-in-out infinite' } : {}),
            }}
          />
          {isLive ? 'Live' : 'Waiting'}
        </div>

        {/* Analyze button */}
        <button
          onClick={onAnalyze}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
          style={{
            background: isLoading ? 'rgba(29,78,216,0.5)' : '#1d4ed8',
            border: '1px solid rgba(59,130,246,0.3)',
            color: isLoading ? '#93c5fd' : '#fff',
            cursor: isLoading ? 'not-allowed' : 'pointer',
          }}
          onMouseEnter={(e) => {
            if (!isLoading) (e.currentTarget as HTMLButtonElement).style.background = '#1e40af';
          }}
          onMouseLeave={(e) => {
            if (!isLoading) (e.currentTarget as HTMLButtonElement).style.background = '#1d4ed8';
          }}
        >
          {isLoading ? (
            <>
              <span
                className="w-3 h-3 rounded-full border border-blue-400 border-t-transparent"
                style={{ animation: 'spin 0.9s linear infinite' }}
              />
              Analyzing…
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              Analyze PR
            </>
          )}
        </button>
      </div>
    </header>
  );
}
