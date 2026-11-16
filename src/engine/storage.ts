import type {
  CalibrationStats,
  Domain,
  DomainStats,
  PlayerProfile,
  RunHistoryEntry,
  RunState,
  SkillTag,
} from '../types/quiz';
import { getTodayKey } from './selector';

export const STORAGE_KEY = 'atlas7_profile_v1';
const MAX_RUN_HISTORY = 50;

const DOMAINS: Domain[] = ['US', 'World', 'Civics', 'Geo', 'Econ'];

const SKILLS: SkillTag[] = [
  'conceptual',
  'chronology',
  'causation',
  'primary_source',
  'data_literacy',
  'spatial_reasoning',
  'synthesis',
];

function emptyStats(): DomainStats {
  return { answered: 0, correct: 0 };
}

function emptyCalibration(): CalibrationStats {
  return {
    wagersPlaced: 0,
    totalConfidenceRatio: 0,
    finalAnswered: 0,
    finalCorrect: 0,
  };
}

/**
 * Creates a fresh `PlayerProfile` with zeroed domain, skill, and calibration accumulators.
 */
export function createDefaultProfile(): PlayerProfile {
  return {
    bestScore: 0,
    totalRuns: 0,
    seenIds: [],
    domainStats: Object.fromEntries(DOMAINS.map((d) => [d, emptyStats()])) as Record<
      Domain,
      DomainStats
    >,
    skillStats: Object.fromEntries(SKILLS.map((s) => [s, emptyStats()])) as Record<
      SkillTag,
      DomainStats
    >,
    calibrationStats: Object.fromEntries(
      DOMAINS.map((d) => [d, emptyCalibration()]),
    ) as Record<Domain, CalibrationStats>,
    runHistory: [],
  };
}

function getSafeStorage(): Storage | null {
  try {
    if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis && globalThis.localStorage) {
      return globalThis.localStorage;
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Safely loads the player profile from `localStorage`, backfilling missing
 * `calibrationStats` on older stored profiles and falling back to defaults on errors.
 */
export function loadProfile(): PlayerProfile {
  const fallback = createDefaultProfile();
  const storage = getSafeStorage();
  if (!storage) return fallback;

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<PlayerProfile>;
    if (!parsed || typeof parsed !== 'object') return fallback;

    return {
      bestScore: typeof parsed.bestScore === 'number' ? parsed.bestScore : 0,
      totalRuns: typeof parsed.totalRuns === 'number' ? parsed.totalRuns : 0,
      seenIds: Array.isArray(parsed.seenIds) ? parsed.seenIds : [],
      domainStats: {
        ...fallback.domainStats,
        ...(parsed.domainStats ?? {}),
      },
      skillStats: {
        ...fallback.skillStats,
        ...(parsed.skillStats ?? {}),
      },
      calibrationStats: {
        ...fallback.calibrationStats,
        ...(parsed.calibrationStats ?? {}),
      },
      runHistory: Array.isArray(parsed.runHistory) ? parsed.runHistory : [],
    };
  } catch {
    return fallback;
  }
}

/**
 * Safely persists the player profile to `localStorage`.
 */
export function saveProfile(profile: PlayerProfile): void {
  const storage = getSafeStorage();
  if (!storage) return;

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // Ignore storage quota or serialization errors in restricted environments.
  }
}

/**
 * Merges a completed `RunState` into a `PlayerProfile` without mutating it,
 * updating `domainStats`, `skillStats`, and `calibrationStats`.
 */
export function recordRunToProfile(profile: PlayerProfile, run: RunState): PlayerProfile {
  const seenSet = new Set(profile.seenIds);
  const nextDomainStats: Record<Domain, DomainStats> = { ...profile.domainStats };
  const nextSkillStats: Record<SkillTag, DomainStats> = { ...profile.skillStats };
  const nextCalibrationStats: Record<Domain, CalibrationStats> = {
    ...profile.calibrationStats,
  };

  for (const result of run.results) {
    seenSet.add(result.questionId);

    const prevDomain = nextDomainStats[result.domain] ?? emptyStats();
    nextDomainStats[result.domain] = {
      answered: prevDomain.answered + 1,
      correct: prevDomain.correct + (result.isCorrect ? 1 : 0),
      lastAnsweredAt: Math.max(prevDomain.lastAnsweredAt ?? 0, result.answeredAt),
    };

    const prevSkill = nextSkillStats[result.skill_tag] ?? emptyStats();
    nextSkillStats[result.skill_tag] = {
      answered: prevSkill.answered + 1,
      correct: prevSkill.correct + (result.isCorrect ? 1 : 0),
      lastAnsweredAt: Math.max(prevSkill.lastAnsweredAt ?? 0, result.answeredAt),
    };

    if (result.isFinalQuestion) {
      const prevCal = nextCalibrationStats[result.domain] ?? emptyCalibration();
      nextCalibrationStats[result.domain] = {
        finalAnswered: prevCal.finalAnswered + 1,
        finalCorrect: prevCal.finalCorrect + (result.isCorrect ? 1 : 0),
        wagersPlaced: prevCal.wagersPlaced + (result.maxWager > 0 ? 1 : 0),
        totalConfidenceRatio:
          prevCal.totalConfidenceRatio +
          (result.maxWager > 0 ? result.wagerPoints / result.maxWager : 0),
      };
    }
  }

  const runDomainCounts: Partial<Record<Domain, { answered: number; correct: number }>> = {};
  for (const result of run.results) {
    const prevRunDom = runDomainCounts[result.domain] ?? { answered: 0, correct: 0 };
    runDomainCounts[result.domain] = {
      answered: prevRunDom.answered + 1,
      correct: prevRunDom.correct + (result.isCorrect ? 1 : 0),
    };
  }

  const domainAccuracy: Partial<Record<Domain, number>> = {};
  for (const [dom, counts] of Object.entries(runDomainCounts) as [
    Domain,
    { answered: number; correct: number },
  ][]) {
    if (counts.answered > 0) {
      domainAccuracy[dom] = Math.round((counts.correct / counts.answered) * 100);
    }
  }

  const completedAt = run.completedAt ?? Date.now();
  const historyEntry: RunHistoryEntry = {
    runId: run.runId,
    dateKey: getTodayKey(new Date(completedAt)),
    completedAt,
    score: run.score,
    domainAccuracy,
  };

  return {
    bestScore: Math.max(profile.bestScore, run.score),
    totalRuns: profile.totalRuns + 1,
    seenIds: Array.from(seenSet),
    domainStats: nextDomainStats,
    skillStats: nextSkillStats,
    calibrationStats: nextCalibrationStats,
    runHistory: [...(profile.runHistory ?? []), historyEntry].slice(-MAX_RUN_HISTORY),
  };
}

/**
 * Clears the stored player profile from `localStorage` and returns a fresh default.
 */
export function resetProfile(): PlayerProfile {
  const storage = getSafeStorage();
  if (storage) {
    try {
      storage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors.
    }
  }
  return createDefaultProfile();
}
