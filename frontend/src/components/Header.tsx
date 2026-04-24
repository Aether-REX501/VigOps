import { C } from './tokens';

interface Props {
  relativeTime: string;
  isLive: boolean;
  onAnalyze: () => void;
  isLoading: boolean;
}

export default function Header({ relativeTime, isLive, onAnalyze, isLoading }: Props) {
  return (
    <div className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <h1 style={{ fontSize: 14, fontWeight: 700, color: '#e8ecf2' }}>Dashboard</h1>
        {relativeTime && (
          <span style={{ fontSize: 12, color: C.textMuted }}>
            Last scan <span style={{ color: C.textSec }}>{relativeTime}</span>
          </span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Live / Standby pill */}
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '5px 14px', borderRadius: 20,
            fontSize: 12, fontWeight: 600,
            background: isLive ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${isLive ? 'rgba(16,185,129,0.18)' : 'rgba(255,255,255,0.07)'}`,
            color: isLive ? '#34d399' : '#4b5563',
          }}
        >
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: isLive ? '#34d399' : '#2d3340',
            boxShadow: isLive ? '0 0 8px rgba(52,211,153,0.6)' : 'none',
            animation: isLive ? 'pulse-dot 2s ease-in-out infinite' : 'none',
          }} />
          {isLive ? 'Live' : 'Standby'}
        </div>

        <button className="btn-primary" onClick={onAnalyze} disabled={isLoading}>
          {isLoading ? (
            <>
              <span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite' }} />
              Scanning…
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
              Analyze
            </>
          )}
        </button>
      </div>
    </div>
  );
}
