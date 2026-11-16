# Praxis 5581 Practice

**Live App:** https://abartnof.github.io/social_studies_practice/

A mobile-first, high-contrast practice game for the **Praxis 5581 (Social Studies: Content Knowledge)** exam, built for GitHub Pages.

## Features

- **10-Question Runs (9 Main + 1 Final Wager):**
  - **Random Questions:** Topic probabilities match the real Praxis 5581 exam (`29%` U.S. History, `23%` Civics, `22%` World History, `13%` Geography, `13%` Economics).
  - **Adaptive Questions:** Weights weaker topics higher based on your past accuracy.
  - **Topic-Specific Practice:** Focus on any single domain (`U.S. History`, `World History`, `Gov & Civics`, `Geography`, `Economics`).
- **8 Question Formats:** Multiple Choice, Chronological Ordering, Causal Ordering, 3-Clue Deduction, Physical-Geography Map Tap, 2-Group Compare, Data Table Analysis, and Final Confidence Wager.
- **3,050+ Verified Questions:** Every item includes a `source_url` reference and a concise 1–2 sentence explanation (`ⓘ`).
- **Progress & Calibration Tracking (`localStorage`):**
  - **Leaderboard:** Top scores (Table) and cumulative points over time (Chart).
  - **Topic Mastery:** All-time accuracy bars and over-time multi-line chart.
  - **Confidence Calibration:** Horizontal accuracy vs. final-wager confidence comparison per topic.

## Local Development

```bash
npm install
npm run dev
```

## Testing & Build

```bash
npm test          # Vitest unit & question-bank integrity tests
npm run typecheck # TypeScript type check
npm run build     # Production build -> dist/
```
