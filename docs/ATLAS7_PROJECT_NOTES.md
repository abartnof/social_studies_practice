# Atlas 7 — Praxis 5581 Sprint: Architecture, Design & Roadmap Notes

> Persistent project documentation for **Atlas 7**, a mobile-first Praxis 5581 (DC Social Studies: Content Knowledge) practice game built for GitHub Pages.

---

## 1. Core Requirements & User Directives

1. **Target Platform & Deployment:**
   - **GitHub Pages** static web app (`vite.config.ts` uses `base: './'` so assets resolve cleanly under any repository subpath).
   - **iPhone-First UX:** Designed primarily for one-handed portrait cell-phone play (`max-width: 430px` centered shell, `viewport-fit=cover`, `env(safe-area-inset-top/bottom)`, `56px+` touch targets, `touch-action: manipulation`).
2. **Accessibility & Dyslexia-Friendly Design:**
   - Default typography uses **Atkinson Hyperlegible** and **Lexend** (Google Fonts) with `line-height: 1.55`, `letter-spacing: 0.015em`, and left-aligned copy (never justified).
   - Includes a **Dyslexia Reading Boost** toggle on the Start Screen for extra spacing/clarity.
   - **Informative Inline SVG Infographics** (`src/components/ConceptInfographic.tsx`) accompany conceptual/stimulus questions and explanations.
3. **Aesthetic & Strict Semantic Color Discipline (Tron Retro-Futurism):**
   - Deep obsidian grid base (`#060A11`), elevated dark slate surfaces (`#0D1524`), ice-white primary text (`#EEF4FF`), muted steel secondary text (`#8CA0BC`), crisp `1px` vector hairlines.
   - **Only 4 semantic accent colors**—every color earns its place:
     - **Cyan (`#00E5FF`):** Active interactive focus, selected option/chip, current progress pip, Three.js globe wireframe & coordinate lock.
     - **Amber / Gold (`#FFB000`):** Streak multiplier (`1.5x`–`3.0x`), Q7 Wager/Risk, Near Miss (`~ 2/4`), and post-answer **Sticky Fact / Memory Hook** pop-ups.
     - **Emerald (`#2EE59D`):** Correct answer, mastery bars (`>= 70%`).
     - **Crimson (`#FF4D6D`):** Common Mix-Up (wrong answer), heart loss, weak domain alert.
4. **Anxiety-Friendly Coaching Tone & Zero Text Cutoff:**
   - Never use stressful test-prep jargon like *"Trap"* or *"Trap Triggered"* in user-facing UI; use **"Common Mix-Up"**, **"Quick Distinction"**, and **"Review Mix-Ups"**.
   - Never clip or truncate text (`white-space: normal`, `overflow-wrap: break-word`, auto-height pills/chips, scrollable `FeedbackDrawer` up to `78dvh`).
5. **Memorable "Sticky Fact" Pop-Ups:**
   - Every question includes a verified, surprising `fun_fact` (`<= 155` chars) displayed after answering as a **Memory Hook // Sticky Fact** pop-up to aid long-term retention.
6. **Persistence & Study Modes (`localStorage` key `atlas7_profile_v1`):**
   - **Adaptive Sprint:** 7 questions weighted toward weak domains while respecting official Praxis 5581 proportions (`US 29%`, `Civics 23%`, `World 22%`, `Geo 13%`, `Econ 13%`).
   - **Daily Atlas:** Deterministic `YYYY-MM-DD` seeded sprint.
   - **Domain-Specific Study:** Dedicated 7-question sprint for any single domain (`US`, `World`, `Civics`, `Geo`, `Econ`).

---

## 2. Gameplay & Scoring Mechanics

- **7-Question Pacing Arc (~3 minutes, no countdown timer):**
  - **Q1–Q2 (`mc`):** 4-option multiple choice (`100 × streakMultiplier`). Single-tap lock-in.
  - **Q3–Q4 (`ordering`):** 4-item chronological or causal sequence (dual-mode **Tap-to-Swap** + `⋮⋮` pointer drag).
    - `4/4` exact: `150 × streakMultiplier`, `+1` streak.
    - `2/4` exact (*Near Miss*): `75` flat pts, keeps heart, holds streak.
    - `0–1/4` exact: `0` pts, `-1 ♥`, resets streak.
  - **Q5–Q6 (`deduction`):** 3 progressive clues with all 4 options visible from Clue 1 (`300 / 200 / 100 × streakMultiplier`).
  - **Q7 (`synthesis`):** Two-beat finale—Category Preview + Tiered Wager (`0% Safe` / `25% Bold` / `50% Max`, with `max(score, 200)` House Stake floor when score < 200) → 4-option cross-domain synthesis.
