# Phase 1 implementation and publication handoff

Implementation date: **2026-09-23**. Work is on `arena/01a0d07a-rehoteq`.

## Status

**Implementation and local validation are complete; publication is intentionally pending editorial/practitioner review.** This is not a claim that Phase 1 is live or that Google has indexed it.

Phase 0 prerequisite was verified before starting: PR #10 is merged and the Pages API reported `built` for `71e1c208be68ecec30e0774915e4a01ca8f85eef` (updated 2026-09-23T22:21:13Z).

### Delivered

- Four cornerstone lessons under `/guides/`, approximately 1,500–1,650 words each including FAQs and sources.
- Four client-side calculators (the optional JAMB aggregate tool is intentionally omitted; four meets the 3–5-tool brief).
- One curated knowledge-base index with **25 entries**, each with definition, application, example, common mistake and related link.
- Matching Academy path steps, Tools cards, Guides listings, and reciprocal links from existing related spokes.
- Nine new self-canonical URLs and sitemap entries. No existing URLs renamed; no indexability changes.
- Dark/gold mobile layouts, explicit form labels, live results, error states, reset controls, row add/remove controls and readable no-JavaScript methodology.
- Pure shared JavaScript math functions and a separate UI adapter. No API keys, network requests or persistence in calculator code. No production build step or runtime dependency added.
- Existing nested anchor in the Solar Tools card fixed.
- Editorial policy clarified: educational cable candidates are not installation designs.
- CI expanded to include content regressions, calculator math and browser smoke checks. Browser dependencies install outside the repository so the existing recursive site checker never crawls them.

## URL inventory

| Path | Purpose |
|---|---|
| `/guides/solar-system-sizing-nigerian-home.html` | Load → storage → inverter → panel-energy walkthrough |
| `/guides/generator-changeover-backup-power-nigeria.html` | Source separation, red flags and professional handover |
| `/guides/cbt-term-before-checklist-nigeria.html` | Term-before internal-school CBT plan |
| `/guides/phishing-whatsapp-verification-habit-nigeria.html` | Independent verification habit, recovery and tool limits |
| `/cable-size-calculator.html` | Conservative copper/PVC reference candidate; current and run-drop checks |
| `/voltage-drop-calculator.html` | Single-phase copper steady-load voltage loss |
| `/battery-inverter-calculator.html` | Load energy, nominal bank kWh/Ah, inverter W/VA |
| `/gpa-cgpa-calculator.html` | Credit-weighted 5.0-scale examples and exact cumulative totals |
| `/knowledge-base.html` | 25-term curated A–Z |

## Methodology decisions to review

### Electrical

- Scope deliberately limited to single-phase copper, 1.5–35 mm², 100–260 V; no DC, aluminium, three-phase or buried-cable recommendation.
- Capacity table: Schneider Electrical Installation Guide G20, copper/PVC, three loaded conductors, methods B2 and C. Using the three-loaded-conductor table for the two-loaded-conductor single-phase learning estimate is disclosed as conservative within these reference methods.
- Ambient factors: G12 (30–60°C); grouping: G16 bunched/touching circuits (1–4). The default 40°C is illustrative, not a Nigerian national design temperature.
- Voltage drop: G29, R = 23.7/S Ω/km, X = 0.08 Ω/km, one-way route length, single-phase formula. The warm-conductor resistance approximation and all limits are disclosed.
- No breaker selection, fault-disconnection, short-circuit, earthing, terminal or motor-start certification. No supported match returns **no candidate**, not the largest cable.
- The 3% drop budget is editable and explicitly not presented as a Nigerian legal limit.

### Storage

- Energy is summed by appliance; reserve, efficiency, nominal bank voltage and chemistry planning DoD are explicit.
- LiFePO₄ 80%, AGM/gel/tubular 50% DoD are planning assumptions, not manufacturer warranties.
- Inverter has separate continuous W and VA targets with 25% example margin; surge is expressly outside that margin.
- Whole-bank Ah is not battery count. No interconnection instructions are given.

### GPA

