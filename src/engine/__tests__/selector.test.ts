import { describe, it, expect } from 'vitest';
import type {
  Question,
  PlayerProfile,
  Domain,
  SkillTag,
  DomainStats,
  CalibrationStats,
  QuestionType,
} from '../../types/quiz';
import {
  OFFICIAL_DOMAIN_SHARES,
  getTodayKey,
  createSeededRng,
  selectSprintQuestions,
} from '../selector';

function makeEmptyStats(): DomainStats {
  return { answered: 0, correct: 0 };
}

function makeEmptyCalibration(): CalibrationStats {
  return { wagersPlaced: 0, totalConfidenceRatio: 0, finalAnswered: 0, finalCorrect: 0 };
}

function makeProfile(overrides: Partial<PlayerProfile> = {}): PlayerProfile {
  const domains: Domain[] = ['US', 'World', 'Civics', 'Geo', 'Econ'];
  const skills: SkillTag[] = [
    'conceptual',
    'chronology',
    'causation',
    'primary_source',
    'data_literacy',
    'spatial_reasoning',
    'synthesis',
  ];
  return {
    bestScore: 0,
    totalRuns: 0,
    seenIds: [],
    domainStats: Object.fromEntries(domains.map((d) => [d, makeEmptyStats()])) as Record<
      Domain,
      DomainStats
    >,
    skillStats: Object.fromEntries(skills.map((s) => [s, makeEmptyStats()])) as Record<
      SkillTag,
      DomainStats
    >,
    calibrationStats: Object.fromEntries(
      domains.map((d) => [d, makeEmptyCalibration()]),
    ) as Record<Domain, CalibrationStats>,
    runHistory: [],
    ...overrides,
  };
}

function makeRichPool(): Question[] {
  const domains: Domain[] = ['US', 'World', 'Civics', 'Geo', 'Econ'];
  const types: QuestionType[] = [
    'mc',
    'ordering',
    'causal',
    'deduction',
    'map',
    'compare',
    'data',
    'synthesis',
  ];
  const pool: Question[] = [];
  let idx = 1;
  for (const domain of domains) {
    for (const type of types) {
      for (let copy = 0; copy < 3; copy++) {
        pool.push({
          id: `${domain}-${type}-${idx++}`,
          type,
          domain,
          secondary_domains: domain === 'US' ? ['Civics'] : undefined,
          subdomain: 'General',
          skill_tag: 'conceptual',
          trap_type: 'era_bleed',
          geo: { lat: 0, lng: 0, label: domain },
          prompt: `Prompt ${idx}`,
          clues: type === 'deduction' ? ['c1', 'c2', 'c3'] : undefined,
          options: [
            { id: 'a', text: 'A' },
            { id: 'b', text: 'B' },
            { id: 'c', text: 'C' },
            { id: 'd', text: 'D' },
          ],
          answer: type === 'ordering' || type === 'causal' ? ['a', 'b', 'c', 'd'] : 'a',
          explanation: 'Explanation',
          trap_notes: { default: 'Default trap' },
        });
      }
    }
  }
  return pool;
}

