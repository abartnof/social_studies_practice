import { BookOpen, Flag, HeartCrack } from 'lucide-react';

interface HeartZeroModalProps {
  frozenScore: number;
  onFinishStudyMode: () => void;
  onEndRun: () => void;
}

export function HeartZeroModal({
  frozenScore,
  onFinishStudyMode,
  onEndRun,
}: HeartZeroModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="heart-zero-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 30,
        background: 'rgba(6, 10, 17, 0.72)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        className="fade-in"
        style={{
          width: '100%',
          maxWidth: '390px',
          padding: '18px',
          borderRadius: '6px',
          background: 'var(--surface-card)',
          border: '1px solid var(--border-strong)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          boxShadow: 'var(--shadow-elevated)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '14px',
              background: 'var(--accent-crimson-soft)',
              color: 'var(--accent-crimson)',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            <HeartCrack size={22} aria-hidden="true" />
          </div>
          <div>
            <h2
              id="heart-zero-title"
              className="tabular-nums"
              style={{ margin: 0, fontSize: '1.12rem', fontWeight: 700 }}
            >
              Out of Hearts — Score Frozen at {frozenScore}
            </h2>
          </div>
        </div>

        <p style={{ margin: 0, fontSize: '0.94rem', color: 'var(--ink-secondary)' }}>
          Your sprint score is locked in. Continue the remaining questions in{' '}
          <strong>Study Mode</strong> (0 pts, no penalties) to sharpen weak domains, or wrap up now.
        </p>

        <button
          type="button"
          className="tactile-btn btn-primary"
          style={{ width: '100%' }}
          onClick={onFinishStudyMode}
        >
          <BookOpen size={18} aria-hidden="true" />
          <span>Finish in Study Mode</span>
        </button>

        <button
          type="button"
          className="tactile-btn btn-tonal"
          style={{ width: '100%' }}
          onClick={onEndRun}
        >
          <Flag size={17} aria-hidden="true" />
          <span>End Run &amp; View Receipt</span>
        </button>
      </div>
    </div>
  );
}
