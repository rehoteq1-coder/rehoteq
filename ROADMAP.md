# Rehoteq.com — Roadmap & Session Handoff

> Written 2026-09-23 at the end of the Phase 0 session. Next session: read this first.

---

## 1. Current state (read before doing anything)

### Shipped to production (merged PRs — live on rehoteq.com)
- **PR #8** — removed broken Sitelinks `SearchAction` JSON-LD (fixed junk `/?s=` URL in Search Console).
- **PR #9** — carried PR #6 "AdSense readiness" content: `news.html` replaced with permanent Guides hub (**exposed newsdata.io API key removed from live site**), 6 original Nigerian guides + `editorial-policy.html`, `news-admin.html` & `rehoteq-blog-articles.html` deleted (still in git history), noindex on utility pages, duplicate-canonical fixes, broken `rsms-app.html` link fix.
- **Tier 1 infrastructure** — `scripts/site_check.py` + `.github/workflows/site-quality.yml` (JSON-LD parse, internal links, sitemap↔repo consistency, noindex↔sitemap invariants, title/canonical rules, single-canonical rule). Runs on every PR and push to `main`. Must stay **0 errors**.
- `_config.yml` — whitelisted `jekyll-redirect-from` + `jekyll-seo-tag` enabled. `jekyll-sitemap` deliberately OFF (hand-maintained sitemap.xml is CI-policed instead).

### Phase 0 transfer note (added at transfer time)
- The original Phase 0 commits were lost to sandbox re-provisioning; the content is being **transferred as raw files via chat** (this file + `academy.html`, `tools.html`, `labs.html` + an edits script for 18 backlinks/homepage/sitemap).
- After all chunks arrive: run `python scripts/site_check.py` (expect 42 files / 35 sitemap URLs / 0 errors), commit everything on **this session's branch**, push, open PR → `main`, merge after CI, verify Pages `built`.

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
- [ ] Push Phase 0, PR merged, Pages `built` (FIRST)
- [ ] 4 cornerstone lessons live, each ↔ path ↔ tool cross-linked
- [ ] 3–5 calculators live on tools.html, linked from Academy paths
- [ ] KB index (if time) with ≥20 entries
- [ ] `site_check.py` 0 errors; sitemap matches reality
- [ ] GSC: request indexing for `/academy.html`, `/tools.html`, `/labs.html`, new tools + lessons; watch "Alternate page" report stay quiet
- [ ] Note results (impressions/clicks) for the Phase 2 report

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
