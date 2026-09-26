# Rehoteq.com — Roadmap & Session Handoff

> Written 2026-09-23 at the end of the Phase 0 session. Next session: read this first.

---

## Phase 1 merge & deploy status — 2026-09-26

**Phase 1 is merged and deployed.** PR #11 ("Phase 1: Academy lessons, four calculators and 25-term knowledge base") merged to `main` on 2026-09-23 as merge commit `0de1027`. The "Site quality" workflow passed on that push, and the Pages API reported `built` for `0de1027` at 2026-09-23T23:33:46Z.

Re-validated on `main` at 2026-09-26: **51 HTML files / 44 sitemap URLs / 0 errors / 0 warnings**, 6 content tests pass, 17 calculator tests pass. Shipped content is four cornerstone lessons, four calculators, a 25-entry Knowledge Base, reciprocal hub/spoke links and nine sitemap additions.

### Still open after the merge — these need the owner, not another commit

1. **Practitioner/editorial review was never recorded as completed.** The content merged with its examples labelled illustrative, because approved real job notes and a signed technical review were not supplied; none were invented. Publishing happened; the review gate did not close. A named competent reviewer should still verify the technical material, and approved anonymised real examples should replace the illustrative ones before the full editorial brief in section 3 can be called satisfied.
2. **Search Console indexing has not been requested** and no traffic data has been observed — both need owner access. Treat impressions/clicks as unknown, not zero.

See [the Phase 1 handoff](docs/PHASE1-HANDOFF.md) for URLs, methodology, tests and the measurement log. The original brief below is retained for context.

---

## Recovered work — ecosystem restructure & Insight (2026-09-26)

A later session committed and pushed `arena/01a0d1ef-rehoteq` (`15f6335`, 2026-09-24) but **never opened a pull request**, so the work sat unmerged and invisible for two days. It has been recovered by cherry-picking onto the current session branch and merged through the normal PR route.

Contents: the 7-pillar ecosystem restructure (LEARN, BUILD, USE, SCHOOLS, ENGINEERING, CONNECT, INSIGHT), the new `insight.html` data-centre page, the Labs transparency rebuild (Problem / Technology / Users / Stage / Roadmap / Looking-for per product), hero-stat and counter fixes, unified navigation, ad de-duplication, and a sitemap entry for `insight.html`.

**Owner review requested — unverifiable claims.** This commit asserts figures the repository cannot substantiate: "12+ Years Engineering Practice", "8+ Live", "70+ Engines", "50+ Projects" and the founder certification pills. They were authored in the earlier session, not by the merging session, and no supporting evidence exists in the repo. Confirm each figure is true and defensible, or amend it — the same evidence standard the Phase 1 lessons were held to applies here.

**Process lesson:** pushing a branch is not shipping. A branch with no PR does not reach `main`. Open the PR in the same session that pushes the branch.

---

## 1. Current state (read before doing anything)

### Shipped to production (merged PRs — live on rehoteq.com)
- **PR #11** — Phase 1: four cornerstone lessons under `/guides/`, four client-side calculators, `knowledge-base.html` with 25 entries, Academy path steps, Tools cards and nine sitemap additions. Merged 2026-09-23 (`0de1027`); Pages `built`.
- **PR #10** — Phase 0: the `academy.html` / `tools.html` / `labs.html` hubs, homepage nav and footer wiring, and 18 spoke→hub backlinks. Merged 2026-09-23; Pages `built`.
- **PR #8** — removed broken Sitelinks `SearchAction` JSON-LD (fixed junk `/?s=` URL in Search Console).
- **PR #9** — carried PR #6 "AdSense readiness" content: `news.html` replaced with permanent Guides hub (**exposed newsdata.io API key removed from live site**), 6 original Nigerian guides + `editorial-policy.html`, `news-admin.html` & `rehoteq-blog-articles.html` deleted (still in git history), noindex on utility pages, duplicate-canonical fixes, broken `rsms-app.html` link fix.
- **Tier 1 infrastructure** — `scripts/site_check.py` + `.github/workflows/site-quality.yml` (JSON-LD parse, internal links, sitemap↔repo consistency, noindex↔sitemap invariants, title/canonical rules, single-canonical rule). Runs on every PR and push to `main`. Must stay **0 errors**.
- `_config.yml` — whitelisted `jekyll-redirect-from` + `jekyll-seo-tag` enabled. `jekyll-sitemap` deliberately OFF (hand-maintained sitemap.xml is CI-policed instead).

