import type { Domain, PlayerProfile, Question, QuestionType, RunMode } from '../types/quiz';

/** Official Praxis 5581 content domain target weights. */
export const OFFICIAL_DOMAIN_SHARES: Record<Domain, number> = {
  US: 0.29,
  Civics: 0.23,
  World: 0.22,
  Geo: 0.13,
  Econ: 0.13,
};

const ALL_DOMAINS: Domain[] = ['US', 'Civics', 'World', 'Geo', 'Econ'];

const SPECIAL_TYPES: QuestionType[] = [
  'ordering',
  'causal',
  'deduction',
  'map',
  'compare',
  'data',
];

/**
 * Returns the UTC date key in `YYYY-MM-DD` format.
 */
export function getTodayKey(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Creates a deterministic PRNG in `[0, 1)` from a string seed using
 * FNV-1a hashing + Mulberry32.
 */
export function createSeededRng(seed: string): () => number {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  let state = hash >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleWithRng<T>(items: T[], rng: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getDomainAccuracy(profile: PlayerProfile, domain: Domain): number {
  const stats = profile.domainStats[domain];
  if (!stats || stats.answered <= 0) return 0.5;
  return Math.min(1, Math.max(0, stats.correct / stats.answered));
}

function getAdaptiveDomainWeights(profile: PlayerProfile): Record<Domain, number> {
  return Object.fromEntries(
    ALL_DOMAINS.map((d) => [
      d,
      OFFICIAL_DOMAIN_SHARES[d] * (1 + 2.5 * (1 - getDomainAccuracy(profile, d))),
    ]),
  ) as Record<Domain, number>;
}

function pickWeightedDomain(
  domains: Domain[],
  weights: Record<Domain, number>,
  rng: () => number,
): Domain {
  const total = domains.reduce((sum, d) => sum + weights[d], 0);
  if (total <= 0) {
    return domains[Math.floor(rng() * domains.length)];
  }
  let roll = rng() * total;
  for (const d of domains) {
    roll -= weights[d];
    if (roll <= 0) return d;
  }
  return domains[domains.length - 1];
}

function pickFromCandidates(
  candidates: Question[],
  rng: () => number,
  seenSet: Set<string>,
): Question | undefined {
  if (candidates.length === 0) return undefined;
  const unseen = candidates.filter((q) => !seenSet.has(q.id));
  const pool = unseen.length > 0 ? unseen : candidates;
  return pool[Math.floor(rng() * pool.length)];
}

function pickWeightedQuestion(
  pool: Question[],
  typeChain: QuestionType[],
  usedIds: Set<string>,
  seenSet: Set<string>,
  weights: Record<Domain, number>,
  rng: () => number,
): Question | undefined {
  for (const t of typeChain) {
    const availableDomains = ALL_DOMAINS.filter((d) =>
      pool.some((q) => q.domain === d && q.type === t && !usedIds.has(q.id)),
    );
    if (availableDomains.length > 0) {
      const unseenDomains = availableDomains.filter((d) =>
        pool.some(
          (q) =>
            q.domain === d &&
            q.type === t &&
            !usedIds.has(q.id) &&
            !seenSet.has(q.id),
        ),
      );
      const domainPool = unseenDomains.length > 0 ? unseenDomains : availableDomains;
      const chosenDomain = pickWeightedDomain(domainPool, weights, rng);
      const candidates = pool.filter(
        (q) => q.domain === chosenDomain && q.type === t && !usedIds.has(q.id),
      );
      const picked = pickFromCandidates(candidates, rng, seenSet);
      if (picked) return picked;
    }
  }

  const remaining = pool.filter((q) => !usedIds.has(q.id));
  return pickFromCandidates(remaining, rng, seenSet);
}

function selectWeightedRun(
  pool: Question[],
  weights: Record<Domain, number>,
  profile: PlayerProfile,
  rng: () => number,
): Question[] {
  const seenSet = new Set(profile.seenIds);
  const usedIds = new Set<string>();

  const finalQuestion = pickWeightedQuestion(
    pool,
    ['synthesis', 'mc'],
    usedIds,
    seenSet,
    weights,
    rng,
  );
  if (finalQuestion) {
    usedIds.add(finalQuestion.id);
  }

  const mainQuestions: Question[] = [];
  for (const special of shuffleWithRng(SPECIAL_TYPES, rng)) {
    const picked = pickWeightedQuestion(
      pool,
      [special, 'mc'],
      usedIds,
      seenSet,
      weights,
      rng,
    );
    if (picked) {
      usedIds.add(picked.id);
      mainQuestions.push(picked);
    }
  }

  for (let i = 0; i < 3; i++) {
    const picked = pickWeightedQuestion(pool, ['mc'], usedIds, seenSet, weights, rng);
    if (picked) {
      usedIds.add(picked.id);
      mainQuestions.push(picked);
    }
  }

  const orderedMain = shuffleWithRng(mainQuestions, rng);
  return finalQuestion ? [...orderedMain, finalQuestion] : orderedMain;
}

function pickFromDomainTiers(
  primary: Question[],
  secondary: Question[],
  typeChain: QuestionType[] | null,
  usedIds: Set<string>,
  seenSet: Set<string>,
  rng: () => number,
): Question | undefined {
  const tiers = [primary, secondary];
  if (typeChain) {
    for (const t of typeChain) {
      for (const tier of tiers) {
        const candidates = tier.filter((q) => q.type === t && !usedIds.has(q.id));
        const picked = pickFromCandidates(candidates, rng, seenSet);
        if (picked) return picked;
      }
    }
    return undefined;
  }

  for (const tier of tiers) {
    const candidates = tier.filter((q) => !usedIds.has(q.id));
    const picked = pickFromCandidates(candidates, rng, seenSet);
    if (picked) return picked;
  }
  return undefined;
}

function selectDomainRun(
  pool: Question[],
  domain: Domain,
  profile: PlayerProfile,
  rng: () => number,
): Question[] {
  const primary = pool.filter((q) => q.domain === domain);
  const secondary = pool.filter(
    (q) => q.domain !== domain && q.secondary_domains?.includes(domain),
  );
  const seenSet = new Set(profile.seenIds);
  const usedIds = new Set<string>();

  const finalQuestion =
    pickFromDomainTiers(primary, secondary, ['synthesis', 'mc'], usedIds, seenSet, rng) ??
    pickFromDomainTiers(primary, secondary, null, usedIds, seenSet, rng);

  if (!finalQuestion) return [];
  usedIds.add(finalQuestion.id);

  const mainQuestions: Question[] = [];
  for (const special of shuffleWithRng(SPECIAL_TYPES, rng)) {
    const picked = pickFromDomainTiers(primary, secondary, [special], usedIds, seenSet, rng);
    if (picked) {
      usedIds.add(picked.id);
      mainQuestions.push(picked);
    }
  }

  while (mainQuestions.length < 9) {
    const picked =
      pickFromDomainTiers(primary, secondary, ['mc'], usedIds, seenSet, rng) ??
      pickFromDomainTiers(primary, secondary, null, usedIds, seenSet, rng);
    if (!picked) break;
    usedIds.add(picked.id);
    mainQuestions.push(picked);
  }

  return [...shuffleWithRng(mainQuestions, rng), finalQuestion];
}

/**
 * Selects up to 10 questions for a run:
 * - Q1-Q9: 3 `mc` + 1 each of `ordering`, `causal`, `deduction`, `map`, `compare`, `data`
 * - Q10: Final Wager Question (`synthesis`)
 */
export function selectSprintQuestions(
  pool: Question[],
  mode: RunMode,
  profile: PlayerProfile,
  seed?: string,
): Question[] {
  const rng = seed ? createSeededRng(seed) : Math.random;

  if (mode === 'random') {
    return selectWeightedRun(pool, OFFICIAL_DOMAIN_SHARES, profile, rng);
  }

  if (mode === 'adaptive') {
    return selectWeightedRun(pool, getAdaptiveDomainWeights(profile), profile, rng);
  }

  return selectDomainRun(pool, mode.domain, profile, rng);
}
