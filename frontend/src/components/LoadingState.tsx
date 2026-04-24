import { useEffect, useState } from 'react';

interface Props { message?: string; submessage?: string; }

const STEPS = [
  { label: 'Fetching PR metadata', icon: '📡' },
  { label: 'Scanning changed files', icon: '🔍' },
  { label: 'Detecting infrastructure patterns', icon: '⚙️' },
  { label: 'Running stress simulation', icon: '🧪' },
  { label: 'Estimating cost impact', icon: '💰' },
  { label: 'Generating risk assessment', icon: '📊' },
];

export default function LoadingState({ message = 'Analyzing infrastructure', submessage = 'Scanning files for risk, cost, and performance…' }: Props) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep(p => Math.min(p + 1, STEPS.length - 1)), 350);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="anim-fade-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 200px)', gap: 28 }}>
      {/* Scanner */}
      <div style={{ width: 80, height: 80, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(59,130,246,0.1)' }} />
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid transparent', borderTopColor: '#3b82f6', borderRightColor: 'rgba(59,130,246,0.3)', animation: 'spin 1s linear infinite' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, animation: 'pulse-dot 2s ease infinite' }}>
          {STEPS[step]?.icon}
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 16, fontWeight: 700, color: '#e8ecf2', marginBottom: 4 }}>{message}</p>
        <p style={{ fontSize: 12, color: '#5a6373' }}>{submessage}</p>
      </div>

      {/* Steps */}
      <div className="card" style={{ padding: 16, width: '100%', maxWidth: 340 }}>
        {STEPS.map((s, i) => {
          const done = i < step, active = i === step;
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '7px 10px', borderRadius: 8, marginBottom: 2,
              background: active ? 'rgba(59,130,246,0.06)' : 'transparent',
              transition: 'all 0.2s',
            }}>
              <div style={{ width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {done ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                ) : active ? (
                  <span style={{ width: 10, height: 10, borderRadius: '50%', border: '2px solid #3b82f6', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
                ) : (
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#1e2430' }} />
                )}
              </div>
              <span style={{ fontSize: 12, color: done ? '#34d399' : active ? '#e8ecf2' : '#2d3340', fontWeight: active ? 600 : 400, transition: 'color 0.2s' }}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div style={{ width: '100%', maxWidth: 340, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 2,
          background: 'linear-gradient(90deg, #3b82f6, #06b6d4)',
          width: `${((step + 1) / STEPS.length) * 100}%`,
          transition: 'width 0.35s ease',
          boxShadow: '0 0 12px rgba(59,130,246,0.4)',
        }} />
      </div>
    </div>
  );
}
