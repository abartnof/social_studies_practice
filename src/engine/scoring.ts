import type { AnswerResult, Question, RunState } from '../types/quiz';

function isExactSequenceMatch(selected: string | string[], answer: string | string[]): boolean {
  if (!Array.isArray(selected) || !Array.isArray(answer)) return false;
  if (selected.length !== answer.length) return false;
  return answer.every((id, idx) => selected[idx] === id);
}

function isCompareMatch(question: Question, selected: string | string[]): boolean {
  const items = question.compareSpec?.items;
  if (!items || items.length === 0 || !Array.isArray(selected)) return false;
  if (selected.length !== items.length) return false;
  return items.every((item) => selected.includes(`${item.id}:${item.bucket}`));
}

function evaluateCorrectness(question: Question, selected: string | string[]): boolean {
  if (question.type === 'ordering' || question.type === 'causal') {
    return isExactSequenceMatch(selected, question.answer);
  }
  if (question.type === 'compare') {
    return isCompareMatch(question, selected);
  }
  return typeof selected === 'string' && selected === question.answer;
}

function resolveTrapNote(
  question: Question,
  selected: string | string[],
  isCorrect: boolean,
): string {
  if (
    !isCorrect &&
    question.type !== 'ordering' &&
    question.type !== 'causal' &&
    question.type !== 'compare' &&
    typeof selected === 'string' &&
    question.trap_notes[selected]
  ) {
    return question.trap_notes[selected];
  }
  return question.trap_notes.default ?? '';
}

/**
 * Evaluates a player's submitted answer for the current question in `state`,
 * returning the updated `RunState`, `AnswerResult`, `coreLink`, and `trapNote`.
 *
 * - Q1-Q9: +1 point on correct answer, 0 on wrong answer.
 * - Final Question (last index): +/- clamped wager (0..rightAnswersSoFar), score clamped >= 0.
 */
export function evaluateAnswer(
  state: RunState,
  selected: string | string[],
): { nextState: RunState; result: AnswerResult; coreLink: string; trapNote: string } {
  const question = state.questions[state.currentIndex];
  if (!question) {
    throw new Error(`No question at index ${state.currentIndex}`);
  }

  const isCorrect = evaluateCorrectness(question, selected);
  const isFinalQuestion = state.currentIndex === state.questions.length - 1;

  const maxWager = isFinalQuestion ? state.rightAnswersSoFar : 0;
  const wagerPoints = isFinalQuestion
    ? Math.min(Math.max(0, state.activeWager), maxWager)
    : 0;

  let pointsDelta = 0;
  let nextScore = state.score;
  let nextRightAnswersSoFar = state.rightAnswersSoFar;

  if (isFinalQuestion) {
    pointsDelta = isCorrect ? wagerPoints : -wagerPoints;
    nextScore = Math.max(0, state.score + pointsDelta);
  } else if (isCorrect) {
    pointsDelta = 1;
    nextScore = state.score + 1;
    nextRightAnswersSoFar = state.rightAnswersSoFar + 1;
  }

  const result: AnswerResult = {
    questionId: question.id,
    domain: question.domain,
    skill_tag: question.skill_tag,
    trap_type: question.trap_type,
    selected,
    isCorrect,
    isFinalQuestion,
    wagerPoints,
    maxWager,
    cluesRevealed: question.type === 'deduction' ? state.cluesRevealed : 0,
    pointsDelta,
    answeredAt: Date.now(),
  };

  const nextState: RunState = {
    ...state,
    score: nextScore,
    rightAnswersSoFar: nextRightAnswersSoFar,
    results: [...state.results, result],
  };

  return {
    nextState,
    result,
    coreLink: question.explanation,
    trapNote: resolveTrapNote(question, selected, isCorrect),
  };
}