### Phase 0 transfer note — RESOLVED, kept for history
- The original Phase 0 commits were lost to sandbox re-provisioning; the content was **transferred as raw files via chat** (this file + `academy.html`, `tools.html`, `labs.html` + an edits script for 18 backlinks/homepage/sitemap).
- That recovery completed: the transferred work shipped as PR #10 and the hubs are live. Nothing further is outstanding from the transfer.
- **Standing lesson:** a sandbox is not storage. Push to the session branch early — anything never pushed to GitHub is gone when the sandbox is re-provisioned.

### Manual items only the owner can do
1. **Rotate the newsdata.io API key** — old key `pub_8a14…` is off the live site but remains in git history; treat as public.
2. **Repo metadata** — agent token got 403; set description + homepage manually on github.com: description `Rehoteq Technologies — school RMS, solar & electrical engineering, AI learning tools and cybersecurity for Nigeria.` homepage `https://rehoteq.com`.

---

## 2. What Phase 0 put in place (architecture to build on)

- **Three hubs:** `academy.html`, `tools.html`, `labs.html` — use `academy.html` as the visual/template reference (dark + gold theme, Outfit/Fraunces fonts, sticky nav, breadcrumb, footer with all three hubs).
- **Homepage** nav + footer Explore column + "Browse all free tools" link wired to the hubs.
- **18 spoke→hub backlinks** across calculators, guides, AI studios, student/teacher pages, JAMB CBT, PhoneLab, VoiceCoach, Research Studio, RSMS landing, Ekiti project.
- **Sitemap: 35 URLs.** Orphan decisions: `platform.html`, `flier.html`, `rehoteq-tip-svgs.html`, `rsms-onboarding.html` = **noindex, out of sitemap** (enforced by CI); `research-studio.html` indexable and now linked.
- **Education pages** (`hub`, `student-hub`, `teacher-portal`, `jamb-cbt`, `lesson-ai`, `academic-ai`) are all ranked under Academy instead of competing.

**CI invariants (do not break):**
- Indexable page ⇒ has `<title>` + exactly one `rel=canonical` + is in `sitemap.xml`.
- `noindex` page ⇒ must NOT be in sitemap.
- All internal `href`/`src` must resolve; all JSON-LD must parse.
- Run locally: `python scripts/site_check.py`.

---

## 3. Phase 1 brief — Traffic (Academy + Knowledge Base + Tools)

