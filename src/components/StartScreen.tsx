import { BarChart2, RotateCcw, Shuffle, Target, Trophy } from 'lucide-react';
import type { Domain, PlayerProfile, RunMode } from '../types/quiz';
import { DOMAIN_LABELS, DOMAIN_ORDER } from './domainMeta';

interface StartScreenProps {
  profile: PlayerProfile;
  onStartRun: (mode: RunMode) => void;
  onViewSummary: () => void;
  onResetProfile: () => void;
}

export function StartScreen({
  profile,
  onStartRun,
  onViewSummary,
  onResetProfile,
}: StartScreenProps) {
  return (
    <section
      className="fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
        paddingTop: '8px',
        paddingBottom: '12px',
      }}
    >
      {/* Masthead */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.65rem',
              fontWeight: 700,
              lineHeight: 1.08,
              margin: 0,
              color: '#FFFFFF',
            }}
          >
            Praxis 5581
          </h1>
          <p
            style={{
              margin: '4px 0 0',
              fontSize: '0.84rem',
              color: '#FFFFFF',
              fontWeight: 600,
            }}
          >
            10 questions · 9 main + 1 final wager
          </p>
        </div>

        {/* Best Score / Runs */}
        <div style={{ textAlign: 'right' }}>
          <div
            className="tabular-nums"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '5px',
              fontSize: '0.92rem',
              fontWeight: 700,
              color: '#FFFFFF',
            }}
          >
            <Trophy size={14} color="#FFFFFF" aria-hidden="true" />
            <span>{profile.bestScore}</span>
          </div>
          <div
            className="tabular-nums"
            style={{ fontSize: '0.72rem', color: '#FFFFFF', fontWeight: 600 }}
          >
            {profile.totalRuns} {profile.totalRuns === 1 ? 'run' : 'runs'}
          </div>
        </div>
      </header>

      {/* Main Practice Modes */}
      <div className="md3-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button
          type="button"
          className="tactile-btn btn-primary"
          style={{
            width: '100%',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '2px',
            padding: '12px 16px',
            textAlign: 'left',
          }}
          onClick={() => onStartRun('random')}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: 700 }}>
            <Shuffle size={17} aria-hidden="true" />
            <span>Random questions</span>
          </span>
          <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>
            Topic mix matches the real exam
          </span>
        </button>

        <button
          type="button"
          className="tactile-btn btn-tonal"
          style={{
            width: '100%',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '2px',
            padding: '12px 16px',
            textAlign: 'left',
          }}
          onClick={() => onStartRun('adaptive')}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: 700 }}>
            <Target size={17} aria-hidden="true" />
            <span>Adaptive questions</span>
          </span>
          <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>
            Focuses more on your weaker topics
          </span>
        </button>
      </div>

      {/* Topic-specific */}
      <div className="md3-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h2
          style={{
            margin: 0,
            fontSize: '0.84rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: '#FFFFFF',
          }}
        >
          Topic-specific
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {DOMAIN_ORDER.map((domain: Domain) => {
            const stat = profile.domainStats[domain];
            const pctNum =
              stat && stat.answered > 0 ? Math.round((stat.correct / stat.answered) * 100) : null;
            const pct = pctNum !== null ? `${pctNum}%` : '—';

            return (
              <button
                key={domain}
                type="button"
                className="tactile-btn"
                onClick={() => onStartRun({ kind: 'domain', domain })}
                aria-label={`Start ${DOMAIN_LABELS[domain].full} questions (accuracy ${pct})`}
                style={{
                  width: '100%',
                  minHeight: '46px',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '4px',
                  background: '#000000',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: '#FFFFFF',
                  fontSize: '0.92rem',
                  fontWeight: 600,
                }}
              >
                <span>{DOMAIN_LABELS[domain].full}</span>
                <span
                  className="tabular-nums"
                  style={{
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    color:
                      pctNum !== null && pctNum >= 70
                        ? 'var(--accent-emerald)'
                        : '#FFFFFF',
                  }}
                >
                  {pct}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Leaderboard & Reset */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <button
          type="button"
          className="tactile-btn btn-tonal"
          style={{ flex: 1 }}
          onClick={onViewSummary}
        >
          <BarChart2 size={18} aria-hidden="true" />
          <span>Leaderboard</span>
        </button>

        {profile.totalRuns > 0 && (
          <button
            type="button"
            className="tactile-btn"
            onClick={onResetProfile}
            aria-label="Reset saved stats"
            title="Reset saved stats"
            style={{
              minHeight: '48px',
              width: '48px',
              padding: 0,
              borderRadius: '4px',
              background: '#000000',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              color: '#FFFFFF',
              flexShrink: 0,
            }}
          >
            <RotateCcw size={17} aria-hidden="true" />
          </button>
        )}
      </div>
    </section>
  );
}