describe('selector (10-question run)', () => {
  it('defines official Praxis 5581 shares summing to 1.0', () => {
    const sum = Object.values(OFFICIAL_DOMAIN_SHARES).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1.0, 5);
  });

  it('getTodayKey returns YYYY-MM-DD', () => {
    const key = getTodayKey(new Date('2026-11-16T12:00:00Z'));
    expect(key).toBe('2026-11-16');
    expect(getTodayKey()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('createSeededRng is deterministic for the same seed and diverges for different seeds', () => {
    const rng1 = createSeededRng('2026-11-16');
    const rng2 = createSeededRng('2026-11-16');
    const rng3 = createSeededRng('2026-11-17');

    const seq1 = Array.from({ length: 5 }, () => rng1());
    const seq2 = Array.from({ length: 5 }, () => rng2());
    const seq3 = Array.from({ length: 5 }, () => rng3());

    expect(seq1).toEqual(seq2);
    expect(seq1).not.toEqual(seq3);
  });

  it('selects 10 questions: 3 mc + 6 special types in Q1-Q9 and synthesis at Q10', () => {
    const pool = makeRichPool();
    for (const mode of ['random', 'adaptive'] as const) {
      const selected = selectSprintQuestions(pool, mode, makeProfile());

      expect(selected).toHaveLength(10);
      expect(new Set(selected.map((q) => q.id)).size).toBe(10);
      expect(selected[9].type).toBe('synthesis');

      const mainTypes = selected.slice(0, 9).map((q) => q.type);
      expect(mainTypes.filter((t) => t === 'mc')).toHaveLength(3);
      for (const special of ['ordering', 'causal', 'deduction', 'map', 'compare', 'data'] as const) {
        expect(mainTypes.filter((t) => t === special)).toHaveLength(1);
      }
    }
  });

  it('samples domains according to OFFICIAL_DOMAIN_SHARES in random mode', () => {
    const pool = makeRichPool();
    const profile = makeProfile();
    const counts: Record<Domain, number> = { US: 0, World: 0, Civics: 0, Geo: 0, Econ: 0 };

    const runs = 120;
    for (let i = 0; i < runs; i++) {
      const selected = selectSprintQuestions(pool, 'random', profile, `random-seed-${i}`);
      for (const q of selected) {
        counts[q.domain]++;
      }
    }

    const total = runs * 10;
    expect(counts.US / total).toBeGreaterThan(0.22);
    expect(counts.US / total).toBeLessThan(0.36);
    expect(counts.Geo / total).toBeGreaterThan(0.08);
    expect(counts.Geo / total).toBeLessThan(0.19);
    expect(counts.US).toBeGreaterThan(counts.Geo);
    expect(counts.US).toBeGreaterThan(counts.Econ);
  });

  it('heavily favors low-accuracy domains over 100%-accuracy domains in adaptive mode', () => {
    const pool = makeRichPool();
    const baseProfile = makeProfile();
    const profile = makeProfile({
      domainStats: {
        ...baseProfile.domainStats,
        US: { answered: 20, correct: 20 }, // 100% accuracy -> weight 0.29 * 1.0 = 0.29
        Econ: { answered: 20, correct: 0 }, // 0% accuracy -> weight 0.13 * 3.5 = 0.455
        Geo: { answered: 20, correct: 20 }, // 100% accuracy -> weight 0.13 * 1.0 = 0.13
        Civics: { answered: 20, correct: 20 },
        World: { answered: 20, correct: 20 },
      },
    });

    const counts: Record<Domain, number> = { US: 0, World: 0, Civics: 0, Geo: 0, Econ: 0 };
    const runs = 120;
    for (let i = 0; i < runs; i++) {
      const selected = selectSprintQuestions(pool, 'adaptive', profile, `adaptive-seed-${i}`);
      for (const q of selected) {
        counts[q.domain]++;
      }
    }

    expect(counts.Econ).toBeGreaterThan(counts.US);
    expect(counts.Econ).toBeGreaterThan(counts.Geo * 2);
  });

  it('prefers unseen questions before seenIds in both random and adaptive modes', () => {
    const pool = makeRichPool();
    const seenIds = pool.filter((_, idx) => idx % 3 !== 2).map((q) => q.id);
    const profile = makeProfile({ seenIds });

    for (const mode of ['random', 'adaptive'] as const) {
      const selected = selectSprintQuestions(pool, mode, profile);
      const unseenCount = selected.filter((q) => !seenIds.includes(q.id)).length;
      expect(unseenCount).toBe(10);
    }
  });

  it('filters to target domain (with secondary_domains fallback) and puts Final Wager Question last', () => {
    const pool = makeRichPool();
    const withoutCivicsSynth = pool.filter(
      (q) => !(q.domain === 'Civics' && q.type === 'synthesis'),
    );

    const selected = selectSprintQuestions(
      withoutCivicsSynth,
      { kind: 'domain', domain: 'Civics' },
      makeProfile(),
    );

    expect(selected).toHaveLength(10);
    expect(selected[9].type).toBe('synthesis');
    selected.forEach((q) => {
      const matchesDomain = q.domain === 'Civics' || q.secondary_domains?.includes('Civics');
      expect(matchesDomain).toBe(true);
    });
  });
});
