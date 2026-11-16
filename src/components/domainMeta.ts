import type { Domain, SkillTag } from '../types/quiz';

export const DOMAIN_ORDER: Domain[] = ['US', 'World', 'Civics', 'Geo', 'Econ'];

export const DOMAIN_LABELS: Record<Domain, { short: string; full: string }> = {
  US: { short: 'U.S.', full: 'U.S. History' },
  World: { short: 'World', full: 'World History' },
  Civics: { short: 'Civics', full: 'Gov & Civics' },
  Geo: { short: 'Geo', full: 'Geography' },
  Econ: { short: 'Econ', full: 'Economics' },
};

export const SKILL_LABELS: Record<SkillTag, string> = {
  conceptual: 'Conceptual',
  chronology: 'Chronology',
  causation: 'Causation',
  primary_source: 'Primary Source',
  data_literacy: 'Data Literacy',
  spatial_reasoning: 'Spatial Reasoning',
  synthesis: 'Synthesis',
};
