interface LoadingStateProps {
  message?: string;
  submessage?: string;
}

export default function LoadingState({
  message = 'Analyzing infrastructure',
  submessage = 'Checking risk levels, cost impact, and performance…',
}: LoadingStateProps) {
  const steps = [
    'Parsing deployment specs',
    'Running stress simulation',
    'Calculating cost delta',
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-5 text-center animate-fade-in-fast">
      {/* Spinner */}
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full" style={{ border: '2px solid rgba(255,255,255,0.06)' }} />
        <div className="absolute inset-0 rounded-full border-2 border-transparent"
          style={{ borderTopColor: '#3b82f6', animation: 'spin 0.9s linear infinite' }} />
      </div>

      {/* Text */}
      <div className="space-y-1.5">
        <p className="text-sm font-medium text-white">{message}</p>
        <p className="text-xs" style={{ color: '#6b7280' }}>{submessage}</p>
      </div>

      {/* Animated steps */}
      <div className="flex flex-col gap-2 text-xs" style={{ color: '#4b5563' }}>
        {steps.map((step, i) => (
          <div key={step} className="flex items-center gap-2"
            style={{ animation: `fade-in 0.4s ease ${i * 0.15}s both` }}>
            <span className="w-1 h-1 rounded-full" style={{ background: '#3b82f6', animation: `pulse-dot 1.5s ease ${i * 0.3}s infinite` }} />
            {step}
          </div>
        ))}
      </div>
    </div>
  );
}
