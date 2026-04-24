interface Props { onAnalyze: () => void; }

export default function IdleState({ onAnalyze }: Props) {
  const features = [
    { icon: '🔍', title: 'Risk Analysis', desc: 'Detect security, reliability, and configuration issues' },
    { icon: '💰', title: 'Cost Estimation', desc: 'Estimate monthly infrastructure cost impact' },
    { icon: '🧪', title: 'Stress Simulation', desc: 'Predict behavior under traffic spikes and failures' },
    { icon: '📂', title: 'File Scanning', desc: 'Analyze Kubernetes, Docker, Terraform, and CI files' },
  ];

  return (
    <div className="anim-fade-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 200px)', gap: 32, textAlign: 'center' }}>
      {/* Animated hero */}
      <div style={{ position: 'relative', width: 90, height: 90, animation: 'float 4s ease-in-out infinite' }}>
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 22,
          background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(6,182,212,0.04))',
          border: '1px solid rgba(59,130,246,0.12)',
          animation: 'glow-breathe 3s ease-in-out infinite',
        }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>
          🛰️
        </div>
        <div style={{
          position: 'absolute', width: 7, height: 7, borderRadius: '50%',
          background: '#3b82f6', boxShadow: '0 0 12px rgba(59,130,246,0.6)',
          top: '50%', left: '50%',
          animation: 'orbit 5s linear infinite',
        }} />
      </div>

      <div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#f0f2f5', marginBottom: 8 }}>Awaiting PR Analysis</h2>
        <p style={{ fontSize: 14, color: '#5a6373', maxWidth: 380, lineHeight: 1.6 }}>
          Connect a GitHub webhook for real-time monitoring, or use Instant Analysis above to scan any public PR.
        </p>
      </div>

      {/* Feature grid — clickable */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, width: '100%', maxWidth: 720 }}>
        {features.map((f, i) => (
          <div
            key={f.title}
            className="card card-interactive"
            style={{ padding: 20, textAlign: 'center', animation: `fade-up 0.4s ease ${i * 0.06}s both` }}
            onClick={onAnalyze}
          >
            <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#c8cdd6', marginBottom: 4 }}>{f.title}</div>
            <div style={{ fontSize: 11, color: '#4b5563', lineHeight: 1.5 }}>{f.desc}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button className="btn-primary" onClick={onAnalyze}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          Start Analyzing
        </button>
        <span style={{ fontSize: 12, color: '#2d3340' }}>or</span>
        <span className="btn-ghost" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>
          POST /webhook ← GitHub
        </span>
      </div>
    </div>
  );
}