> Goal: pages people **find on Google by searching tasks they already have** ("solar panels for 5kW inverter", "cable size for 3kW AC"), use, then wander into the ecosystem. No generic SEO articles — original, experience-based, expert-backed only (Google guidance + assessor's explicit warning).

### A. Academy cornerstone lessons — build 4 first
Each lesson: real practitioner voice (certified electrical/solar engineer + TVET assessor), original examples from jobs/training, "what we actually do on site", when-a-professional-is-required callouts, sources, FAQ. ~1,200–2,000 words. Structure: new page + link from the matching Academy path step + canonical + sitemap entry.

| # | Lesson (working title) | Path | Must interlink with |
|---|---|---|---|
| 1 | Sizing a solar system for a Nigerian home: load list → panels → batteries → inverter (worked example) | Solar | `solar.html`, `guides/solar-load-audit-nigeria.html`, `solar-battery-guide.html` |
| 2 | Generator changeover & backup power: what safe looks like (and red flags) | Electrical | `guides/generator-changeover-electrical-safety-nigeria.html`, `electrical-safety-nigeria.html`, `wiring.html` |
| 3 | Running CBT in a Nigerian school: a term-before checklist walkthrough | Teachers/Schools | `guides/cbt-readiness-checklist-nigerian-schools.html`, `rehoteq-jamb-cbt.html`, `rehoteq-teacher-portal.html` |
| 4 | Phishing, scams & WhatsApp security: the 30-second verification habit | Digital/Cyber | `guides/whatsapp-phishing-protection-nigeria.html`, hub Cyber Quiz, RehoCheck |

URL convention decision needed (pick one, apply consistently): `/guides/<slug>.html` (stays in existing editorial section) **or** `/academy/<slug>.html` (clearer IA; needs Academy index to list them). Recommendation: **`/guides/<slug>.html`** — inherits editorial trust signals and keeps the sitemap flat; Academy path steps link in.

### B. New calculators — build these 3–5 (highest SEO leverage per hour)
Pure client-side JS, mobile-first, site theme, disclaimers ("estimate, not a substitute for a licensed professional"), **no API keys in client code** (lesson from newsdata incident).

| # | Tool | Why | Interlink with |
|---|---|---|---|
| 1 | **Cable size calculator** (load → size, with Nigerian ambient/temp guidance + voltage-drop sanity check) | Most-searched electrician query; you do this daily | wiring.html, new lesson 2, electrical-safety |
| 2 | **Voltage drop calculator** (length × current × size) | Pairs with #1; pro credibility | wiring.html, IoT guide |
| 3 | **Battery bank / inverter sizing calculator** (loads → Ah → inverter VA, with DoD notes per battery type) | "how many batteries for my house" = huge intent; distinct from solar.html's cost angle | solar.html, solar-battery-guide, lesson 1 |
| 4 | **GPA/CGPA calculator** (Nigerian 5.0 scale variants) | Student traffic feeding JAMB/RSMS orbit | rehoteq-jamb-cbt, hub, academic-ai |
| 5 (optional) | **JAMB aggregate/score calculator** | Exam-season spike | rehoteq-jamb-cbt |

DoD per tool: card on `tools.html` + Academy path step where relevant + one guide cross-link each + canonical + sitemap + CI green + works at 360px width.

### C. Knowledge Base MVP (only after A+B)
- 20–30 A–Z entries from your actual vocabulary: Ampere, AGM, BMS, Changeover, CBT, DoD, Earthing, Inverter, kWh, MPPT, Noindex(!), Source… each: Definition → practical application → calculation example → common mistakes → related links.
- Decision needed: single `knowledge-base.html` index (fast) vs individual entry pages (better long-tail SEO). Suggest: start as **one curated index page** linked from Academy; split later if volume justifies.

### D. Phase 1 definition of done
- [x] Push Phase 0, PR merged, Pages `built` (FIRST) — PR #10 verified 2026-09-23
- [x] 4 cornerstone lessons live, each ↔ path ↔ tool cross-linked — merged in PR #11
- [x] 3–5 calculators live on tools.html, linked from Academy paths — 4 calculators merged in PR #11
- [x] KB index (if time) with ≥20 entries — 25 entries, merged in PR #11
- [x] `site_check.py` 0 errors; sitemap matches reality — re-verified on `main` 2026-09-26
- [ ] **Practitioner/editorial review of the merged lessons** — owner action, still open (see status block at top)
- [ ] GSC: request indexing for `/academy.html`, `/tools.html`, `/labs.html`, new tools + lessons; watch "Alternate page" report stay quiet
- [ ] Note results (impressions/clicks) for the Phase 2 report

Everything above that is checked is merged and deployed. The two unchecked items need Search Console access and a named reviewer, so no further commit can close them.

---

## 4. Explicitly NOT in Phase 1 (deferred, don't start)

| Item | Goes in | Why deferred |
|---|---|---|
| Professionals directory, Challenges, certificates, leaderboards | Phase 3 | Needs auth/backend (static can't); empty directory looks bad |
| AI chatbot assistants (solar/ electrical/ teacher bots) | Phase 3–4 | API cost + correctness liability; calculators first |
| Survey-based research reports (School Tech Survey etc.) | Phase 2 | Needs audience to recruit respondents; start Phase 2 with a self-owned **Solar Installation Cost Tracker** built from real quotes |
| Investor Room / Ventures page | Phase 5 | Needs traction numbers; start logging deployments/schools/users now |
| URL renames / site restructure | ever, without 301 plan | GH Pages has no true 301s (jekyll-redirect-from = meta refresh); protect existing URL equity |
| Mass AI-generated articles | never | Explicit assessor + Google guidance warning |
| Moving off GitHub Pages (Cloudflare Pages, WP, VPS, etc.) | when triggered | Triggers: >~100GB/mo bandwidth (video lessons), need for real redirects/functions (Phase 3), or non-dev editors (CMS). Options comparison was done in the Tier-1 discussion — Cloudflare Pages is the natural static upgrade; static + Workers/Supabase is the Phase-3 path |

**Phase order (assessor's plan, adopted):** 1 Traffic (this doc) → 2 Authority (Labs polish, self-owned data reports) → 3 Ecosystem (directory/challenges — when backend exists) → 4 Commercial (RSMS/courses/SaaS) → 5 Investment (Investor Room with real numbers).

---

## 5. Conventions cheat-sheet

- Static HTML on GitHub Pages; every page standalone (inline CSS); no build step.
- Theme tokens: bg `#030305`, card `#0f1220`, gold `#c9a84c`/`#f0c040`, white `#f0f4ff`; fonts Outfit + Fraunces. Hub pages = reference template.
- New page checklist: `<title>` unique · meta description · **one** canonical `https://rehoteq.com/...` · JSON-LD if meaningful (parses!) · internal links both directions · sitemap entry (or `noindex` + stay out) · run `python scripts/site_check.py`.
- Never commit: API keys, tokens, `.git` history rewrites without owner sign-off.
- Push only to the session branch; PRs target `main`; merge with `--merge` (repo convention).
- Site admin email on record: rehoteq@gmail.com · WhatsApp CTAs: 07036302585 / 08166519177.
