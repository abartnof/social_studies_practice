import { X } from 'lucide-react';
import type { AnswerResult } from '../types/quiz';

interface TopStatusBarProps {
  totalQuestions: number;
  currentIndex: number;
  results: AnswerResult[];
  onExit: () => void;
}

export function TopStatusBar({
  totalQuestions,
  currentIndex,
  results,
  onExit,
}: TopStatusBarProps) {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '6px 0',
      }}
    >
      <button
        type="button"
        onClick={onExit}
        aria-label="Exit sprint"
        style={{
          width: '32px',
          height: '32px',
          border: 'none',
          background: 'transparent',
          color: '#FFFFFF',
          display: 'grid',
          placeItems: 'center',
          cursor: 'pointer',
          padding: 0,
          flexShrink: 0,
        }}
      >
        <X size={18} aria-hidden="true" />
      </button>

      {/* Progress Pips */}
      <div
        role="progressbar"
        aria-valuenow={currentIndex + 1}
        aria-valuemin={1}
        aria-valuemax={totalQuestions}
        aria-label={`Question ${currentIndex + 1} of ${totalQuestions}`}
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: `repeat(${totalQuestions}, minmax(0, 1fr))`,
          gap: '5px',
        }}
      >
        {Array.from({ length: totalQuestions }).map((_, idx) => {
          const res = results[idx];
          const isActive = idx === currentIndex && !res;

          let bg = 'transparent';
          let borderColor = 'rgba(255, 255, 255, 0.22)';

          if (res) {
            if (res.isCorrect) {
              bg = 'var(--accent-emerald)';
              borderColor = 'var(--accent-emerald)';
            } else {
              bg = 'var(--accent-crimson)';
              borderColor = 'var(--accent-crimson)';
            }
          } else if (isActive) {
            bg = '#FFFFFF';
            borderColor = '#FFFFFF';
          }

          return (
            <div
              key={idx}
              style={{
                height: '6px',
                borderRadius: '2px',
                background: bg,
                border: `1px solid ${borderColor}`,
                transition: 'background-color 200ms ease, border-color 200ms ease',
              }}
            />
          );
        })}
      </div>
    </header>
  );
}
