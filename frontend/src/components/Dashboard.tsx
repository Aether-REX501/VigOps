import type { PRAnalysis, Issue, IssueSeverity, RiskLevel } from '../types';
import { RISK_STYLES, getActionStyle, C } from './tokens';

// ─── Shared card wrapper ──────────────────────────────────────────────────────

function Card({ children, className = '', style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`rounded-xl ${className}`} style={{ background: C.card, border: `1px solid ${C.border}`, ...style }}>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: C.textMuted }}>
      {children}
    </p>
  );
}

function RiskBadge({ level }: { level: RiskLevel }) {
  const s = RISK_STYLES[level];
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
      {level}
    </span>
  );
}

function SeverityBadge({ severity }: { severity: IssueSeverity }) {
  const s = RISK_STYLES[severity];
  return (
    <span className="shrink-0 px-1.5 py-0.5 rounded text-xs font-medium"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {severity}
    </span>
  );
}

function ActionBadge({ action }: { action: string }) {
  const s = getActionStyle(action);
  return (
    <span className="px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wide"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
      {action}
    </span>
  );
}

// ─── File type icons ──────────────────────────────────────────────────────────

function fileIcon(filename: string): string {
  const name = filename.toLowerCase();
  if (name.includes('dockerfile')) return '🐳';
  if (name.endsWith('.yaml') || name.endsWith('.yml')) return '☸️';
  if (name.endsWith('.tf') || name.endsWith('.tfvars')) return '🏗️';
  if (name.includes('.github/workflows') || name.includes('ci')) return '⚙️';
  if (name.endsWith('.ts') || name.endsWith('.js') || name.endsWith('.tsx') || name.endsWith('.jsx')) return '📦';
  if (name.endsWith('.py')) return '🐍';
  if (name.endsWith('.go')) return '🐹';
  if (name.endsWith('.json')) return '{}';
  if (name.endsWith('.md')) return '📝';
  if (name.endsWith('.sh')) return '⚡';
  return '📄';
}

function baseName(filename: string): string {
  return filename.split('/').pop() ?? filename;
}

// ─── PR Info Card ─────────────────────────────────────────────────────────────

