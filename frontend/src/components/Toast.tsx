import { useEffect, useState } from 'react';

export interface Toast {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'danger';
}

const COLORS = {
  info:    { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.25)', color: '#60a5fa', icon: '📡' },
  success: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)', color: '#34d399', icon: '✅' },
  warning: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', color: '#fbbf24', icon: '⚠️' },
  danger:  { bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.25)',  color: '#f87171', icon: '🔴' },
};

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  function addToast(title: string, message: string, type: Toast['type'] = 'info') {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  }

  function dismiss(id: string) {
    setToasts(prev => prev.filter(t => t.id !== id));
  }

  return { toasts, addToast, dismiss };
}

export function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  return (
    <div style={{
      position: 'fixed', top: 64, right: 20, zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: 8,
      pointerEvents: 'none', maxWidth: 380,
    }}>
      {toasts.map((t, i) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} index={i} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss, index }: { toast: Toast; onDismiss: () => void; index: number }) {
  const [visible, setVisible] = useState(false);
  const c = COLORS[toast.type];

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  return (
    <div
      onClick={onDismiss}
      style={{
        pointerEvents: 'auto',
        display: 'flex', alignItems: 'flex-start', gap: 10,
        padding: '12px 16px', borderRadius: 12,
        background: c.bg, border: `1px solid ${c.border}`,
        backdropFilter: 'blur(20px)',
        cursor: 'pointer',
        transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
        transform: visible ? 'translateX(0)' : 'translateX(100%)',
        opacity: visible ? 1 : 0,
        boxShadow: `0 8px 30px rgba(0,0,0,0.4), 0 0 20px ${c.bg}`,
      }}
    >
      <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{c.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: c.color, marginBottom: 2 }}>{toast.title}</div>
        <div style={{ fontSize: 11, color: '#8892a4', lineHeight: 1.5 }}>{toast.message}</div>
      </div>
      {/* Progress bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
        borderRadius: '0 0 12px 12px', overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', background: c.color,
          animation: 'toast-progress 4.5s linear forwards',
        }} />
      </div>
    </div>
  );
}
