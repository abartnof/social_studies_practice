import { describe, it, expect } from 'vitest';
import type { Question, RunState } from '../../types/quiz';
import { evaluateAnswer } from '../scoring';

function makeQuestion(overrides: Partial<Question> = {}): Question {
  return {
    id: 'q1',
    type: 'mc',
    domain: 'US',
    subdomain: 'Reconstruction',
    skill_tag: 'conceptual',
    trap_type: 'era_bleed',
    geo: { lat: 38.9, lng: -77.0, label: 'Washington, D.C.' },
    prompt: 'Test prompt',
    options: [
      { id: 'a', text: 'Option A' },
      { id: 'b', text: 'Option B' },
      { id: 'c', text: 'Option C' },
      { id: 'd', text: 'Option D' },
    ],
    answer: 'a',
    explanation: 'Core link explanation.',
    trap_notes: {
      b: 'Specific trap note for B.',
      default: 'Default trap note.',
    },
    ...overrides,
  };
}

function make10QuestionRun(overrides: Partial<RunState> = {}): RunState {
  const questions: Question[] = Array.from({ length: 10 }, (_, idx) =>
    makeQuestion({
      id: `q-${idx + 1}`,
      type: idx === 9 ? 'synthesis' : 'mc',
    }),
  );
  return {
    runId: 'run-1',
    mode: 'adaptive',
    questions,
    currentIndex: 0,
    score: 0,
    rightAnswersSoFar: 0,
    cluesRevealed: 1,
    activeWager: 0,
    wagerConfirmed: false,
    results: [],
    status: 'in_progress',
    startedAt: 1000,
    ...overrides,
  };
}

