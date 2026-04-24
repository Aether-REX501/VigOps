import { useState } from 'react';
import type { PRAnalysis, Issue, IssueSeverity, RiskLevel } from '../types';
import { RISK, getActionStyle, C } from './tokens';
import { RiskSparkline, ExportButton } from './Extras';

/* ─── Utility badges ──────────────────────────────────────────────────────── */

function RiskBadge({ level }: { level: RiskLevel }) {
  const s = RISK[level];
  return (
    <span className="badge" style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, boxShadow: `0 0 6px ${s.color}` }} />
      {level}
    </span>
  );
}

function SeverityBadge({ severity }: { severity: IssueSeverity }) {
  const s = RISK[severity];
  return (
    <span className="badge" style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color, fontSize: 10, padding: '2px 8px' }}>
      {severity}
    </span>
  );
}

function ActionBadge({ action }: { action: string }) {
  const s = getActionStyle(action);
  return (
    <span className="badge" style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
      {action}
    </span>
  );
}

/* ─── File helpers ────────────────────────────────────────────────────────── */

function fileIcon(f: string): string {
  const n = f.toLowerCase();
  if (n.includes('dockerfile')) return '🐳';
  if (n.endsWith('.yaml') || n.endsWith('.yml')) return '☸️';
  if (n.endsWith('.tf')) return '🏗️';
  if (n.includes('.github/workflows')) return '⚙️';
  if (n.endsWith('.ts') || n.endsWith('.js') || n.endsWith('.tsx')) return '📦';
  if (n.endsWith('.py')) return '🐍';
  if (n.endsWith('.go')) return '🐹';
  return '📄';
}
function baseName(f: string) { return f.split('/').pop() ?? f; }

/* ─── PR Info Banner ─────────────────────────────────────────────────────── */

