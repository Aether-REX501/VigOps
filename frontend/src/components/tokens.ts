// ─── Shared design tokens ─────────────────────────────────────────────────────

export const C = {
  bg: '#0b0f14',
  card: '#111827',
  cardHover: '#161f2e',
  border: 'rgba(255,255,255,0.07)',
  borderHover: 'rgba(255,255,255,0.12)',
  text: '#f9fafb',
  textSec: '#9ca3af',
  textMuted: '#6b7280',
  textFaint: '#374151',
} as const;

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type IssueSeverity = 'LOW' | 'MEDIUM' | 'HIGH';

export const RISK_STYLES: Record<RiskLevel, { color: string; bg: string; border: string; label: string }> = {
  HIGH:   { color: '#f87171', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.18)',   label: 'HIGH' },
  MEDIUM: { color: '#fbbf24', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.18)',  label: 'MEDIUM' },
  LOW:    { color: '#34d399', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.18)',  label: 'LOW' },
};

export const ACTION_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  opened:      { color: '#60a5fa', bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.2)' },
  closed:      { color: '#f87171', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.2)' },
  merged:      { color: '#c084fc', bg: 'rgba(192,132,252,0.08)', border: 'rgba(192,132,252,0.2)' },
  reopened:    { color: '#fbbf24', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)' },
  synchronize: { color: '#9ca3af', bg: 'rgba(156,163,175,0.08)', border: 'rgba(156,163,175,0.2)' },
  default:     { color: '#9ca3af', bg: 'rgba(156,163,175,0.08)', border: 'rgba(156,163,175,0.2)' },
};

export function getActionStyle(action: string) {
  return ACTION_STYLES[action] ?? ACTION_STYLES.default;
}

export function getRelativeTime(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 5)  return 'just now';
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}