- Two disclosed example mappings, 40-pass and 45-pass, not a universal Nigerian or NUC rule.
- Failed units remain in the denominator; marks are not rounded before grading.
- Prior exact quality points and units are used instead of averaging rounded GPAs.
- No official transcript, carry-over replacement policy, degree classification or admissions outcome is claimed.

## Validation evidence

All commands passed locally:

```sh
python scripts/site_check.py
# 51 HTML files / 44 sitemap URLs / 0 errors / 0 warnings

python -m unittest discover -s tests -p 'test_*.py'
# 6 content/metadata/sitemap/interlink/fragment/word-count/KB tests

node --test tests/calculators.test.cjs
# 17 formula, boundary, invalid-input and fail-closed tests
```

Browser suite: `tests/phase1_browser.cjs`.

- 12 new/hub pages checked at **360px and 1280px**, no horizontal page overflow.
- Four calculator default examples checked against expected outputs.
- Blank inputs, stale-result removal, reset, dynamic rows, unique input IDs and labels checked.
- No-match cable case and invalid GPA history checked.
- No page JavaScript errors; offline-font operation and no-JavaScript methodology checked.
- Local run used Playwright 1.58.2 and Chromium 143. The normal browser CDN was unavailable in the sandbox; a test-only Chromium package was installed outside the repository. No browser binaries or screenshots are committed.
- CI installs Playwright's pinned normal browser and executes the same smoke script.

Reproduce browser checks without adding production dependencies:

```sh
npm install --prefix /tmp/rehoteq-browser-tests playwright@1.58.2
/tmp/rehoteq-browser-tests/node_modules/.bin/playwright install --with-deps chromium
NODE_PATH=/tmp/rehoteq-browser-tests/node_modules node tests/phase1_browser.cjs
```

The test starts and closes its own local HTTP server. Set `CHROMIUM_EXECUTABLE` if using an existing compatible Chromium. Preview manually with `python -m http.server 8000 --bind 0.0.0.0`, then open `/tools.html` or `/academy.html`.

## Publication gates — owner/editor action

1. **Practitioner review:** the roadmap requires real field/training experience and expert backing. The repository supplied no approved job notes or signed article reviews. The new lessons therefore clearly label their original examples as illustrative; no installations, testimonials, certifications or personal experience were fabricated. A named competent reviewer should verify the technical material and add approved, anonymised real examples before claiming the full editorial brief is satisfied. Attribution to the editorial team does not imply signed review.
2. Review engineering assumptions against the intended local practice and supported equipment. Verify external sources and current WhatsApp/JAMB instructions before publishing; CISA material is explicitly labelled archived. Account settings and institutional grading rules may change.
3. After approval, mark the PR ready, require green checks, merge **with `--merge`**, and verify the Pages build for the merge commit. No main-branch checkout or direct push is needed.
4. In Search Console, request indexing for `/academy.html`, `/tools.html`, `/labs.html` and the nine new URLs above. Submit/check `https://rehoteq.com/sitemap.xml` and monitor “Alternate page with proper canonical.” This session has no authenticated Search Console access; no indexing request was made.
5. Record publication date and real Search Console observations below. Avoid interpreting an unobserved value as zero.

## Phase 2 measurement log

No private analytics or Search Console data was available. **Impressions/clicks are unknown, not zero.** No tracking script was added.

| Observation window | Publication/date range | Impressions | Clicks | CTR / position | Indexing / canonical status |
|---|---|---|---|---|---|
| Pre-publication baseline (existing hubs) | Owner to export | Not measured | Not measured | Not measured | Owner to inspect |
| First 7 days after publication | Pending publication | Not measured | Not measured | Not measured | Pending |
| First 28 days after publication | Pending publication | Not measured | Not measured | Not measured | Pending |

Use a per-URL Search Console export for the three hubs and nine new URLs, annotate the publication date, and retain query groups (solar sizing, cable/voltage drop, battery, GPA, CBT and phishing). Do not assert causation from a short-term change. Phase 2 research, assistants, accounts, directories and site restructuring remain out of scope.
