import { ArrowRight } from 'lucide-react';
import type { AnswerResult, Question } from '../types/quiz';
import { ConceptInfographic } from './ConceptInfographic';

interface FeedbackDrawerProps {
  question: Question;
  result: AnswerResult;
  coreLink: string;
  trapNote: string;
  studyMode: boolean;
  isFinalQuestion: boolean;
  onNext: () => void;
}

export function FeedbackDrawer({
  question,
  result,
  coreLink,
  trapNote,
  studyMode,
  isFinalQuestion,
  onNext,
}: FeedbackDrawerProps) {
  const isCorrect = result.isCorrect;

  const deltaText =
    result.pointsDelta > 0
      ? `+${result.pointsDelta}`
      : result.pointsDelta < 0
        ? `${result.pointsDelta}`
        : '0';

  let statusBg = 'var(--accent-crimson-soft)';
  let statusColor = 'var(--accent-crimson)';
  let statusBorder = 'var(--accent-crimson-border)';
  let statusLabel = studyMode ? '✗ Study Mode' : `✗ ${deltaText}`;

  if (isCorrect) {
    statusBg = 'var(--accent-emerald-soft)';
    statusColor = 'var(--accent-emerald)';
    statusBorder = 'var(--accent-emerald-border)';
    statusLabel = studyMode ? '✓ Study Mode' : `✓ ${deltaText}`;
  }

  const singleExplanation = isCorrect ? coreLink : trapNote || coreLink;

  return (
    <div
      role="dialog"
      aria-label="Answer feedback"
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 20,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <div
        className="sheet-enter"
        style={{
          pointerEvents: 'auto',
          width: '100%',
          maxWidth: '430px',
          maxHeight: '78dvh',
          overflowY: 'auto',
          background: 'rgba(13, 21, 36, 0.97)',
          backdropFilter: 'blur(14px)',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          borderTop: '1px solid var(--accent-cyan-border)',
          boxShadow: 'var(--shadow-sheet)',
          padding: '14px 20px max(18px, env(safe-area-inset-bottom))',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {/* Sheet Handle */}
        <div
          aria-hidden="true"
          style={{
            width: '40px',
            height: '4px',
            borderRadius: '999px',
            background: 'var(--border-strong)',
            alignSelf: 'center',
            flexShrink: 0,
          }}
        />

        {/* Compact Status Pill */}
        <div
          className="tabular-nums"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            alignSelf: 'flex-start',
            padding: '6px 14px',
            borderRadius: '999px',
            background: statusBg,
            border: `1px solid ${statusBorder}`,
            color: statusColor,
            fontSize: '0.9rem',
            fontWeight: 700,
          }}
        >
          <span>{statusLabel}</span>
        </div>

        {/* Single Concise Explanation */}
        <p
          style={{
            margin: 0,
            fontSize: '0.95rem',
            lineHeight: 1.55,
            color: 'var(--ink-primary)',
          }}
        >
          {singleExplanation}
        </p>

        <ConceptInfographic question={question} compact />

        <button
          type="button"
          className="tactile-btn btn-primary"
          style={{ width: '100%', marginTop: '2px', flexShrink: 0 }}
          onClick={onNext}
        >
          <span>{isFinalQuestion ? 'View Domain Receipt' : 'Next'}</span>
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
