import type { Question } from '../types/quiz';

export type InfographicKind =
  | 'fiscal_monetary'
  | 'dtm'
  | 'checks_balances'
  | 'supply_demand'
  | 'trade_route'
  | 'spatial_scale'
  | 'causal_timeline';

interface ConceptInfographicProps {
  question: Question;
  compact?: boolean;
}

export function resolveInfographicKind(question: Question): InfographicKind | null {
  const sub = question.subdomain.toLowerCase();

  if (
    sub.includes('monetary') ||
    sub.includes('macroeconomic') ||
    sub.includes('new deal') ||
    question.trap_type === 'policy_lever_swap'
  ) {
    return 'fiscal_monetary';
  }

  if (sub.includes('demographic transition')) {
    return 'dtm';
  }

  if (
    sub.includes('separation of powers') ||
    sub.includes('checks & balances') ||
    sub.includes('constitutional compromises') ||
    question.trap_type === 'jurisdiction_swap'
  ) {
    return 'checks_balances';
  }

  if (
    sub.includes('supply, demand') ||
    sub.includes('tariffs') ||
    sub.includes('comparative advantage') ||
    sub.includes('market structures')
  ) {
    return 'supply_demand';
  }

  if (
    sub.includes('indian ocean') ||
    sub.includes('chokepoint') ||
    sub.includes('rain shadow') ||
    sub.includes('migration')
  ) {
    return 'trade_route';
  }

  if (
    sub.includes('map projection') ||
    sub.includes('site vs. situation') ||
    question.trap_type === 'scale_confusion'
  ) {
    return 'spatial_scale';
  }

  if (
    question.type === 'ordering' ||
    question.skill_tag === 'chronology' ||
    question.skill_tag === 'causation'
  ) {
    return 'causal_timeline';
  }

  return null;
}

const TITLES: Record<InfographicKind, string> = {
  fiscal_monetary: 'Fiscal vs. Monetary',
  dtm: 'Demographic Transition',
  checks_balances: 'Three Branches',
  supply_demand: 'Supply & Demand',
  trade_route: 'Corridor & Gate',
  spatial_scale: 'Spatial Scale',
  causal_timeline: 'Causal Pulse',
};

