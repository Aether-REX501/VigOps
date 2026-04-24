import type { PRAnalysis, RiskLevel } from '../types';
import { RISK, C } from './tokens';

/* ─── Sparkline Chart ─────────────────────────────────────────────────────── */
/* Renders an SVG area chart of risk scores over time */

function riskToNum(level: RiskLevel): number {
  return level === 'HIGH' ? 85 : level === 'MEDIUM' ? 55 : 25;
}

export function RiskSparkline({ history }: { history: PRAnalysis[] }) {
  if (history.length < 2) return null;

  const data = [...history].reverse().slice(-10).map(h => riskToNum(h.riskLevel));
  const w = 200, h = 48, px = 4, py = 6;
  const max = 100, min = 0;
  const stepX = (w - px * 2) / (data.length - 1);

  const points = data.map((v, i) => {
    const x = px + i * stepX;
    const y = py + ((max - v) / (max - min)) * (h - py * 2);
    return { x, y, v };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaPath = `${linePath} L${points[points.length - 1].x},${h} L${points[0].x},${h} Z`;
  const latest = data[data.length - 1];
  const latestColor = latest >= 70 ? RISK.HIGH.color : latest >= 40 ? RISK.MEDIUM.color : RISK.LOW.color;

  return (
    <div className="card" style={{ padding: 16 }}>
      <div className="section-title" style={{ marginBottom: 10 }}>
        <span>📈</span> Risk Trend
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
          {/* Grid lines */}
          {[25, 50, 75].map(v => {
            const y = py + ((max - v) / (max - min)) * (h - py * 2);
            return <line key={v} x1={px} y1={y} x2={w - px} y2={y} stroke="rgba(255,255,255,0.04)" strokeDasharray="3,3" />;
          })}
          {/* Area fill */}
          <defs>
            <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={latestColor} stopOpacity="0.2" />
              <stop offset="100%" stopColor={latestColor} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#riskGrad)" />
          {/* Line */}
          <path d={linePath} fill="none" stroke={latestColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ filter: `drop-shadow(0 0 4px ${latestColor})` }} />
          {/* Dots */}
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={i === points.length - 1 ? 4 : 2.5}
              fill={p.v >= 70 ? RISK.HIGH.color : p.v >= 40 ? RISK.MEDIUM.color : RISK.LOW.color}
              stroke={i === points.length - 1 ? '#060910' : 'none'} strokeWidth={i === points.length - 1 ? 2 : 0}
              style={i === points.length - 1 ? { filter: `drop-shadow(0 0 6px ${latestColor})` } : {}}
            />
          ))}
        </svg>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, color: latestColor, lineHeight: 1 }}>{latest}</div>
          <div style={{ fontSize: 10, fontWeight: 600, color: C.textMuted, marginTop: 3 }}>Current Score</div>
          <div style={{ fontSize: 10, color: C.textFaint, marginTop: 1 }}>{data.length} analyses</div>
        </div>
      </div>
    </div>
  );
}

/* ─── Export Button ────────────────────────────────────────────────────────── */

export function ExportButton({ analysis }: { analysis: PRAnalysis }) {
  function handleExport() {
    const blob = new Blob([JSON.stringify(analysis, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vigops-report-${analysis.repo.replace('/', '-')}-PR${analysis.pr}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button className="btn-ghost" onClick={handleExport} title="Export analysis as JSON">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      Export
    </button>
  );
}

/* ─── Keyboard Shortcut Hint ──────────────────────────────────────────────── */

export function ShortcutHint() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '6px 12px', borderRadius: 8,
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.05)',
      cursor: 'default',
    }}>
      <kbd style={{
        padding: '2px 6px', borderRadius: 5,
        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
        color: '#5a6373', fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600,
      }}>⌘K</kbd>
      <span style={{ fontSize: 11, color: '#3d4555' }}>Quick search</span>
    </div>
  );
}

/* ─── Sidebar Activity Feed ───────────────────────────────────────────────── */

export function ActivityFeed({ history }: { history: PRAnalysis[] }) {
  if (history.length === 0) return null;
  const recent = history.slice(0, 5);

  function timeAgo(iso: string) {
    const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m`;
    return `${Math.floor(m / 60)}h`;
  }

  return (
    <div style={{ padding: '0 12px' }}>
      <div style={{ padding: '12px 4px 8px', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#1e2430' }}>
        Recent Activity
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {recent.map((h, i) => {
          const riskColor = RISK[h.riskLevel].color;
          return (
            <div
              key={h.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '7px 8px', borderRadius: 8,
                transition: 'background 0.15s', cursor: 'pointer',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = ''; }}
            >
              <span style={{
                width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                background: riskColor, boxShadow: `0 0 6px ${riskColor}40`,
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#8892a4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  #{h.pr} {h.repo}
                </div>
              </div>
              <span style={{ fontSize: 10, color: '#2d3340', flexShrink: 0, fontFamily: 'JetBrains Mono, monospace' }}>
                {timeAgo(h.timestamp)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