function PRInfoCard({ a }: { a: PRAnalysis }) {
  return (
    <Card className="p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <span className="shrink-0 px-2 py-0.5 rounded-md text-xs font-semibold"
            style={{ fontFamily: 'JetBrains Mono, monospace', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', color: '#60a5fa' }}>
            #{a.pr}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-semibold text-white truncate">{a.prTitle}</h2>
              {/* Source badge */}
              <span
                className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                style={
                  a.source === 'manual'
                    ? { background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8' }
                    : { background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.18)', color: '#34d399' }
                }
              >
                {a.source === 'manual' ? '🔍 Manual Analysis' : '🔗 Webhook'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
              <span className="text-xs" style={{ color: C.textMuted }}>📦 {a.repo}</span>
              <span style={{ color: C.textFaint }}>·</span>
              <span className="text-xs" style={{ color: C.textMuted }}>👤 {a.sender}</span>
              <span style={{ color: C.textFaint }}>·</span>
              <div className="flex items-center gap-1 text-xs" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <span className="px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.04)', color: '#9ca3af', fontSize: 10 }}>{a.branchFrom}</span>
                <span style={{ color: C.textFaint }}>→</span>
                <span className="px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.04)', color: '#9ca3af', fontSize: 10 }}>{a.branchTo}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ActionBadge action={a.action} />
          {a.prUrl && (
            <a href={a.prUrl} target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-150"
              style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, color: C.textSec, textDecoration: 'none' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#fff'; (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.07)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = C.textSec; (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.04)'; }}>
              View PR
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </a>
          )}
        </div>
      </div>
    </Card>
  );
}

// ─── Analyzed Files Card ──────────────────────────────────────────────────────

function AnalyzedFilesCard({ files }: { files: string[] }) {
  if (files.length === 0) return null;
  return (
    <Card className="p-4">
      <SectionLabel>Analyzed Files ({files.length})</SectionLabel>
      <div className="flex flex-wrap gap-2">
        {files.map((file, i) => (
          <div
            key={i}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors duration-100"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              color: C.textSec,
              maxWidth: 260,
            }}
            title={file}
          >
            <span style={{ flexShrink: 0 }}>{fileIcon(file)}</span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {baseName(file)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── Risk Card ────────────────────────────────────────────────────────────────

function RiskCard({ level }: { level: RiskLevel }) {
  const s = RISK_STYLES[level];
  const descs: Record<RiskLevel, string> = {
    HIGH:   'Immediate action required before merging.',
    MEDIUM: 'Review flagged issues — moderate risk to production.',
    LOW:    'No critical blockers detected. Safe to merge.',
  };
  return (
    <Card className="p-4 flex items-center gap-3">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
        style={{ background: s.bg, border: `1px solid ${s.border}` }}>
        {level === 'HIGH' ? '⛔' : level === 'MEDIUM' ? '⚠️' : '✅'}
      </div>
      <div>
        <div className="flex items-center gap-2"><p className="text-xs" style={{ color: C.textMuted }}>Risk Level</p><RiskBadge level={level} /></div>
        <p className="text-xs mt-1" style={{ color: C.textSec }}>{descs[level]}</p>
      </div>
    </Card>
  );
}

// ─── Issues Card (with descriptions) ─────────────────────────────────────────

function IssuesCard({ issues }: { issues: Issue[] }) {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <Card className="p-4">
      <SectionLabel>Detected Issues ({issues.length})</SectionLabel>
      <div className="space-y-2">
        {issues.map((issue, i) => (
          <div
            key={i}
            className="rounded-lg overflow-hidden transition-colors duration-100"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
          >
            <button
              className="w-full flex items-start justify-between gap-3 px-3 py-2.5 text-left"
              style={{ background: 'transparent', cursor: 'pointer' }}
              onClick={() => setExpanded(expanded === i ? null : i)}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.02)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
            >
              <div className="flex items-start gap-2 min-w-0">
                <span className="text-xs mt-0.5 shrink-0" style={{ color: RISK_STYLES[issue.severity].color }}>⚠</span>
                <span className="text-xs leading-relaxed" style={{ color: C.textSec }}>{issue.title}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <SeverityBadge severity={issue.severity} />
                <svg
                  width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="2.5"
                  style={{ transform: expanded === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', flexShrink: 0 }}
                >
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </button>
            {expanded === i && (
              <div className="px-3 pb-3" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                <p className="text-xs leading-relaxed pt-2.5" style={{ color: '#6b7280' }}>
                  {issue.description}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── Suggestions Card ─────────────────────────────────────────────────────────

function SuggestionsCard({ suggestions }: { suggestions: string[] }) {
  return (
    <Card className="p-4">
      <SectionLabel>Suggestions ({suggestions.length})</SectionLabel>
      <div className="space-y-2">
        {suggestions.map((s, i) => (
          <div
            key={i}
            className="flex items-start gap-3 px-3 py-2.5 rounded-lg transition-colors duration-100"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.02)'; }}
          >
            <span className="shrink-0 w-5 h-5 flex items-center justify-center rounded text-xs font-semibold mt-0.5"
              style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.15)', color: '#60a5fa', fontFamily: 'JetBrains Mono, monospace', fontSize: 10 }}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="text-xs leading-relaxed" style={{ color: C.textSec }}>{s}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── Cost + Simulation ────────────────────────────────────────────────────────

function CostSimRow({ costImpact, simulation }: { costImpact: string; simulation: string }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card className="p-4">
        <SectionLabel>Cost Impact</SectionLabel>
        <div className="flex items-start gap-2">
          <span className="text-lg">💸</span>
          <div>
            <p className="text-sm font-semibold" style={{ color: '#34d399' }}>{costImpact}</p>
          </div>
        </div>
      </Card>
      <Card className="p-4 sm:col-span-2">
        <SectionLabel>Stress Simulation</SectionLabel>
        <div className="flex items-start gap-2">
          <span className="text-lg shrink-0">🧪</span>
          <p className="text-xs leading-relaxed" style={{ color: C.textSec, borderLeft: '2px solid rgba(245,158,11,0.3)', paddingLeft: 10 }}>
            {simulation}
          </p>
        </div>
      </Card>
    </div>
  );
}

// ─── History Table ────────────────────────────────────────────────────────────

function HistoryTable({ history }: { history: PRAnalysis[] }) {
  function fmt(iso: string) {
    return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  }
  return (
    <Card>
      <div className="px-4 pt-4 pb-2"><SectionLabel>Event History ({history.length})</SectionLabel></div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {['PR', 'Repository', 'Action', 'Risk', 'Source', 'Time'].map((h) => (
                <th key={h} className="text-left px-4 py-2.5 font-medium uppercase tracking-widest" style={{ color: C.textMuted, fontSize: 10 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.map((h, i) => (
              <tr key={h.id}
                style={{ borderBottom: i === history.length - 1 ? 'none' : `1px solid rgba(255,255,255,0.03)` }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(255,255,255,0.02)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = ''; }}>
                <td className="px-4 py-3">
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#60a5fa' }}>#{h.pr}</span>
                  {i === 0 && <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase" style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa' }}>latest</span>}
                </td>
                <td className="px-4 py-3" style={{ color: C.textSec, fontFamily: 'JetBrains Mono, monospace' }}>{h.repo}</td>
                <td className="px-4 py-3"><ActionBadge action={h.action} /></td>
                <td className="px-4 py-3"><RiskBadge level={h.riskLevel} /></td>
                <td className="px-4 py-3">
                  <span className="text-xs" style={{ color: h.source === 'manual' ? '#818cf8' : '#34d399' }}>
                    {h.source === 'manual' ? '🔍 Manual' : '🔗 Webhook'}
                  </span>
                </td>
                <td className="px-4 py-3" style={{ color: C.textMuted, fontFamily: 'JetBrains Mono, monospace' }}>{fmt(h.timestamp)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ─── Dashboard root ───────────────────────────────────────────────────────────

import { useState } from 'react';

interface DashboardProps {
  analysis: PRAnalysis;
  history: PRAnalysis[];
}

export default function Dashboard({ analysis: a, history }: DashboardProps) {
  return (
    <div className="space-y-4 animate-fade-in">
      <PRInfoCard a={a} />
      {a.analyzedFiles.length > 0 && <AnalyzedFilesCard files={a.analyzedFiles} />}
      <RiskCard level={a.riskLevel} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <IssuesCard issues={a.issues} />
        <SuggestionsCard suggestions={a.suggestions} />
      </div>
      <CostSimRow costImpact={a.costImpact} simulation={a.simulation} />
      {history.length > 1 && <HistoryTable history={history} />}
    </div>
  );
}