export function ConceptInfographic({ question, compact = false }: ConceptInfographicProps) {
  const kind = resolveInfographicKind(question);
  if (!kind) return null;

  const linearNodes =
    kind === 'trade_route'
      ? [
          { label: 'Origin', stroke: '#00E5FF' },
          { label: 'Chokepoint', stroke: '#FFB000' },
          { label: 'Market', stroke: '#00E5FF' },
        ]
      : [
          { label: '1. Trigger', stroke: '#00E5FF' },
          { label: '2. Shift', stroke: '#FFB000' },
          { label: '3. Outcome', stroke: '#00E5FF' },
        ];

  return (
    <figure
      style={{
        margin: 0,
        padding: compact ? '8px 10px' : '10px 12px',
        borderRadius: '16px',
        background: 'rgba(9, 16, 28, 0.72)',
      }}
    >
      <figcaption
        style={{
          fontSize: '0.72rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--ink-muted)',
          marginBottom: '6px',
        }}
      >
        {TITLES[kind]}
      </figcaption>

      {/* Schema 1: LINEAR_PULSE */}
      {(kind === 'causal_timeline' || kind === 'trade_route') && (
        <svg viewBox="0 0 358 184" width="100%" role="img" aria-label={TITLES[kind]}>
          {linearNodes.map((node, idx) => {
            const y = 8 + idx * 66;
            const arrowTop = y + 44; // 8px outside 36px pill bottom
            const arrowBottom = arrowTop + 14; // 8px outside next pill top (20px gap)
            return (
              <g key={node.label}>
                <rect
                  x="101"
                  y={y}
                  width="156"
                  height="36"
                  rx="18"
                  fill="#0D1524"
                  stroke={node.stroke}
                  strokeWidth="1.5"
                />
                <text
                  x="179"
                  y={y + 22}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="700"
                  fill="#EEF4FF"
                >
                  {node.label}
                </text>
                {idx < linearNodes.length - 1 && (
                  <g>
                    <line
                      x1="179"
                      y1={arrowTop}
                      x2="179"
                      y2={arrowBottom}
                      stroke="#334155"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                    <polygon
                      points={`179,${arrowBottom + 3} 174,${arrowBottom - 4} 184,${arrowBottom - 4}`}
                      fill="#FFB000"
                    />
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      )}

      {/* Schema 2: TRIAD_CYCLE (3 single-word pills + curved outer arcs with 48px label gaps) */}
      {kind === 'checks_balances' && (
        <svg viewBox="0 0 358 206" width="100%" role="img" aria-label="Three Branches Mutual Checks">
          {/* Left curved arc (Congress <-> President) broken by 48px gap around y=104 */}
          <path
            d="M 116 36 Q 76 52 66 80"
            fill="none"
            stroke="#334155"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M 66 128 Q 70 144 76 154"
            fill="none"
            stroke="#334155"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <text x="66" y="108" textAnchor="middle" fontSize="11" fontWeight="700" fill="#FFB000">
            Veto
          </text>

          {/* Right curved arc (Congress <-> Courts) broken by 48px gap around y=104 */}
          <path
            d="M 242 36 Q 282 52 292 80"
            fill="none"
            stroke="#334155"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M 292 128 Q 288 144 282 154"
            fill="none"
            stroke="#334155"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <text x="292" y="108" textAnchor="middle" fontSize="11" fontWeight="700" fill="#00E5FF">
            Reviews
          </text>

          {/* Bottom curved arc (President <-> Courts) broken by 48px gap around x=179 */}
          <path
            d="M 136 184 Q 146 188 155 188"
            fill="none"
            stroke="#334155"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M 203 188 Q 212 188 222 184"
            fill="none"
            stroke="#334155"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <text x="179" y="191" textAnchor="middle" fontSize="11" fontWeight="700" fill="#FFB000">
            Appoints
          </text>

          {/* Top Pill: Congress */}
          <rect x="123" y="12" width="112" height="34" rx="17" fill="#0D1524" stroke="#00E5FF" strokeWidth="1.5" />
          <text x="179" y="33" textAnchor="middle" fontSize="12" fontWeight="700" fill="#EEF4FF">
            Congress
          </text>

          {/* Bottom Left Pill: President */}
          <rect x="22" y="158" width="112" height="34" rx="17" fill="#0D1524" stroke="#FFB000" strokeWidth="1.5" />
          <text x="78" y="179" textAnchor="middle" fontSize="12" fontWeight="700" fill="#EEF4FF">
            President
          </text>

          {/* Bottom Right Pill: Courts */}
          <rect x="224" y="158" width="112" height="34" rx="17" fill="#0D1524" stroke="#00E5FF" strokeWidth="1.5" />
          <text x="280" y="179" textAnchor="middle" fontSize="12" fontWeight="700" fill="#EEF4FF">
            Courts
          </text>
        </svg>
      )}

      {/* Schema 3: SPLIT_MATRIX (2 header pills + unboxed rows + broken center vs spine) */}
      {kind === 'fiscal_monetary' && (
        <svg viewBox="0 0 358 148" width="100%" role="img" aria-label="Fiscal versus Monetary Policy">
          {/* Left Header Pill */}
          <rect x="24" y="10" width="136" height="32" rx="16" fill="#0D1524" stroke="#00E5FF" strokeWidth="1.5" />
          <text x="92" y="30" textAnchor="middle" fontSize="12" fontWeight="700" fill="#00E5FF">
            Fiscal
          </text>

          {/* Right Header Pill */}
          <rect x="198" y="10" width="136" height="32" rx="16" fill="#0D1524" stroke="#FFB000" strokeWidth="1.5" />
          <text x="266" y="30" textAnchor="middle" fontSize="12" fontWeight="700" fill="#FFB000">
            Monetary
          </text>

          {/* Broken center vs spine */}
          <line x1="179" y1="50" x2="179" y2="76" stroke="#334155" strokeWidth="1.5" />
          <text x="179" y="96" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#8CA0BC">
            vs
          </text>
          <line x1="179" y1="108" x2="179" y2="134" stroke="#334155" strokeWidth="1.5" />

          {/* Unboxed Rows */}
          <text x="92" y="68" textAnchor="middle" fontSize="12" fontWeight="600" fill="#EEF4FF">
            Congress
          </text>
          <text x="266" y="68" textAnchor="middle" fontSize="12" fontWeight="600" fill="#EEF4FF">
            Fed Reserve
          </text>

          <text x="92" y="98" textAnchor="middle" fontSize="12" fontWeight="600" fill="#C5D4EB">
            Taxes
          </text>
          <text x="266" y="98" textAnchor="middle" fontSize="12" fontWeight="600" fill="#C5D4EB">
            Rates
          </text>

          <text x="92" y="128" textAnchor="middle" fontSize="12" fontWeight="600" fill="#C5D4EB">
            Spending
          </text>
          <text x="266" y="128" textAnchor="middle" fontSize="12" fontWeight="600" fill="#C5D4EB">
            Reserves
          </text>
        </svg>
      )}

      {/* Schema 4: AXIS_VECTOR (Clean L-axis + max 2 curves + open-quadrant dot callout) */}
      {kind === 'supply_demand' && (
        <svg viewBox="0 0 358 206" width="100%" role="img" aria-label="Supply and Demand Equilibrium">
          <line x1="52" y1="28" x2="52" y2="180" stroke="#334155" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="52" y1="180" x2="326" y2="180" stroke="#334155" strokeWidth="1.8" strokeLinecap="round" />

          <text x="52" y="18" textAnchor="middle" fontSize="11" fontWeight="700" fill="#8CA0BC">Price</text>
          <text x="326" y="198" textAnchor="end" fontSize="11" fontWeight="700" fill="#8CA0BC">Qty</text>

          {/* Demand & Supply */}
          <line x1="72" y1="48" x2="284" y2="158" stroke="#00E5FF" strokeWidth="2.4" strokeLinecap="round" />
          <line x1="72" y1="158" x2="284" y2="48" stroke="#FFB000" strokeWidth="2.4" strokeLinecap="round" />

          <text x="292" y="162" textAnchor="start" fontSize="11.5" fontWeight="700" fill="#00E5FF">Demand</text>
          <text x="292" y="52" textAnchor="start" fontSize="11.5" fontWeight="700" fill="#FFB000">Supply</text>

          {/* Equilibrium dot callout */}
          <circle cx="178" cy="103" r="5" fill="#FFB000" stroke="#0D1524" strokeWidth="1.5" />
          <text x="178" y="88" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#EEF4FF">Eq.</text>
        </svg>
      )}

      {kind === 'dtm' && (
        <svg viewBox="0 0 358 206" width="100%" role="img" aria-label="Demographic Transition Model">
          <line x1="52" y1="28" x2="52" y2="180" stroke="#334155" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="52" y1="180" x2="326" y2="180" stroke="#334155" strokeWidth="1.8" strokeLinecap="round" />

          <text x="52" y="18" textAnchor="middle" fontSize="11" fontWeight="700" fill="#8CA0BC">Rate</text>
          <text x="326" y="198" textAnchor="end" fontSize="11" fontWeight="700" fill="#8CA0BC">Time</text>

          {/* Birth Rate (Cyan) */}
          <path
            d="M 68 50 L 160 50 C 208 54, 236 116, 288 134"
            fill="none"
            stroke="#00E5FF"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <text x="296" y="138" textAnchor="start" fontSize="11.5" fontWeight="700" fill="#00E5FF">Birth</text>

          {/* Death Rate (Amber) */}
          <path
            d="M 68 58 L 114 60 C 148 76, 178 138, 288 156"
            fill="none"
            stroke="#FFB000"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <text x="296" y="160" textAnchor="start" fontSize="11.5" fontWeight="700" fill="#FFB000">Death</text>

          {/* Open-quadrant Boom dot in wide void between curves */}
          <circle cx="150" cy="76" r="4.5" fill="#00E5FF" stroke="#050911" strokeWidth="1.5" />
          <text x="150" y="128" textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#EEF4FF">
            Stg 2 Boom
          </text>
        </svg>
      )}

      {/* Schema 5: SCALE_ARCS (Left-half 180° semicircles ONLY at cx=112 + horizontal leader lines) */}
      {kind === 'spatial_scale' && (
        <svg viewBox="0 0 358 176" width="100%" role="img" aria-label="Spatial Scale Hierarchy">
          {/* Outer semicircle (Global) */}
          <path d="M 112 20 A 68 68 0 0 0 112 156" fill="none" stroke="#334155" strokeWidth="2" />
          <line x1="112" y1="20" x2="204" y2="20" stroke="#334155" strokeWidth="1.5" />
          <text x="212" y="24" textAnchor="start" fontSize="12" fontWeight="700" fill="#EEF4FF">
            Global
          </text>

          {/* Middle semicircle (Regional) */}
          <path d="M 112 42 A 46 46 0 0 0 112 134" fill="none" stroke="#FFB000" strokeWidth="2" />
          <line x1="112" y1="42" x2="204" y2="42" stroke="#FFB000" strokeWidth="1.5" />
          <text x="212" y="46" textAnchor="start" fontSize="12" fontWeight="700" fill="#FFB000">
            Regional
          </text>

          {/* Inner semicircle (Local) */}
          <path d="M 112 64 A 24 24 0 0 0 112 112" fill="none" stroke="#00E5FF" strokeWidth="2" />
          <line x1="112" y1="64" x2="204" y2="64" stroke="#00E5FF" strokeWidth="1.5" />
          <text x="212" y="68" textAnchor="start" fontSize="12" fontWeight="700" fill="#00E5FF">
            Local
          </text>
        </svg>
      )}
    </figure>
  );
}
