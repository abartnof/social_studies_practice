import type { PlayerProfile, Question, RunMode, RunState } from '../types/quiz';
import { selectSprintQuestions } from './selector';

/**
 * Creates a new 10-question `RunState` (9 main + 1 final wager) for the given mode and profile.
 */
export function createRun(
  questions: Question[],
  mode: RunMode,
  profile: PlayerProfile,
  dailyKey?: string,
): RunState {
  const selected = selectSprintQuestions(questions, mode, profile, dailyKey);
  const now = Date.now();

  return {
    runId: `run_${now}_${Math.random().toString(36).slice(2, 8)}`,
    mode,
    ...(dailyKey ? { dailyKey } : {}),
    questions: selected,
    currentIndex: 0,
    score: 0,
    rightAnswersSoFar: 0,
    cluesRevealed: 1,
    activeWager: 0,
    wagerConfirmed: false,
    results: [],
    status: 'in_progress',
    startedAt: now,
  };
}

/**
 * Reveals the next progressive clue on a `'deduction'` question, capped at 3.
 */
export function revealNextClue(state: RunState): RunState {
  if (state.cluesRevealed >= 3) return state;
  return {
    ...state,
    cluesRevealed: Math.min(3, state.cluesRevealed + 1),
  };
}

/**
 * Sets the point wager for the Final Question, clamped to `0..state.rightAnswersSoFar`.
 */
export function setWagerPoints(state: RunState, points: number): RunState {
  const clamped = Math.min(Math.max(0, Math.round(points)), state.rightAnswersSoFar);
  return {
    ...state,
    activeWager: clamped,
  };
}

/**
 * Marks the player's wager as confirmed on the Final Question warning screen.
 */
export function confirmWager(state: RunState): RunState {
  return {
    ...state,
    wagerConfirmed: true,
  };
}

/**
 * Advances to the next question, or completes the run at the end, resetting per-question state.
 */
export function advanceQuestion(state: RunState): RunState {
  if (state.currentIndex + 1 >= state.questions.length) {
    return {
      ...state,
      status: 'completed',
      completedAt: Date.now(),
    };
  }

  return {
    ...state,
    currentIndex: state.currentIndex + 1,
    cluesRevealed: 1,
    activeWager: 0,
    wagerConfirmed: false,
  };
}
