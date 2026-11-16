import { useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Coins,
  Globe,
  Home,
  Landmark,
  Map as MapIcon,
  Play,
  ScrollText,
  Sparkles,
} from 'lucide-react';
import type { Domain, PlayerProfile, RunHistoryEntry, RunState } from '../types/quiz';
import { DOMAIN_LABELS, DOMAIN_ORDER } from './domainMeta';

interface DomainReceiptProps {
  run: RunState | null;
  profile: PlayerProfile;
  isNewBest: boolean;
  onNewAdaptiveSprint: () => void;
  onGoHome: () => void;
}

const DOMAIN_ICONS: Record<Domain, typeof Landmark> = {
  US: ScrollText,
  World: Globe,
  Civics: Landmark,
  Geo: MapIcon,
  Econ: Coins,
};

const DOMAIN_LINE_COLORS: Record<Domain, string> = {
  US: '#38BDF8',
  World: '#F59E0B',
  Civics: '#C084FC',
  Geo: '#39FF88',
  Econ: '#FB7185',
};

function TogglePills<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { id: T; label: string }[];
  onChange: (next: T) => void;
}) {
  return (
    <div
      style={{
        display: 'inline-flex',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '4px',
        overflow: 'hidden',
      }}
    >
      {options.map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            aria-pressed={active}
            style={{
              padding: '4px 10px',
              border: 'none',
              background: active ? '#FFFFFF' : '#000000',
              color: active ? '#000000' : '#FFFFFF',
              fontFamily: 'inherit',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function DomainReceipt({
  run,
  profile,
  isNewBest,
  onNewAdaptiveSprint,
  onGoHome,
}: DomainReceiptProps) {
  const [leaderboardView, setLeaderboardView] = useState<'table' | 'chart'>('table');
  const [masteryView, setMasteryView] = useState<'all' | 'overTime'>('all');
  const [trapsOpen, setTrapsOpen] = useState(false);

  const runHistory: RunHistoryEntry[] = profile.runHistory ?? [];
  const totalAnswered = run ? run.results.length : 0;
  const totalCorrect = run ? run.results.filter((r) => r.isCorrect).length : 0;

  const trapItems = useMemo(() => {
    if (!run) return [];
    return run.results
      .filter((r) => !r.isCorrect)
      .map((res) => {
        const q = run.questions.find((item) => item.id === res.questionId);
        if (!q) return null;
        const targetedNote =
          typeof res.selected === 'string' && q.trap_notes[res.selected]
            ? q.trap_notes[res.selected]
            : q.trap_notes.default;
        return { res, q, targetedNote };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [run]);

  // Top scores sorted descending by score, then newest
  const topScores = useMemo(() => {
    return [...runHistory]
      .sort((a, b) => b.score - a.score || b.completedAt - a.completedAt)
      .slice(0, 10);
  }, [runHistory]);

  // Cumulative sum of points per dateKey
  const cumulativeByDate = useMemo(() => {
    const byDate = new Map<string, number>();
    const sorted = [...runHistory].sort((a, b) => a.dateKey.localeCompare(b.dateKey));
    for (const entry of sorted) {
      byDate.set(entry.dateKey, (byDate.get(entry.dateKey) ?? 0) + entry.score);
    }
    let running = 0;
    const points: { dateKey: string; cumulative: number }[] = [];
    for (const [dateKey, daySum] of byDate.entries()) {
      running += daySum;
      points.push({ dateKey, cumulative: running });
    }
    return points;
  }, [runHistory]);

  // Chronological runs for Mastery Over Time
  const chronologicalRuns = useMemo(() => {
    return [...runHistory].sort((a, b) => a.completedAt - b.completedAt);
  }, [runHistory]);

  if (!run && profile.totalRuns === 0 && runHistory.length === 0) {
    return (
      <section
        className="fade-in"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          paddingTop: '12px',
          paddingBottom: '16px',
        }}
      >
        <div
          className="md3-card"
          style={{
            padding: '18px',
            borderRadius: '6px',
            border: '1px solid rgba(255, 255, 255, 0.22)',
            background: '#000000',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <h1
            style={{
              margin: 0,
              fontFamily: 'var(--font-display)',
              fontSize: '1.3rem',
              fontWeight: 700,
              color: '#FFFFFF',
            }}
          >
            Leaderboard
          </h1>
          <p style={{ margin: 0, fontSize: '0.94rem', color: '#FFFFFF' }}>
            No completed runs yet
          </p>
        </div>

        <button
          type="button"
          className="tactile-btn btn-primary"
          style={{ width: '100%' }}
          onClick={onGoHome}
        >
          <Home size={18} aria-hidden="true" />
          <span>Back</span>
        </button>
      </section>
    );
  }

  return (
    <section
      className="fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        paddingBottom: '16px',
      }}
    >
      {/* Header: Score + Accuracy */}
      <div className="md3-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '10px',
          }}
        >
          <div>
            <span
              style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: '#FFFFFF',
              }}
            >
              {run ? 'Sprint Summary' : 'All-Time Summary'}
            </span>
            <h1
              className="tabular-nums"
              style={{
                margin: '4px 0 0',
                fontFamily: 'var(--font-display)',
                fontSize: '2.1rem',
                fontWeight: 700,
                lineHeight: 1.05,
                color: '#FFFFFF',
              }}
            >
              {run ? run.score : profile.bestScore}{' '}
              <span style={{ fontSize: '0.95rem', fontWeight: 500, color: '#FFFFFF' }}>
                {run ? 'pts' : 'best pts'}
              </span>
            </h1>
          </div>

          {run && isNewBest && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: '999px',
                background: 'var(--accent-emerald-soft)',
                border: '1px solid var(--accent-emerald)',
                color: 'var(--accent-emerald)',
                fontSize: '0.76rem',
                fontWeight: 700,
              }}
            >
              <Sparkles size={13} color="var(--accent-emerald)" aria-hidden="true" />
              NEW BEST
            </span>
          )}
        </div>

        <div
          className="tabular-nums"
          style={{
            padding: '10px 12px',
            borderRadius: '4px',
            border: '1px solid rgba(255, 255, 255, 0.22)',
            background: '#000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#FFFFFF' }}>
            {run ? 'ACCURACY' : 'TOTAL RUNS'}
          </span>
          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF' }}>
            {run ? `${totalCorrect} / ${totalAnswered}` : profile.totalRuns}
          </span>
        </div>
      </div>

      {/* Section 1: Leaderboard ([Table | Chart]) */}
      <div className="md3-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
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
            Leaderboard
          </h2>
          <TogglePills
            value={leaderboardView}
            options={[
              { id: 'table', label: 'Table' },
              { id: 'chart', label: 'Chart' },
            ]}
            onChange={setLeaderboardView}
          />
        </div>

        {leaderboardView === 'table' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {topScores.length === 0 ? (
              <div style={{ fontSize: '0.86rem', color: '#FFFFFF' }}>No runs recorded yet.</div>
            ) : (
              topScores.map((entry, idx) => {
                const isHighlighted = run ? entry.runId === run.runId : idx === 0;
                return (
                  <div
                    key={entry.runId}
                    className="tabular-nums"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: '4px',
                      border: isHighlighted
                        ? '1px solid var(--accent-emerald)'
                        : '1px solid rgba(255, 255, 255, 0.22)',
                      background: isHighlighted ? 'var(--accent-emerald-soft)' : '#000000',
                      color: isHighlighted ? 'var(--accent-emerald)' : '#FFFFFF',
                      fontSize: '0.86rem',
                      fontWeight: isHighlighted ? 700 : 600,
                    }}
                  >
                    <span>
                      #{idx + 1} · {entry.score} pts
                    </span>
                    <span>{entry.dateKey}</span>
                  </div>
                );
              })
            )}
          </div>
        )}

        {leaderboardView === 'chart' && (
          <div
            style={{
              border: '1px solid rgba(255, 255, 255, 0.22)',
              borderRadius: '4px',
              background: '#000000',
              padding: '6px',
            }}
          >
            {cumulativeByDate.length === 0 ? (
              <div style={{ padding: '12px', fontSize: '0.86rem', color: '#FFFFFF' }}>
                No runs recorded yet.
              </div>
            ) : (
              (() => {
                const padL = 38;
                const padR = 16;
                const padT = 14;
                const padB = 24;
                const w = 358;
                const h = 140;
                const plotW = w - padL - padR;
                const plotH = h - padT - padB;
                const maxVal = Math.max(1, ...cumulativeByDate.map((p) => p.cumulative));

                const coords = cumulativeByDate.map((pt, i) => {
                  const x =
                    cumulativeByDate.length === 1
                      ? padL + plotW / 2
                      : padL + (i / (cumulativeByDate.length - 1)) * plotW;
                  const y = padT + plotH - (pt.cumulative / maxVal) * plotH;
                  return { x, y, ...pt };
                });

                const polyPoints = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
                const firstDate = cumulativeByDate[0].dateKey;
                const lastDate = cumulativeByDate[cumulativeByDate.length - 1].dateKey;

                return (
                  <svg
                    viewBox={`0 0 ${w} ${h}`}
                    width="100%"
                    role="img"
                    aria-label="Cumulative points by date"
                    style={{ display: 'block' }}
                  >
                    {/* Axes */}
                    <line
                      x1={padL}
                      y1={padT}
                      x2={padL}
                      y2={padT + plotH}
                      stroke="rgba(255, 255, 255, 0.35)"
                      strokeWidth={1}
                    />
                    <line
                      x1={padL}
                      y1={padT + plotH}
                      x2={padL + plotW}
                      y2={padT + plotH}
                      stroke="rgba(255, 255, 255, 0.35)"
                      strokeWidth={1}
                    />

                    {/* Y-axis ticks */}
                    <text
                      x={padL - 6}
                      y={padT + 4}
                      textAnchor="end"
                      fill="#FFFFFF"
                      fontSize="9"
                      fontFamily="monospace"
                    >
                      {maxVal}
                    </text>
                    <text
                      x={padL - 6}
                      y={padT + plotH}
                      textAnchor="end"
                      fill="#FFFFFF"
                      fontSize="9"
                      fontFamily="monospace"
                    >
                      0
                    </text>

                    {/* X-axis date ticks */}
                    <text
                      x={padL}
                      y={h - 6}
                      textAnchor="start"
                      fill="#FFFFFF"
                      fontSize="9"
                      fontFamily="monospace"
                    >
                      {firstDate}
                    </text>
                    {cumulativeByDate.length > 1 && (
                      <text
                        x={padL + plotW}
                        y={h - 6}
                        textAnchor="end"
                        fill="#FFFFFF"
                        fontSize="9"
                        fontFamily="monospace"
                      >
                        {lastDate}
                      </text>
                    )}

                    {/* Line + Points */}
                    {coords.length > 1 && (
                      <polyline
                        fill="none"
                        stroke="#FFFFFF"
                        strokeWidth={2}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        points={polyPoints}
                      />
                    )}
                    {coords.map((c) => (
                      <circle key={c.dateKey} cx={c.x} cy={c.y} r={3.5} fill="#39FF88" />
                    ))}
                  </svg>
                );
              })()
            )}
          </div>
        )}
      </div>

      {/* Section 2: Topic Mastery ([All-Time | Over Time]) */}
      <div className="md3-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
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
            Topic Mastery
          </h2>
          <TogglePills
            value={masteryView}
            options={[
              { id: 'all', label: 'All-Time' },
              { id: 'overTime', label: 'Over Time' },
            ]}
            onChange={setMasteryView}
          />
        </div>

        {masteryView === 'all' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {DOMAIN_ORDER.map((domain) => {
              const Icon = DOMAIN_ICONS[domain];
              const stat = profile.domainStats[domain];
              const pct =
                stat && stat.answered > 0 ? Math.round((stat.correct / stat.answered) * 100) : 0;

              return (
                <div key={domain} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.86rem',
                      fontWeight: 600,
                      color: '#FFFFFF',
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
                      <Icon size={15} color="#FFFFFF" aria-hidden="true" />
                      <span>{DOMAIN_LABELS[domain].full}</span>
                    </span>
                    <span className="tabular-nums" style={{ color: '#FFFFFF' }}>
                      {stat.answered > 0 ? `${stat.correct}/${stat.answered} (${pct}%)` : '—'}
                    </span>
                  </div>
                  <div
                    style={{
                      height: '8px',
                      borderRadius: '999px',
                      border: '1px solid rgba(255, 255, 255, 0.22)',
                      background: '#000000',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        borderRadius: '999px',
                        background:
                          pct >= 70 ? 'var(--accent-emerald)' : '#FFFFFF',
                        transition: 'width 350ms ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {masteryView === 'overTime' && (
          <div
            style={{
              border: '1px solid rgba(255, 255, 255, 0.22)',
              borderRadius: '4px',
              background: '#000000',
              padding: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {/* Compact Legend */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px',
                fontSize: '0.72rem',
                color: '#FFFFFF',
              }}
            >
              {DOMAIN_ORDER.map((domain) => {
                const color = DOMAIN_LINE_COLORS[domain];
                return (
                  <span
                    key={domain}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                  >
                    <svg width="18" height="6" aria-hidden="true">
                      <line
                        x1="0"
                        y1="3"
                        x2="18"
                        y2="3"
                        stroke={color}
                        strokeWidth="2"
                      />
                    </svg>
                    <span>{DOMAIN_LABELS[domain].short}</span>
                  </span>
                );
              })}
            </div>

            {chronologicalRuns.length === 0 ? (
              <div style={{ padding: '12px', fontSize: '0.86rem', color: '#FFFFFF' }}>
                No runs recorded yet.
              </div>
            ) : (
              (() => {
                const padL = 36;
                const padR = 14;
                const padT = 12;
                const padB = 24;
                const w = 358;
                const h = 160;
                const plotW = w - padL - padR;
                const plotH = h - padT - padB;
                const n = chronologicalRuns.length;

                const xForIdx = (i: number) =>
                  n === 1 ? padL + plotW / 2 : padL + (i / (n - 1)) * plotW;
                const yForPct = (pct: number) => padT + plotH - (pct / 100) * plotH;

                return (
                  <svg
                    viewBox={`0 0 ${w} ${h}`}
                    width="100%"
                    role="img"
                    aria-label="Topic accuracy over time"
                    style={{ display: 'block' }}
                  >
                    {/* Horizontal 50% gridline */}
                    <line
                      x1={padL}
                      y1={yForPct(50)}
                      x2={padL + plotW}
                      y2={yForPct(50)}
                      stroke="rgba(255, 255, 255, 0.16)"
                      strokeDasharray="3 3"
                      strokeWidth={1}
                    />
                    {/* Axes */}
                    <line
                      x1={padL}
                      y1={padT}
                      x2={padL}
                      y2={padT + plotH}
                      stroke="rgba(255, 255, 255, 0.35)"
                      strokeWidth={1}
                    />
                    <line
                      x1={padL}
                      y1={padT + plotH}
                      x2={padL + plotW}
                      y2={padT + plotH}
                      stroke="rgba(255, 255, 255, 0.35)"
                      strokeWidth={1}
                    />

                    {/* Y-axis labels */}
                    {[100, 50, 0].map((val) => (
                      <text
                        key={val}
                        x={padL - 5}
                        y={yForPct(val) + 3}
                        textAnchor="end"
                        fill="#FFFFFF"
                        fontSize="9"
                        fontFamily="monospace"
                      >
                        {val}%
                      </text>
                    ))}

                    {/* X-axis labels */}
                    <text
                      x={padL}
                      y={h - 6}
                      textAnchor="start"
                      fill="#FFFFFF"
                      fontSize="9"
                      fontFamily="monospace"
                    >
                      Run 1
                    </text>
                    {n > 1 && (
                      <text
                        x={padL + plotW}
                        y={h - 6}
                        textAnchor="end"
                        fill="#FFFFFF"
                        fontSize="9"
                        fontFamily="monospace"
                      >
                        Run {n}
                      </text>
                    )}

                    {/* Topic lines */}
                    {DOMAIN_ORDER.map((domain) => {
                      const color = DOMAIN_LINE_COLORS[domain];
                      const pts = chronologicalRuns
                        .map((entry, idx) => {
                          const acc = entry.domainAccuracy?.[domain];
                          if (typeof acc !== 'number') return null;
                          return { x: xForIdx(idx), y: yForPct(acc) };
                        })
                        .filter((p): p is { x: number; y: number } => p !== null);

                      if (pts.length === 0) return null;

                      return (
                        <g key={domain}>
                          {pts.length > 1 && (
                            <polyline
                              fill="none"
                              stroke={color}
                              strokeWidth={2}
                              strokeLinejoin="round"
                              strokeLinecap="round"
                              points={pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}
                            />
                          )}
                          {pts.map((p, pIdx) => (
                            <circle key={pIdx} cx={p.x} cy={p.y} r={2.5} fill={color} />
                          ))}
                        </g>
                      );
                    })}
                  </svg>
                );
              })()
            )}
          </div>
        )}
      </div>

      {/* Section 3: Confidence Calibration (Horizontal Dumbbell SVG) */}
      <div className="md3-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
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
            Confidence Calibration
          </h2>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', fontSize: '0.72rem', color: '#FFFFFF' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ color: '#39FF88' }}>●</span> Accuracy
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span>○</span> Confidence
            </span>
          </div>
        </div>

        <div
          style={{
            border: '1px solid rgba(255, 255, 255, 0.22)',
            borderRadius: '4px',
            background: '#000000',
            padding: '6px',
          }}
        >
          {(() => {
            const w = 358;
            const h = 175;
            const padL = 56;
            const padR = 18;
            const padT = 14;
            const padB = 24;
            const plotW = w - padL - padR;
            const plotH = h - padT - padB;
            const rowStep = plotH / DOMAIN_ORDER.length;
            const xForPct = (pct: number) => padL + (pct / 100) * plotW;

            return (
              <svg
                viewBox={`0 0 ${w} ${h}`}
                width="100%"
                role="img"
                aria-label="Confidence calibration dumbbell chart comparing accuracy and confidence per topic"
                style={{ display: 'block' }}
              >
                {/* Vertical reference lines 0%, 50%, 100% */}
                {[0, 50, 100].map((val) => (
                  <g key={val}>
                    <line
                      x1={xForPct(val)}
                      y1={padT}
                      x2={xForPct(val)}
                      y2={padT + plotH}
                      stroke="rgba(255, 255, 255, 0.16)"
                      strokeDasharray={val === 50 ? '3 3' : undefined}
                      strokeWidth={1}
                    />
                    <text
                      x={xForPct(val)}
                      y={h - 6}
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="9"
                      fontFamily="monospace"
                    >
                      {val}%
                    </text>
                  </g>
                ))}

                {DOMAIN_ORDER.map((domain, idx) => {
                  const y = padT + rowStep * idx + rowStep / 2;
                  const stat = profile.domainStats[domain];
                  const cal = profile.calibrationStats?.[domain];

                  const accPct =
                    stat && stat.answered > 0
                      ? Math.round((stat.correct / stat.answered) * 100)
                      : null;
                  const confPct =
                    cal && cal.wagersPlaced > 0
                      ? Math.round((cal.totalConfidenceRatio / cal.wagersPlaced) * 100)
                      : null;

                  return (
                    <g key={domain}>
                      {/* Topic Label */}
                      <text
                        x={padL - 8}
                        y={y + 3}
                        textAnchor="end"
                        fill="#FFFFFF"
                        fontSize="10"
                        fontWeight="700"
                        fontFamily="sans-serif"
                      >
                        {DOMAIN_LABELS[domain].short}
                      </text>

                      {/* Horizontal track */}
                      <line
                        x1={padL}
                        y1={y}
                        x2={padL + plotW}
                        y2={y}
                        stroke="rgba(255, 255, 255, 0.2)"
                        strokeWidth={1}
                      />

                      {/* Connecting dumbbell segment */}
                      {accPct !== null && confPct !== null && (
                        <line
                          x1={xForPct(accPct)}
                          y1={y}
                          x2={xForPct(confPct)}
                          y2={y}
                          stroke="#FFFFFF"
                          strokeWidth={1.8}
                        />
                      )}

                      {/* Accuracy dot (solid green) */}
                      {accPct !== null && (
                        <circle cx={xForPct(accPct)} cy={y} r={5} fill="#39FF88" />
                      )}

                      {/* Confidence ring (hollow white) */}
                      {confPct !== null && (
                        <circle
                          cx={xForPct(confPct)}
                          cy={y}
                          r={5}
                          fill="#000000"
                          stroke="#FFFFFF"
                          strokeWidth={2}
                        />
                      )}

                      {accPct === null && confPct === null && (
                        <text
                          x={padL + plotW}
                          y={y + 3}
                          textAnchor="end"
                          fill="#FFFFFF"
                          fontSize="10"
                        >
                          —
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            );
          })()}
        </div>
      </div>

      {/* Section 4: Review (N) */}
      {trapItems.length > 0 && (
        <div
          className="md3-card"
          style={{
            padding: '14px 18px',
            border: '1px solid rgba(255, 255, 255, 0.22)',
            borderRadius: '6px',
            background: '#000000',
          }}
        >
          <button
            type="button"
            aria-expanded={trapsOpen}
            onClick={() => setTrapsOpen((prev) => !prev)}
            style={{
              width: '100%',
              minHeight: '44px',
              border: 'none',
              background: 'transparent',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontFamily: 'inherit',
              fontSize: '0.96rem',
              fontWeight: 700,
              color: '#FFFFFF',
              cursor: 'pointer',
            }}
          >
            <span>Review ({trapItems.length})</span>
            {trapsOpen ? <ChevronUp size={19} /> : <ChevronDown size={19} />}
          </button>

          {trapsOpen && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                marginTop: '12px',
                paddingTop: '12px',
                borderTop: '1px solid rgba(255, 255, 255, 0.22)',
              }}
            >
              {trapItems.map(({ q, targetedNote }) => (
                <div
                  key={q.id}
                  style={{
                    padding: '12px',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.22)',
                    background: '#000000',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#FFFFFF' }}>
                    {DOMAIN_LABELS[q.domain].short} • {q.subdomain}
                  </div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#FFFFFF' }}>
                    {q.prompt}
                  </div>
                  <div style={{ fontSize: '0.86rem', color: '#FFFFFF' }}>
                    <strong>Core Link:</strong> {q.explanation}
                  </div>
                  {targetedNote && (
                    <div style={{ fontSize: '0.84rem', color: '#FFFFFF' }}>
                      <strong>Quick Distinction:</strong> {targetedNote}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '2px' }}>
        <button
          type="button"
          className="tactile-btn btn-primary"
          style={{ width: '100%' }}
          onClick={onNewAdaptiveSprint}
        >
          <Play size={18} fill="currentColor" aria-hidden="true" />
          <span>Play Again</span>
        </button>

        <button
          type="button"
          className="tactile-btn btn-tonal"
          style={{ width: '100%' }}
          onClick={onGoHome}
        >
          <Home size={18} aria-hidden="true" />
          <span>Home</span>
        </button>
      </div>
    </section>
  );
}
