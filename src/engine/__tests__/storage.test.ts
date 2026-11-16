import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { RunState, Question } from '../../types/quiz';
import {
  STORAGE_KEY,
  createDefaultProfile,
  loadProfile,
  saveProfile,
  recordRunToProfile,
  resetProfile,
} from '../storage';

function createMockStorage() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
  };
}

describe('storage', () => {
  let mockStorage: ReturnType<typeof createMockStorage>;

  beforeEach(() => {
    mockStorage = createMockStorage();
    vi.stubGlobal('localStorage', mockStorage);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('createDefaultProfile initializes domainStats, skillStats, calibrationStats, and runHistory', () => {
    const profile = createDefaultProfile();
    expect(profile.bestScore).toBe(0);
    expect(profile.totalRuns).toBe(0);
    expect(profile.seenIds).toEqual([]);
    expect(profile.runHistory).toEqual([]);
    expect(Object.keys(profile.domainStats)).toEqual(['US', 'World', 'Civics', 'Geo', 'Econ']);
    expect(Object.keys(profile.skillStats)).toHaveLength(7);
    expect(profile.calibrationStats.US).toEqual({
      wagersPlaced: 0,
      totalConfidenceRatio: 0,
      finalAnswered: 0,
      finalCorrect: 0,
    });
  });

  it('saveProfile and loadProfile round-trip via STORAGE_KEY', () => {
    const profile = createDefaultProfile();
    profile.bestScore = 14;
    profile.totalRuns = 3;
    profile.seenIds = ['q1', 'q2'];

    saveProfile(profile);
    expect(mockStorage.getItem(STORAGE_KEY)).toBeTruthy();

    const loaded = loadProfile();
    expect(loaded).toEqual(profile);
  });

  it('loadProfile safely backfills calibrationStats and runHistory when reading an older stored profile', () => {
    const legacy = {
      bestScore: 5,
      totalRuns: 1,
      seenIds: ['q1'],
      domainStats: createDefaultProfile().domainStats,
      skillStats: createDefaultProfile().skillStats,
    };
    mockStorage.setItem(STORAGE_KEY, JSON.stringify(legacy));

    const loaded = loadProfile();
    expect(loaded.bestScore).toBe(5);
    expect(loaded.calibrationStats).toEqual(createDefaultProfile().calibrationStats);
    expect(loaded.runHistory).toEqual([]);
  });

  it('loadProfile falls back to default on corrupt JSON or missing localStorage', () => {
    mockStorage.setItem(STORAGE_KEY, '{not-valid-json');
    expect(loadProfile()).toEqual(createDefaultProfile());

    vi.unstubAllGlobals();
    expect(loadProfile()).toEqual(createDefaultProfile());
  });

  it('recordRunToProfile updates domainStats and calibrationStats on final question', () => {
    const initial = createDefaultProfile();
    initial.bestScore = 6;
    initial.seenIds = ['q1'];

    const dummyQuestions: Question[] = [];
    const run: RunState = {
      runId: 'run-1',
      mode: 'adaptive',
      questions: dummyQuestions,
      currentIndex: 9,
      score: 12,
      rightAnswersSoFar: 8,
      cluesRevealed: 1,
      activeWager: 4,
      wagerConfirmed: true,
      status: 'completed',
      startedAt: 1000,
      completedAt: 2000,
      results: [
        {
          questionId: 'q1',
          domain: 'US',
          skill_tag: 'chronology',
          trap_type: 'era_bleed',
          selected: 'a',
          isCorrect: true,
          isFinalQuestion: false,
          wagerPoints: 0,
          maxWager: 0,
          cluesRevealed: 0,
          pointsDelta: 1,
          answeredAt: 1500,
        },
        {
          questionId: 'q10',
          domain: 'Econ',
          skill_tag: 'synthesis',
          trap_type: 'policy_lever_swap',
          selected: 'a',
          isCorrect: true,
          isFinalQuestion: true,
          wagerPoints: 4,
          maxWager: 8,
          cluesRevealed: 0,
          pointsDelta: 4,
          answeredAt: 1800,
        },
      ],
    };

    const updated = recordRunToProfile(initial, run);
    expect(updated.bestScore).toBe(12);
    expect(updated.totalRuns).toBe(1);
    expect(updated.seenIds).toEqual(['q1', 'q10']);
    expect(updated.domainStats.US).toEqual({ answered: 1, correct: 1, lastAnsweredAt: 1500 });
    expect(updated.domainStats.Econ).toEqual({ answered: 1, correct: 1, lastAnsweredAt: 1800 });
    expect(updated.calibrationStats.US).toEqual({
      wagersPlaced: 0,
      totalConfidenceRatio: 0,
      finalAnswered: 0,
      finalCorrect: 0,
    });
    expect(updated.calibrationStats.Econ).toEqual({
      wagersPlaced: 1,
      totalConfidenceRatio: 0.5,
      finalAnswered: 1,
      finalCorrect: 1,
    });
    expect(updated.runHistory).toEqual([
      {
        runId: 'run-1',
        dateKey: '1970-01-01',
        completedAt: 2000,
        score: 12,
        domainAccuracy: {
          US: 100,
          Econ: 100,
        },
      },
    ]);
  });

  it('recordRunToProfile computes per-run domainAccuracy and caps runHistory at latest 50 runs', () => {
    let profile = createDefaultProfile();
    for (let i = 1; i <= 52; i++) {
      const run: RunState = {
        runId: `run-${i}`,
        mode: 'adaptive',
        questions: [],
        currentIndex: 9,
        score: i,
        rightAnswersSoFar: 5,
        cluesRevealed: 1,
        activeWager: 0,
        wagerConfirmed: false,
        status: 'completed',
        startedAt: 1700000000000 + i * 1000,
        completedAt: Date.UTC(2026, 10, 16, 12, 0, i),
        results: [
          {
            questionId: `q-${i}-1`,
            domain: 'Geo',
            skill_tag: 'spatial_reasoning',
            trap_type: 'scale_confusion',
            selected: 'a',
            isCorrect: true,
            isFinalQuestion: false,
            wagerPoints: 0,
            maxWager: 0,
            cluesRevealed: 0,
            pointsDelta: 1,
            answeredAt: 1000,
          },
          {
            questionId: `q-${i}-2`,
            domain: 'Geo',
            skill_tag: 'spatial_reasoning',
            trap_type: 'scale_confusion',
            selected: 'b',
            isCorrect: false,
            isFinalQuestion: false,
            wagerPoints: 0,
            maxWager: 0,
            cluesRevealed: 0,
            pointsDelta: 0,
            answeredAt: 1001,
          },
          {
            questionId: `q-${i}-3`,
            domain: 'Geo',
            skill_tag: 'spatial_reasoning',
            trap_type: 'scale_confusion',
            selected: 'a',
            isCorrect: true,
            isFinalQuestion: false,
            wagerPoints: 0,
            maxWager: 0,
            cluesRevealed: 0,
            pointsDelta: 1,
            answeredAt: 1002,
          },
        ],
      };
      profile = recordRunToProfile(profile, run);
    }

    expect(profile.runHistory).toHaveLength(50);
    expect(profile.runHistory[0].runId).toBe('run-3');
    expect(profile.runHistory[49].runId).toBe('run-52');
    expect(profile.runHistory[49].dateKey).toBe('2026-11-16');
    expect(profile.runHistory[49].domainAccuracy).toEqual({ Geo: 67 });
  });

  it('resetProfile removes stored data and returns default profile', () => {
    const profile = createDefaultProfile();
    profile.bestScore = 10;
    saveProfile(profile);

    const reset = resetProfile();
    expect(reset).toEqual(createDefaultProfile());
    expect(mockStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
