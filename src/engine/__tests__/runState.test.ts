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
  createRun,
  revealNextClue,
  setWagerPoints,
  confirmWager,
  advanceQuestion,
} from '../runState';

function makeEmptyStats(): DomainStats {
  return { answered: 0, correct: 0 };
}

function makeEmptyCalibration(): CalibrationStats {
  return { wagersPlaced: 0, totalConfidenceRatio: 0, finalAnswered: 0, finalCorrect: 0 };
}

function makeProfile(): PlayerProfile {
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
  };
}

function makePool(): Question[] {
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
      for (let copy = 0; copy < 2; copy++) {
        pool.push({
          id: `q-${idx++}`,
          type,
          domain,
          subdomain: 'General',
          skill_tag: 'conceptual',
          trap_type: 'era_bleed',
          geo: { lat: 0, lng: 0, label: 'Origin' },
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

describe('runState', () => {
  it('createRun initializes a 10-question run with simplified default counters', () => {
    const pool = makePool();
    const profile = makeProfile();
    const state = createRun(pool, 'random', profile);

    expect(state.questions).toHaveLength(10);
    expect(state.mode).toBe('random');
    expect(state.score).toBe(0);
    expect(state.rightAnswersSoFar).toBe(0);
    expect(state.cluesRevealed).toBe(1);
    expect(state.activeWager).toBe(0);
    expect(state.wagerConfirmed).toBe(false);
    expect(state.currentIndex).toBe(0);
    expect(state.status).toBe('in_progress');
    expect(state.results).toEqual([]);
  });

  it('revealNextClue increments cluesRevealed up to a maximum of 3', () => {
    const state = createRun(makePool(), 'adaptive', makeProfile());
    const s2 = revealNextClue(state);
    const s3 = revealNextClue(s2);
    const s4 = revealNextClue(s3);

    expect(s2.cluesRevealed).toBe(2);
    expect(s3.cluesRevealed).toBe(3);
    expect(s4.cluesRevealed).toBe(3);
  });

  it('setWagerPoints clamps wager between 0 and rightAnswersSoFar without mutating input', () => {
    const state = { ...createRun(makePool(), 'adaptive', makeProfile()), rightAnswersSoFar: 5 };
    expect(setWagerPoints(state, 3).activeWager).toBe(3);
    expect(setWagerPoints(state, -2).activeWager).toBe(0);
    expect(setWagerPoints(state, 10).activeWager).toBe(5);
    expect(state.activeWager).toBe(0);
  });

  it('confirmWager sets wagerConfirmed to true', () => {
    const state = createRun(makePool(), 'adaptive', makeProfile());
    const confirmed = confirmWager(state);

    expect(confirmed.wagerConfirmed).toBe(true);
    expect(state.wagerConfirmed).toBe(false);
  });

  it('advanceQuestion moves to next question, resets cluesRevealed, activeWager, wagerConfirmed, and completes at end', () => {
    let state = {
      ...createRun(makePool(), 'adaptive', makeProfile()),
      cluesRevealed: 3,
      activeWager: 4,
      wagerConfirmed: true,
    };

    const next = advanceQuestion(state);
    expect(next.currentIndex).toBe(1);
    expect(next.cluesRevealed).toBe(1);
    expect(next.activeWager).toBe(0);
    expect(next.wagerConfirmed).toBe(false);
    expect(next.status).toBe('in_progress');

    state = { ...state, currentIndex: 9 };
    const completed = advanceQuestion(state);
    expect(completed.status).toBe('completed');
    expect(completed.completedAt).toBeTypeOf('number');
  });
});
