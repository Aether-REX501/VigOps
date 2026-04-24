export const C = {
  textPrimary: '#e8ecf2',
  textSec: '#a0a8b8',
  textMuted: '#5a6373',
  textFaint: '#2d3340',
} as const;

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type IssueSeverity = 'LOW' | 'MEDIUM' | 'HIGH';

export const RISK = {
  HIGH:   { color: '#f87171', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.18)', glow: 'rgba(239,68,68,0.15)', gradient: 'linear-gradient(135deg, #ef4444, #f97316)' },
  MEDIUM: { color: '#fbbf24', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.18)', glow: 'rgba(245,158,11,0.15)', gradient: 'linear-gradient(135deg, #f59e0b, #f97316)' },
  LOW:    { color: '#34d399', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.18)', glow: 'rgba(16,185,129,0.15)', gradient: 'linear-gradient(135deg, #10b981, #06b6d4)' },
} as const;

export const ACTION_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  opened:      { color: '#60a5fa', bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.2)' },
  closed:      { color: '#f87171', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.2)' },
  merged:      { color: '#c084fc', bg: 'rgba(192,132,252,0.08)', border: 'rgba(192,132,252,0.2)' },
  reopened:    { color: '#fbbf24', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)' },
  synchronize: { color: '#9ca3af', bg: 'rgba(156,163,175,0.08)', border: 'rgba(156,163,175,0.2)' },
  open:        { color: '#60a5fa', bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.2)' },
  default:     { color: '#6b7280', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)' },
};

export function getActionStyle(a: string) { return ACTION_STYLES[a] ?? ACTION_STYLES.default; }

export function getRelativeTime(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 5)  return 'just now';
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}
