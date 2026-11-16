import { describe, expect, it } from 'vitest';
import type { Domain, GeoAnchor, MapRegion, Question, QuestionType } from '../../types/quiz';
import { getQuestionsByDomain, QUESTIONS } from '../questions';

const DOMAINS: Domain[] = ['US', 'World', 'Civics', 'Geo', 'Econ'];
const MAP_REGIONS: MapRegion[] = [
  'world',
  'mediterranean',
  'north_america',
  'east_asia',
  'indian_ocean',
];

function assertValidGeo(geo: GeoAnchor, context: string) {
  expect(geo.lat, `${context} lat`).toBeGreaterThanOrEqual(-90);
  expect(geo.lat, `${context} lat`).toBeLessThanOrEqual(90);
  expect(geo.lng, `${context} lng`).toBeGreaterThanOrEqual(-180);
  expect(geo.lng, `${context} lng`).toBeLessThanOrEqual(180);
  expect(geo.label.trim().length, `${context} label`).toBeGreaterThan(0);
}

describe('Praxis 5581 Question Bank (src/data/questions.ts)', () => {
  it('contains at least 40 questions with at least 8 per domain', () => {
    expect(QUESTIONS.length).toBeGreaterThanOrEqual(40);

    for (const domain of DOMAINS) {
      const domainQuestions = getQuestionsByDomain(domain);
      expect(domainQuestions.length, `${domain} count`).toBeGreaterThanOrEqual(8);
      expect(domainQuestions.every((q) => q.domain === domain)).toBe(true);
    }
  });

  it('covers all 8 question types with required minimum counts', () => {
    const byType = QUESTIONS.reduce<Record<QuestionType, number>>(
      (acc, q) => {
        acc[q.type] += 1;
        return acc;
      },
      {
        mc: 0,
        ordering: 0,
        causal: 0,
        deduction: 0,
        map: 0,
        compare: 0,
        data: 0,
        synthesis: 0,
      },
    );

    expect(byType.mc).toBeGreaterThanOrEqual(10);
    expect(byType.ordering).toBeGreaterThanOrEqual(5);
    expect(byType.causal).toBeGreaterThanOrEqual(5);
    expect(byType.deduction).toBeGreaterThanOrEqual(5);
    expect(byType.map).toBeGreaterThanOrEqual(5);
    expect(byType.compare).toBeGreaterThanOrEqual(5);
    expect(byType.data).toBeGreaterThanOrEqual(5);
    expect(byType.synthesis).toBeGreaterThanOrEqual(5);
  });

  it('has unique question IDs', () => {
    const ids = QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('validates coordinate bounds for primary and secondary geo anchors', () => {
    for (const q of QUESTIONS) {
      assertValidGeo(q.geo, `${q.id} geo`);
      if (q.secondary_geo) {
        assertValidGeo(q.secondary_geo, `${q.id} secondary_geo`);
      }
    }
  });

  it('validates deduction questions have exactly 3 short clues (<= 105 chars)', () => {
    const deductions = QUESTIONS.filter((q) => q.type === 'deduction');
    for (const q of deductions) {
      expect(q.clues, `${q.id} clues`).toBeDefined();
      expect(q.clues).toHaveLength(3);
      for (const clue of q.clues ?? []) {
        expect(clue.trim().length).toBeGreaterThan(0);
        expect(clue.length, `${q.id} clue (${clue.length} chars)`).toBeLessThanOrEqual(105);
      }
      expect(q.stimulus?.kind).not.toBe('excerpt');
    }
  });

  it('validates ordering and causal questions have 4 short options (<= 70 chars) and permutation answers', () => {
    const sequences = QUESTIONS.filter((q) => q.type === 'ordering' || q.type === 'causal');
    for (const q of sequences) {
      expect(['chronological', 'causal']).toContain(q.ordering_mode);
      expect(q.options).toHaveLength(4);
      for (const opt of q.options) {
        expect(opt.text.length, `${q.id} opt.${opt.id} (${opt.text.length} chars)`).toBeLessThanOrEqual(70);
      }
      expect(Array.isArray(q.answer), `${q.id} answer is array`).toBe(true);

      const optionIds = q.options.map((o) => o.id);
      const answerIds = q.answer as string[];
      expect(answerIds).toHaveLength(4);
      expect([...answerIds].sort()).toEqual([...optionIds].sort());
      expect(q.trap_notes.default?.trim().length ?? 0).toBeGreaterThan(0);
    }
  });

  it('validates mapSpec bounds (x in [20, 338], y in [18, 202]), 4 unique pin IDs, and answer', () => {
    const maps = QUESTIONS.filter((q) => q.type === 'map');
    const seenRegions = new Set<MapRegion>();

    for (const q of maps) {
      expect(q.mapSpec, `${q.id} mapSpec`).toBeDefined();
      const spec = q.mapSpec!;
      expect(MAP_REGIONS).toContain(spec.region);
      seenRegions.add(spec.region);
      expect(spec.pins).toHaveLength(4);

      const pinIds = spec.pins.map((p) => p.id);
      expect(new Set(pinIds).size, `${q.id} unique pin IDs`).toBe(4);
      expect(typeof q.answer, `${q.id} answer is string`).toBe('string');
      expect(pinIds).toContain(q.answer);

      for (const pin of spec.pins) {
        expect(pin.x, `${q.id} pin.${pin.id} x`).toBeGreaterThanOrEqual(20);
        expect(pin.x, `${q.id} pin.${pin.id} x`).toBeLessThanOrEqual(338);
        expect(pin.y, `${q.id} pin.${pin.id} y`).toBeGreaterThanOrEqual(18);
        expect(pin.y, `${q.id} pin.${pin.id} y`).toBeLessThanOrEqual(202);
        expect(pin.label.trim().length, `${q.id} pin.${pin.id} label`).toBeGreaterThan(0);
        expect(pin.label.length, `${q.id} pin.${pin.id} label (${pin.label.length} chars)`).toBeLessThanOrEqual(22);
        expect(pin.label, `${q.id} pin.${pin.id} no parenthetical hints`).not.toMatch(/\(.*\)/);
      }

      expect(q.trap_notes.default?.trim().length ?? 0).toBeGreaterThan(0);
      for (const pinId of pinIds.filter((id) => id !== q.answer)) {
        expect(q.trap_notes[pinId]?.trim().length ?? 0, `${q.id} trap_notes.${pinId}`).toBeGreaterThan(0);
      }
    }

    expect(seenRegions.size).toBe(MAP_REGIONS.length);
  });

  it('validates compareSpec (4 items <= 45 chars with left|right buckets) and answer', () => {
    const compares = QUESTIONS.filter((q) => q.type === 'compare');
    for (const q of compares) {
      expect(q.compareSpec, `${q.id} compareSpec`).toBeDefined();
      const spec = q.compareSpec!;
      expect(spec.leftLabel.trim().length).toBeGreaterThan(0);
      expect(spec.rightLabel.trim().length).toBeGreaterThan(0);
      expect(spec.items).toHaveLength(4);
      expect(q.answer).toBe('all_matched');

      const itemIds = spec.items.map((item) => item.id);
      expect(new Set(itemIds).size).toBe(4);

      for (const item of spec.items) {
        expect(['left', 'right']).toContain(item.bucket);
        expect(item.text.trim().length).toBeGreaterThan(0);
        expect(item.text.length, `${q.id} item.${item.id} (${item.text.length} chars)`).toBeLessThanOrEqual(45);
      }

      expect(spec.items.some((i) => i.bucket === 'left')).toBe(true);
      expect(spec.items.some((i) => i.bucket === 'right')).toBe(true);
      expect(q.trap_notes.default?.trim().length ?? 0).toBeGreaterThan(0);
    }
  });

  it('validates data questions have a compact 3x3 table stimulus and 4 options', () => {
    const dataQuestions = QUESTIONS.filter((q) => q.type === 'data');
    for (const q of dataQuestions) {
      expect(q.stimulus?.kind).toBe('table');
      expect(q.stimulus?.headers).toHaveLength(3);
      expect(q.stimulus?.rows).toHaveLength(3);
      for (const row of q.stimulus?.rows ?? []) {
        expect(row).toHaveLength(3);
      }
    }
  });

  it('validates mc, deduction, data, and synthesis options, answers, and trap_notes', () => {
    const singleChoice = QUESTIONS.filter(
      (q): q is Question =>
        q.type === 'mc' || q.type === 'deduction' || q.type === 'data' || q.type === 'synthesis',
    );

    for (const q of singleChoice) {
      expect(q.options).toHaveLength(4);
      expect(typeof q.answer, `${q.id} answer is string`).toBe('string');

      const optionIds = q.options.map((o) => o.id);
      expect(new Set(optionIds).size).toBe(4);
      expect(optionIds).toContain(q.answer);

      expect(q.trap_notes.default?.trim().length ?? 0).toBeGreaterThan(0);
      const distractors = optionIds.filter((id) => id !== q.answer);
      for (const distractorId of distractors) {
        expect(
          q.trap_notes[distractorId]?.trim().length ?? 0,
          `${q.id} trap_notes.${distractorId}`,
        ).toBeGreaterThan(0);
      }

      if (q.type === 'synthesis') {
        expect(q.secondary_domains?.length ?? 0).toBeGreaterThan(0);
        if (q.secondary_geo) {
          assertValidGeo(q.secondary_geo, `${q.id} secondary_geo`);
        }
      }
    }
  });

  it('enforces concise copy limits and friendly tone across all questions', () => {
    for (const q of QUESTIONS) {
      expect(
        q.explanation.length,
        `${q.id} explanation (${q.explanation.length} chars)`,
      ).toBeLessThanOrEqual(140);

      if (q.fun_fact !== undefined) {
        expect(q.fun_fact.trim().length, `${q.id} fun_fact`).toBeGreaterThan(0);
        expect(
          q.fun_fact.length,
          `${q.id} fun_fact (${q.fun_fact.length} chars)`,
        ).toBeLessThanOrEqual(150);
      }

      for (const [key, note] of Object.entries(q.trap_notes)) {
        expect(
          note.length,
          `${q.id} trap_notes.${key} (${note.length} chars)`,
        ).toBeLessThanOrEqual(140);
        expect(note.toLowerCase()).not.toContain('follow the chain');
      }
    }
  });
});
