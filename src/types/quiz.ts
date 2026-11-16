/**
 * Core domain types for Atlas — Praxis 5581 Practice.
 *
 * Shared contract across:
 * - Question bank & content validators
 * - 10-question game engine (3 MC + 6 special types + 1 Final Wager)
 * - Pure white-on-black mobile UI & physical-geography SVG maps
 */

/** Praxis 5581 content domains. */
export type Domain = 'US' | 'World' | 'Civics' | 'Geo' | 'Econ';

/** Supported question mechanics. */
export type QuestionType =
  | 'mc'
  | 'ordering'
  | 'causal'
  | 'deduction'
  | 'map'
  | 'compare'
  | 'data'
  | 'synthesis';

/** Cognitive skill tags aligned to Praxis 5581 reasoning tasks. */
export type SkillTag =
  | 'conceptual'
  | 'chronology'
  | 'causation'
  | 'primary_source'
  | 'data_literacy'
  | 'spatial_reasoning'
  | 'synthesis';

/** Common distractor archetypes used for targeted notes. */
export type TrapType =
  | 'era_bleed'
  | 'jurisdiction_swap'
  | 'policy_lever_swap'
  | 'reverse_causation'
  | 'scale_confusion';

/** Ordering axis for `'ordering'` / `'causal'` questions. */
export type OrderingMode = 'chronological' | 'causal';

/** Selectable option or sequence item. */
export interface QuestionOption {
  id: string;
  text: string;
}

/** Geographic coordinate anchor. */
export interface GeoAnchor {
  lat: number;
  lng: number;
  label: string;
}

/** Optional primary-source excerpt or structured data table stimulus. */
export interface Stimulus {
  kind: 'excerpt' | 'table';
  title?: string;
  text?: string;
  attribution?: string;
  headers?: string[];
  rows?: string[][];
}

/** Zoomed physical-geography SVG map region (coastlines/rivers only, no political borders). */
export type MapRegion =
  | 'world'
  | 'mediterranean'
  | 'north_america'
  | 'east_asia'
  | 'indian_ocean';

export interface MapPin {
  id: string;
  /** X coordinate inside 358x220 SVG viewBox. */
  x: number;
  /** Y coordinate inside 358x220 SVG viewBox. */
  y: number;
  /** Revealed after answering. */
  label: string;
}

export interface MapSpec {
  region: MapRegion;
  pins: MapPin[];
}

/** Two-bucket classification spec for `'compare'` questions. */
export interface CompareItem {
  id: string;
  text: string;
  bucket: 'left' | 'right';
}

export interface CompareSpec {
  leftLabel: string;
  rightLabel: string;
  items: CompareItem[];
}

/**
 * Polymorphic question record:
 * - `'mc'`, `'data'`, `'synthesis'`: 4-option choice (`answer` is option `id`)
 * - `'ordering'`, `'causal'`: 4-item sequence (`answer` is `string[]` of 4 option `id`s)
 * - `'deduction'`: 3 progressive clues (`clues` of length 3, `answer` is option `id`)
 * - `'map'`: 4 clickable locations on a physical-geography SVG (`mapSpec`, `answer` is pin `id`)
 * - `'compare'`: 4 items sorted into 2 columns (`compareSpec`, `answer` is `'all_matched'`)
 */
export interface Question {
  id: string;
  type: QuestionType;
  domain: Domain;
  secondary_domains?: Domain[];
  subdomain: string;
  era?: string;
  ordering_mode?: OrderingMode;
  skill_tag: SkillTag;
  trap_type: TrapType;
  geo: GeoAnchor;
  secondary_geo?: GeoAnchor;
  stimulus?: Stimulus;
  mapSpec?: MapSpec;
  compareSpec?: CompareSpec;
  prompt: string;
  clues?: string[];
  options: QuestionOption[];
  answer: string | string[];
  explanation: string;
  /** Reference URL backing the factual veracity of this item (not shown in UI). */
  source_url?: string;
  fun_fact?: string;
  trap_notes: Record<string, string>;
}

/** Run mode selection. */
export type RunMode =
  | 'random'
  | 'adaptive'
  | { kind: 'domain'; domain: Domain };

/** Per-domain accuracy accumulator. */
export interface DomainStats {
  answered: number;
  correct: number;
  lastAnsweredAt?: number;
}

/** Per-domain final-question wager calibration accumulator. */
export interface CalibrationStats {
  wagersPlaced: number;
  /** Sum of (wagerPoints / maxPossibleWager) across final questions where max > 0. */
  totalConfidenceRatio: number;
  finalAnswered: number;
  finalCorrect: number;
}

/** Per-run snapshot for Leaderboard, Cumulative Score chart, and Mastery Over Time. */
export interface RunHistoryEntry {
  runId: string;
  dateKey: string;
  completedAt: number;
  score: number;
  domainAccuracy: Partial<Record<Domain, number>>;
}

/** Persistent player profile stored locally. */
export interface PlayerProfile {
  bestScore: number;
  totalRuns: number;
  seenIds: string[];
  domainStats: Record<Domain, DomainStats>;
  skillStats: Record<SkillTag, DomainStats>;
  calibrationStats: Record<Domain, CalibrationStats>;
  runHistory: RunHistoryEntry[];
}

/** Evaluation record for a single answered question inside a run. */
export interface AnswerResult {
  questionId: string;
  domain: Domain;
  skill_tag: SkillTag;
  trap_type: TrapType;
  selected: string | string[];
  isCorrect: boolean;
  isFinalQuestion: boolean;
  /** Wagered points (0..rightAnswersSoFar) on the final question; 0 otherwise. */
  wagerPoints: number;
  /** Max possible wager on the final question (rightAnswersSoFar); 0 otherwise. */
  maxWager: number;
  cluesRevealed: number;
  pointsDelta: number;
  answeredAt: number;
}

/** Active or completed 10-question run (9 main + 1 final wager). */
export interface RunState {
  runId: string;
  mode: RunMode;
  dailyKey?: string;
  questions: Question[];
  currentIndex: number;
  /** Current score: +1 per right answer in Q1-Q9, +/- wager on Final Q10 (clamped >= 0). */
  score: number;
  /** Number of right answers accrued in Q1-Q9 (max wager available on Q10). */
  rightAnswersSoFar: number;
  /** Clues revealed for active `'deduction'` question (`1..3`). */
  cluesRevealed: number;
  /** Selected point wager for the Final Question (`0..rightAnswersSoFar`). */
  activeWager: number;
  /** True once user confirms their wager on the Final Question warning screen. */
  wagerConfirmed: boolean;
  results: AnswerResult[];
  status: 'in_progress' | 'completed';
  startedAt: number;
  completedAt?: number;
}