describe('evaluateAnswer (10-question simplified scoring)', () => {
  describe('Q1-Q9 standard scoring (+1 / 0, no hearts or streak)', () => {
    it('awards +1 point and increments rightAnswersSoFar on correct mc answer', () => {
      const state = make10QuestionRun({ currentIndex: 0, score: 2, rightAnswersSoFar: 2 });
      const { nextState, result, coreLink, trapNote } = evaluateAnswer(state, 'a');

      expect(result.isCorrect).toBe(true);
      expect(result.isFinalQuestion).toBe(false);
      expect(result.pointsDelta).toBe(1);
      expect(result.wagerPoints).toBe(0);
      expect(result.maxWager).toBe(0);
      expect(result.cluesRevealed).toBe(0);
      expect(nextState.score).toBe(3);
      expect(nextState.rightAnswersSoFar).toBe(3);
      expect(nextState.results).toHaveLength(1);
      expect(coreLink).toBe('Core link explanation.');
      expect(trapNote).toBe('Default trap note.');
    });

    it('awards 0 points and returns specific trapNote on wrong mc answer', () => {
      const state = make10QuestionRun({ currentIndex: 2, score: 2, rightAnswersSoFar: 2 });
      const { nextState, result, trapNote } = evaluateAnswer(state, 'b');

      expect(result.isCorrect).toBe(false);
      expect(result.isFinalQuestion).toBe(false);
      expect(result.pointsDelta).toBe(0);
      expect(nextState.score).toBe(2);
      expect(nextState.rightAnswersSoFar).toBe(2);
      expect(trapNote).toBe('Specific trap note for B.');
    });

    it('scores data and map questions by exact option/pin id match', () => {
      const state = make10QuestionRun({ currentIndex: 1 });
      state.questions[1] = makeQuestion({ id: 'q-data', type: 'data', answer: 'c' });
      const { result: dataRes } = evaluateAnswer(state, 'c');
      expect(dataRes.isCorrect).toBe(true);
      expect(dataRes.pointsDelta).toBe(1);

      state.questions[1] = makeQuestion({
        id: 'q-map',
        type: 'map',
        mapSpec: {
          region: 'world',
          pins: [
            { id: 'p1', x: 10, y: 20, label: 'Pin 1' },
            { id: 'p2', x: 30, y: 40, label: 'Pin 2' },
            { id: 'p3', x: 50, y: 60, label: 'Pin 3' },
            { id: 'p4', x: 70, y: 80, label: 'Pin 4' },
          ],
        },
        answer: 'p2',
      });
      const { result: mapRes } = evaluateAnswer(state, 'p2');
      expect(mapRes.isCorrect).toBe(true);
      expect(mapRes.pointsDelta).toBe(1);
    });
  });

  describe('deduction mechanic', () => {
    it('awards +1 regardless of cluesRevealed and records cluesRevealed in result', () => {
      const state = make10QuestionRun({ currentIndex: 3, cluesRevealed: 3 });
      state.questions[3] = makeQuestion({
        id: 'q-ded',
        type: 'deduction',
        clues: ['c1', 'c2', 'c3'],
        answer: 'a',
      });

      const { nextState, result } = evaluateAnswer(state, 'a');
      expect(result.isCorrect).toBe(true);
      expect(result.pointsDelta).toBe(1);
      expect(result.cluesRevealed).toBe(3);
      expect(nextState.score).toBe(1);
      expect(nextState.rightAnswersSoFar).toBe(1);
    });
  });

  describe('ordering and causal mechanics', () => {
    it('awards +1 only on exact 4/4 match for ordering', () => {
      const state = make10QuestionRun({ currentIndex: 1 });
      state.questions[1] = makeQuestion({
        id: 'q-ord',
        type: 'ordering',
        answer: ['a', 'b', 'c', 'd'],
      });

      const exact = evaluateAnswer(state, ['a', 'b', 'c', 'd']);
      expect(exact.result.isCorrect).toBe(true);
      expect(exact.result.pointsDelta).toBe(1);
      expect(exact.nextState.score).toBe(1);

      const partial = evaluateAnswer(state, ['a', 'b', 'd', 'c']);
      expect(partial.result.isCorrect).toBe(false);
      expect(partial.result.pointsDelta).toBe(0);
      expect(partial.nextState.score).toBe(0);
    });

    it('awards +1 only on exact 4/4 match for causal', () => {
      const state = make10QuestionRun({ currentIndex: 4 });
      state.questions[4] = makeQuestion({
        id: 'q-cau',
        type: 'causal',
        ordering_mode: 'causal',
        answer: ['a', 'b', 'c', 'd'],
      });

      const exact = evaluateAnswer(state, ['a', 'b', 'c', 'd']);
      expect(exact.result.isCorrect).toBe(true);
      expect(exact.result.pointsDelta).toBe(1);

      const wrong = evaluateAnswer(state, ['b', 'a', 'c', 'd']);
      expect(wrong.result.isCorrect).toBe(false);
      expect(wrong.result.pointsDelta).toBe(0);
    });
  });

  describe('compare mechanic', () => {
    it('awards +1 iff every item in compareSpec.items has "${item.id}:${item.bucket}" in selected', () => {
      const state = make10QuestionRun({ currentIndex: 5 });
      state.questions[5] = makeQuestion({
        id: 'q-cmp',
        type: 'compare',
        compareSpec: {
          leftLabel: 'Federalists',
          rightLabel: 'Anti-Federalists',
          items: [
            { id: 'i1', text: 'Strong central gov', bucket: 'left' },
            { id: 'i2', text: 'Bill of Rights demand', bucket: 'right' },
            { id: 'i3', text: 'National bank', bucket: 'left' },
            { id: 'i4', text: 'State sovereignty', bucket: 'right' },
          ],
        },
        answer: 'all_matched',
      });

      const correct = evaluateAnswer(state, ['i1:left', 'i2:right', 'i3:left', 'i4:right']);
      expect(correct.result.isCorrect).toBe(true);
      expect(correct.result.pointsDelta).toBe(1);
      expect(correct.nextState.score).toBe(1);

      const wrong = evaluateAnswer(state, ['i1:left', 'i2:left', 'i3:left', 'i4:right']);
      expect(wrong.result.isCorrect).toBe(false);
      expect(wrong.result.pointsDelta).toBe(0);
      expect(wrong.nextState.score).toBe(0);
    });
  });

  describe('Final Wager Question (Q10)', () => {
    it('adds +wager on correct final answer and does not increment rightAnswersSoFar', () => {
      const state = make10QuestionRun({
        currentIndex: 9,
        score: 7,
        rightAnswersSoFar: 7,
        activeWager: 5,
        wagerConfirmed: true,
      });

      const { nextState, result } = evaluateAnswer(state, 'a');
      expect(result.isFinalQuestion).toBe(true);
      expect(result.isCorrect).toBe(true);
      expect(result.maxWager).toBe(7);
      expect(result.wagerPoints).toBe(5);
      expect(result.pointsDelta).toBe(5);
      expect(nextState.score).toBe(12);
      expect(nextState.rightAnswersSoFar).toBe(7);
    });

    it('subtracts -wager on wrong final answer and clamps score at 0', () => {
      const state = make10QuestionRun({
        currentIndex: 9,
        score: 3,
        rightAnswersSoFar: 5,
        activeWager: 5,
        wagerConfirmed: true,
      });

      const { nextState, result } = evaluateAnswer(state, 'b');
      expect(result.isFinalQuestion).toBe(true);
      expect(result.isCorrect).toBe(false);
      expect(result.maxWager).toBe(5);
      expect(result.wagerPoints).toBe(5);
      expect(result.pointsDelta).toBe(-5);
      expect(nextState.score).toBe(0);
    });

    it('clamps activeWager to [0, rightAnswersSoFar] on the final question', () => {
      const state = make10QuestionRun({
        currentIndex: 9,
        score: 4,
        rightAnswersSoFar: 4,
        activeWager: 99,
      });

      const { nextState, result } = evaluateAnswer(state, 'a');
      expect(result.maxWager).toBe(4);
      expect(result.wagerPoints).toBe(4);
      expect(result.pointsDelta).toBe(4);
      expect(nextState.score).toBe(8);
    });
  });
});