- **Streak Multiplier:** `0–1` = `1.0x`, `2` = `1.5x`, `3` = `2.0x`, `4` = `2.5x`, `5+` = `3.0x`.
- **0-Heart "Study Finish" Fallback:** Reaching `0` hearts before Q7 offers **Finish in Study Mode** (score frozen, 0 pts, no further heart loss, completes Domain Receipt) or **End Run & View Receipt**.

---

## 3. Codebase & Module Map

```text
index.html                          # iPhone viewport, Google Fonts (Atkinson Hyperlegible, Lexend, Newsreader, JetBrains Mono)
vite.config.ts                      # base: './' for GitHub Pages subpath hosting
vitest.config.ts                    # Vitest config (src/**/*.test.{ts,tsx})
src/
  types/quiz.ts                     # Shared TypeScript contracts (Question, RunState, PlayerProfile, etc.)
  engine/
    scoring.ts                      # Streak multiplier, wager stake, evaluateAnswer (MC/Ordering/Deduction/Synthesis/Study)
    runState.ts                     # createRun, revealNextClue, setWagerTier, enterStudyMode, endRunEarly, advanceQuestion
    selector.ts                     # Adaptive weighting, Daily Atlas seeded PRNG, Domain-Specific Study selector
    storage.ts                      # localStorage persistence (atlas7_profile_v1)
    index.ts                        # Public engine barrel export
    __tests__/                      # Vitest TDD unit tests (scoring, runState, selector, storage)
  data/
    questions.ts                    # 35 fact-checked Praxis 5581 questions (7/domain, stimuli, fun_fact, trap_notes)
    __tests__/questions.test.ts     # Schema, coordinate, permutation, and copy-length integrity tests
  three/
    AtlasGlobe.tsx                  # Low-poly Tron wireframe globe + 23.4° astrolabe, SLERP focus, pulses, Q7 arc
  components/
    StartScreen.tsx                 # Adaptive Sprint, Daily Atlas, 5-Domain Focus picker, Dyslexia toggle
    TopStatusBar.tsx                # 7 progress pips, 3 hearts / Study badge, streak badge, tabular-nums score
    QuestionCard.tsx                # Polymorphic renderer for MC, Ordering (tap-to-swap + drag), Deduction, Synthesis
    ConceptInfographic.tsx          # Inline SVG concept diagrams (Fiscal/Monetary, DTM, Checks, Supply/Demand, etc.)
    FeedbackDrawer.tsx              # Slide-up Core Link + Quick Distinction + Sticky Fact pop-up + Infographic
    HeartZeroModal.tsx              # Study Mode continuation vs. early receipt modal
    DomainReceipt.tsx               # Final score, 5-domain mastery bars, thinking skills, Review Mix-Ups accordion
    domainMeta.ts                   # Shared domain & skill labels
  styles/
    theme.css                       # Tron semantic tokens, dyslexia spacing, animations
```

---

## 4. Verification Commands

```bash
npm test          # Runs Vitest suite (engine + question bank integrity)
npm run typecheck # Runs tsc --noEmit
npm run build     # Runs tsc --noEmit && vite build -> dist/
```

---

## 5. Standing Content & Randomization Rules

1. **Same Scope / Parallel Grammar:** All 4 options (and ordering items) must share the same grammatical form and category (no mixing `noun, noun, noun, concept`).
2. **No Embedded Answers in Choices:** Option pills and map pin labels must never embed the answer or giveaway parenthetical hints (e.g., `"New York"`, never `"New York (UN HQ)"`).
3. **Per-Play Randomization:** Both question sequence (Q1–Q9) AND option/chip display orders are freshly randomized on every play (while ensuring ordering/causal items never start pre-solved).
4. **Balanced Option Length:** Keep the right answer and all 3 distractors within ~1.5× length of each other so "longest option = right" never leaks the answer.
5. **Plausible Misconceptions Over Absolutes:** Avoid `"all of the above"`, `"none of the above"`, or obvious absolutes (`"always"`, `"completely"`); distractors should reflect real test-taker mix-ups.
6. **6th-Grade Plain English:** Keep prompts, options, and optional `ⓘ` explanations to 1–2 crisp sentences without academic jargon.
7. **Map Pins = Dot + Leader Line + Unclipped Label:** Every map choice renders a dot at the exact physical coordinate connected by a leader line to a generously padded, unclipped clickable label.

## 6. Roadmap & Future Ideas

1. **GitHub Pages Automation:** Add `.github/workflows/deploy.yml` to build `dist/` and publish to `gh-pages` on push to `main`.
2. **Question Bank Expansion:** Grow from 35 to 70+ Praxis 5581 questions (especially adding more `stimulus` data tables/charts for Data Literacy).
3. **Optional Sound / Haptics:** Subtle Web Audio synth ticks/chimes (muted by default, toggleable) for Tron HUD immersion.
4. **Bookmark / "Flag to Review" List:** Let the user star individual questions during a sprint to revisit from the Start Screen.