function PRBanner({ a }: { a: PRAnalysis }) {
  return (
    <div className="card" style={{ padding: '16px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <span className="badge" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.18)', color: '#60a5fa', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
            #{a.pr}
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#e8ecf2' }}>{a.prTitle}</span>
              <span className="badge" style={{
                background: a.source === 'manual' ? 'rgba(99,102,241,0.08)' : 'rgba(16,185,129,0.08)',
                border: `1px solid ${a.source === 'manual' ? 'rgba(99,102,241,0.15)' : 'rgba(16,185,129,0.15)'}`,
                color: a.source === 'manual' ? '#818cf8' : '#34d399',
                fontSize: 10,
              }}>
                {a.source === 'manual' ? '🔍 Manual' : '🔗 Webhook'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: C.textMuted, display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                {a.repo}
              </span>
              <span style={{ color: '#1e2430' }}>·</span>
              <span style={{ fontSize: 12, color: C.textMuted, display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                {a.sender}
              </span>
              <span style={{ color: '#1e2430' }}>·</span>
              <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#4b5563' }}>
                {a.branchFrom} → {a.branchTo}
              </span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <ActionBadge action={a.action} />
          {a.prUrl && (
            <a href={a.prUrl} target="_blank" rel="noreferrer" className="btn-ghost">
              View PR
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Stats Row ──────────────────────────────────────────────────────────── */

function Stats({ a }: { a: PRAnalysis }) {
  const high = a.issues.filter(i => i.severity === 'HIGH').length;
  const med = a.issues.filter(i => i.severity === 'MEDIUM').length;
  const low = a.issues.filter(i => i.severity === 'LOW').length;
  const items = [
    { label: 'Risk Score', value: a.riskLevel === 'HIGH' ? '85' : a.riskLevel === 'MEDIUM' ? '55' : '25', color: RISK[a.riskLevel].color, suffix: '/100' },
    { label: 'Issues', value: String(a.issues.length), color: '#60a5fa', suffix: '' },
    { label: 'Critical', value: String(high), color: '#f87171', suffix: '' },
    { label: 'Warnings', value: String(med), color: '#fbbf24', suffix: '' },
    { label: 'Info', value: String(low), color: '#34d399', suffix: '' },
    { label: 'Files', value: String(a.analyzedFiles.length || '—'), color: '#818cf8', suffix: '' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
      {items.map((it, i) => (
        <div key={it.label} className="card card-interactive" style={{ padding: '14px 12px', textAlign: 'center', animation: `fade-up 0.35s ease ${i * 0.04}s both` }}>
          <div style={{ fontSize: 26, fontWeight: 900, color: it.color, animation: 'count-up 0.5s ease both', lineHeight: 1 }}>
            {it.value}<span style={{ fontSize: 12, fontWeight: 500, color: C.textMuted }}>{it.suffix}</span>
          </div>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#3d4555', marginTop: 6 }}>{it.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ─── Risk Gauge ─────────────────────────────────────────────────────────── */

function RiskGauge({ level }: { level: RiskLevel }) {
  const s = RISK[level];
  const pct = level === 'HIGH' ? 85 : level === 'MEDIUM' ? 55 : 25;
  const desc: Record<RiskLevel, string> = {
    HIGH: 'Critical issues detected. Immediate action required before merging this PR.',
    MEDIUM: 'Moderate risk identified. Review flagged issues before proceeding with merge.',
    LOW: 'No critical blockers. Infrastructure changes appear safe to deploy.',
  };

  return (
    <div className="card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 20, borderColor: s.border }}>
      {/* SVG gauge */}
      <div style={{ width: 72, height: 72, position: 'relative', flexShrink: 0 }}>
        <svg width="72" height="72" viewBox="0 0 72 72" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="36" cy="36" r="30" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="6" />
          <circle cx="36" cy="36" r="30" fill="none" stroke={s.color} strokeWidth="6" strokeLinecap="round"
            strokeDasharray={`${(pct / 100) * 188.5} 188.5`}
            style={{ filter: `drop-shadow(0 0 8px ${s.color})`, transition: 'stroke-dasharray 1s ease' }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{pct}</span>
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: C.textMuted }}>Risk Assessment</span>
          <RiskBadge level={level} />
        </div>
        <p style={{ fontSize: 13, color: C.textSec, lineHeight: 1.6 }}>{desc[level]}</p>
        <div style={{ marginTop: 10, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 3, width: `${pct}%`,
            background: s.gradient, boxShadow: `0 0 14px ${s.glow}`,
            animation: 'risk-fill 1s cubic-bezier(0.16,1,0.3,1) both',
          }} />
        </div>
      </div>
    </div>
  );
}

/* ─── Issues Panel ───────────────────────────────────────────────────────── */

function IssuesPanel({ issues }: { issues: Issue[] }) {
  const [expanded, setExpanded] = useState<number | null>(0); // first expanded by default

  return (
    <div className="card" style={{ padding: 20, height: '100%' }}>
      <div className="section-title" style={{ marginBottom: 14 }}>
        <span>⚠️</span> Detected Issues ({issues.length})
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }} className="stagger">
        {issues.map((issue, i) => {
          const isOpen = expanded === i;
          return (
            <div
              key={i}
              className="card-interactive"
              style={{
                borderRadius: 10, overflow: 'hidden',
                background: isOpen ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.015)',
                border: `1px solid ${isOpen ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)'}`,
                transition: 'all 0.25s ease',
              }}
              onClick={() => setExpanded(isOpen ? null : i)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '10px 14px', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                    background: RISK[issue.severity].color,
                    boxShadow: `0 0 8px ${RISK[issue.severity].glow}`,
                  }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#c8cdd6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {issue.title}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <SeverityBadge severity={issue.severity} />
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="2"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>
              </div>
              <div style={{ maxHeight: isOpen ? 100 : 0, overflow: 'hidden', transition: 'max-height 0.3s cubic-bezier(0.16,1,0.3,1)' }}>
                <div style={{ padding: '0 14px 12px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                  <p style={{ fontSize: 12, color: '#5a6373', lineHeight: 1.7, paddingTop: 10 }}>{issue.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Suggestions Panel ──────────────────────────────────────────────────── */

function SuggestionsPanel({ suggestions }: { suggestions: string[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  return (
    <div className="card" style={{ padding: 20, height: '100%' }}>
      <div className="section-title" style={{ marginBottom: 14 }}>
        <span>💡</span> Recommendations ({suggestions.length})
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }} className="stagger">
        {suggestions.map((s, i) => (
          <div
            key={i}
            className="card-interactive"
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              padding: '12px 14px', borderRadius: 10,
              background: hoveredIdx === i ? 'rgba(59,130,246,0.05)' : 'rgba(255,255,255,0.015)',
              border: `1px solid ${hoveredIdx === i ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)'}`,
              transition: 'all 0.2s',
            }}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <span style={{
              width: 24, height: 24, borderRadius: 8, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 800,
              background: hoveredIdx === i ? 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(6,182,212,0.15))' : 'rgba(59,130,246,0.08)',
              border: '1px solid rgba(59,130,246,0.12)',
              color: '#60a5fa', fontFamily: 'JetBrains Mono, monospace',
              transition: 'background 0.2s',
            }}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <span style={{ fontSize: 12, fontWeight: 500, color: '#a0a8b8', lineHeight: 1.6 }}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Cost + Simulation ──────────────────────────────────────────────────── */

function InsightsRow({ costImpact, simulation }: { costImpact: string; simulation: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
      <div className="card card-interactive" style={{ padding: 20 }}>
        <div className="section-title" style={{ marginBottom: 12 }}><span>💰</span> Cost Impact</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
            background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(6,182,212,0.05))',
            border: '1px solid rgba(16,185,129,0.12)',
          }}>💸</div>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#34d399', lineHeight: 1.5 }}>{costImpact}</span>
        </div>
      </div>
      <div className="card card-interactive" style={{ padding: 20 }}>
        <div className="section-title" style={{ marginBottom: 12 }}><span>🧪</span> Stress Simulation</div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
            background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(249,115,22,0.05))',
            border: '1px solid rgba(245,158,11,0.12)',
          }}>🧪</div>
          <p style={{ fontSize: 13, fontWeight: 500, color: '#a0a8b8', lineHeight: 1.7, borderLeft: '3px solid rgba(245,158,11,0.2)', paddingLeft: 14 }}>
            {simulation}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Files Card ─────────────────────────────────────────────────────────── */

function FilesCard({ files }: { files: string[] }) {
  if (files.length === 0) return null;
  return (
    <div className="card" style={{ padding: 16 }}>
      <div className="section-title" style={{ marginBottom: 12 }}><span>📂</span> Scanned Files ({files.length})</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {files.map((f, i) => (
          <div key={i} className="btn-ghost" style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', cursor: 'default' }} title={f}>
            <span>{fileIcon(f)}</span> {baseName(f)}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── History ────────────────────────────────────────────────────────────── */

function History({ history, onSelect }: { history: PRAnalysis[]; onSelect: (a: PRAnalysis) => void }) {
  function fmt(iso: string) {
    return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  }
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px' }}>
        <div className="section-title"><span>📋</span> Analysis History ({history.length})</div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {['PR', 'Repository', 'Action', 'Risk', 'Source', 'Time'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 20px', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#262e3d', background: 'rgba(255,255,255,0.015)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.map((h, i) => (
              <tr
                key={h.id}
                onClick={() => onSelect(h)}
                style={{
                  borderBottom: i === history.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.03)',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.04)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = ''; }}
              >
                <td style={{ padding: '12px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#60a5fa', fontWeight: 700 }}>#{h.pr}</span>
                    {i === 0 && <span className="badge" style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa', fontSize: 9, padding: '1px 6px', border: '1px solid rgba(59,130,246,0.15)' }}>LATEST</span>}
                  </div>
                </td>
                <td style={{ padding: '12px 20px', color: C.textSec, fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>{h.repo}</td>
                <td style={{ padding: '12px 20px' }}><ActionBadge action={h.action} /></td>
                <td style={{ padding: '12px 20px' }}><RiskBadge level={h.riskLevel} /></td>
                <td style={{ padding: '12px 20px' }}>
                  <span className="badge" style={{
                    background: h.source === 'manual' ? 'rgba(99,102,241,0.08)' : 'rgba(16,185,129,0.06)',
                    border: `1px solid ${h.source === 'manual' ? 'rgba(99,102,241,0.15)' : 'rgba(16,185,129,0.15)'}`,
                    color: h.source === 'manual' ? '#818cf8' : '#34d399',
                    fontSize: 10,
                  }}>
                    {h.source === 'manual' ? '🔍 Manual' : '🔗 Webhook'}
                  </span>
                </td>
                <td style={{ padding: '12px 20px', color: C.textMuted, fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>{fmt(h.timestamp)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Dashboard ──────────────────────────────────────────────────────────── */

interface DashboardProps {
  analysis: PRAnalysis;
  history: PRAnalysis[];
  onSelectHistory?: (a: PRAnalysis) => void;
}

export default function Dashboard({ analysis: a, history, onSelectHistory }: DashboardProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }} className="stagger">
      <PRBanner a={a} />
      <Stats a={a} />
      {a.analyzedFiles.length > 0 && <FilesCard files={a.analyzedFiles} />}
      <div style={{ display: 'grid', gridTemplateColumns: history.length > 1 ? '1fr 1fr' : '1fr', gap: 12 }}>
        <RiskGauge level={a.riskLevel} />
        {history.length > 1 && <RiskSparkline history={history} />}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <IssuesPanel issues={a.issues} />
        <SuggestionsPanel suggestions={a.suggestions} />
      </div>
      <InsightsRow costImpact={a.costImpact} simulation={a.simulation} />
      {/* Actions bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
        <ExportButton analysis={a} />
      </div>
      {history.length > 1 && <History history={history} onSelect={(h) => onSelectHistory?.(h)} />}
    </div>
  );
}
