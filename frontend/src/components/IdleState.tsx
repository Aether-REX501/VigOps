interface IdleStateProps {
  onAnalyze: () => void;
}

export default function IdleState({ onAnalyze }: IdleStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[68vh] gap-6 text-center animate-fade-in">
      {/* Icon */}
      <div
        className="flex items-center justify-center w-14 h-14 rounded-2xl text-2xl"
        style={{
          background: '#111827',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        🛰️
      </div>

      {/* Text */}
      <div className="space-y-2">
        <h2 className="text-base font-semibold text-white">
          Waiting for PR analysis
        </h2>
        <p className="text-sm max-w-xs leading-relaxed" style={{ color: '#6b7280' }}>
          Connect a GitHub webhook or click below to fetch the latest analysis from the backend.
        </p>
      </div>

      {/* CTA */}
      <button
        onClick={onAnalyze}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all duration-150"
        style={{ background: '#1d4ed8', border: '1px solid rgba(59,130,246,0.25)' }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#1e40af'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#1d4ed8'; }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="23 4 23 10 17 10" />
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
        </svg>
        Analyze PR
      </button>

      {/* Webhook hint */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
        style={{
          background: '#111827',
          border: '1px solid rgba(255,255,255,0.07)',
          color: '#4b5563',
          fontFamily: 'JetBrains Mono, monospace',
        }}
      >
        <span style={{ color: '#6b7280' }}>POST</span>
        <span>/webhook</span>
        <span>←</span>
        <span>GitHub PR events</span>
      </div>
    </div>
  );
}
