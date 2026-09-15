# AION Green IT — Day 11

**Module 7 (Day 2 of 2): Monitoring Software Efficiency & Sustainable Software Architecture** —
the interactive working companion for Day 11.

Day 11 is the first day built on the two-route standard: **Route 1 carries levels 1 and 2** as one
engagement, **Route 2 carries level 3**. Every route has the same shape — the case once, one
material block with all of the teaching, one task, one export.

## Routes

| Route | Levels | Case | Material | Task | Export |
|---|---|---|---|---|---|
| `/route-1-diagnose-and-decide` | 1 + 2 | DataWeave Applications | S1–S5, ~60 min | Part 1 Diagnose (~10 min: triage → escalate → deep dive) → handover → Part 2 Decide (~15 min) | `1-{name}-day11-l1l2task1.json` + `.html` |
| `/route-2-management-decision` | 3 | MetricFlow Digital Systems GmbH (worked example) → NexLayer Digital Platforms (task) | A–D, ~60 min | Four exercises, ~20 min | `1-{name}-day11-l3task1.json` + `.html` |

Neither route gates the other. Route 2 shows a soft order-suggestion banner until Route 1 has been
exported, and nothing more.

## The shape of a route

```
case brief + learner name (stated once)
      ↓
MATERIAL — one continuous block, all teaching, facilitator-led
      ↓
TASK — one continuous scroll
      Route 1: Part 1 — Diagnose → inline handover → Part 2 — Decide
      Route 2: four exercises, the board memo assembling beside them
      ↓
ONE EXPORT
```

There is no material between the two parts of Route 1: the handover is a small inline panel built
from the learner's own answers. Standards: `../CLAUDE.md` §12, `../CURRICULUM-GUIDE.md` §2–§3, and
the day-local copy in [`UX-STANDARDS.md`](UX-STANDARDS.md) §12.

## Route 1 — Diagnose & Decide (DataWeave Applications)

**Material, five sections.**

- **S1 — Monitoring with an efficiency lens.** The same telemetry asked a different question. A
  radial diagram of eight observation channels (CPU, memory, I/O, network, database access,
  background processes, scaling behaviour, idle resources), each tap-revealing what you look for
  once the question is efficiency and what a problematic pattern looks like; two posture cards
  (classic performance vs. efficiency monitoring). Sources: Google SRE Four Golden Signals, IEA
  *Energy and AI* (2025: ≈415 TWh, ≈1.5%), Koomey & Taylor / Anthesis (2015: ≈30% comatose
  servers), NRDC (2014: 12–18% utilisation), OpenTelemetry, Kepler.
- **S2 — Not all load is a problem.** An animated 24-hour load curve with four clickable bands —
  necessary (leave it), unnecessary (remove it), poorly designed (redesign it), permanently
  inefficient (re-architect or decommission it). Sources: Cunningham's technical debt, GSF
  principles, ISO/IEC 21031:2024 (SCI, named once as background).
- **S3 — Sustainable architecture and its four levers.** A grown-vs-designed architecture SVG that
  cross-fades on scroll-into-view, with a manual toggle; four lever pills (modularity, decoupling,
  right-sized scaling, efficient data flows), each with definition, failure mode, example, and the
  S1 channel that proves it moved. Sources: Lehman's laws, ISO/IEC 25010, iSAQB CPSA Module GREEN.
- **S4 — The five-way trade-off.** A pentagon radar with two toggleable profiles, five worked
  trade-off pairs, and the inverted-Risk convention introduced before Part 2 uses it. Sources: SEI
  ATAM, ISO/IEC 25010.
- **S5 — Why monitoring and architecture are decided together.** The closing rule: a finding that
  does not reach a decision is a ticket; a decision that is not measured is a belief.

**Part 1 — Diagnose, in three steps (~10 min).** Six signals is too many to analyse in full inside
the budget, so the route triages before it escalates:

1. **Triage all six** — tag the root cause (Measurement Gap / Architecture Decision) and tap the
   phrase in the signal's own text that proves it. One set-level Check reports how many of the six
   hold, never which ones (a two-way tag makes naming the wrong ones the answer). A clue marks the
   decisive phrase in every signal at once; after two genuine checks, "Show the reasoning" opens —
   recorded in the export.
2. **Escalate two** for a deeper look, with a one-line justification. This is the level-1 skill
   being tested — judging where a closer look pays off, not processing all six equally.
3. **Deep dive on those two only** — area, horizon, first step, with a per-signal Check on area
   and horizon together, the same two-checks-then-reveal pattern.

Ground truth, decisive phrases, clues and a mentor answer key (per signal, plus a set-level key for
the triage and for which pair is worth escalating) live in `lib/route1/partOne.ts`.

**Handover.** Inline, never a gate: the learner's own triage split across all six signals
("3 measurement gaps, 3 architecture decisions"), which two they escalated and the horizon split
across those, two SVG split bars, and one carried line of teaching.

**Part 2 — Decide, one continuous pass.** Five constraints stated once, then all three
situational questions shown together (A expand monitoring, B architecture review, C targeted
optimisation) — not tab-gated, so there's no re-orientation cost between them. Then one shared
7×3 prediction grid: dimensions as rows, measures as columns, each cell a click-to-cycle
Low/Mid/High button instead of a slider drag, so predicting all three side by side is a
comparison, not three separate exercises. One Reveal action colours every cell (accent = match,
warn = miss) against the real profile bucketed the same way, and a gap summary below groups the
misses by measure with the reasoning behind the real value. The ground truth is built so no
option dominates. Then the commit: three radio cards, strategic rationale, feasibility argument,
two follow-up decisions, two risks of the road not taken. The mentor key gives the curriculum model
answer (A coupled to a following architecture review) and states that a defended B or C is not
marked wrong.

**Export.** One JSON with `meta` (day, route, levels `[1,2]`, schema version), `partOne` (`triage`
— all six rows plus check/clue/reveal metadata, `escalation` — the two chosen signal ids and the
justification, `analysis` — the deep-dive workup on those two, and a `tally`) and `partTwo`
(`revealed`, and per measure: situational answer and correctness, and per dimension
`predictedBucket` / `groundTruth` / `groundTruthBucket` / `correct`, plus the commit). One
print-ready HTML report with a banner per part.

## Route 2 — Management Decision (MetricFlow → NexLayer)

**Material, four sections.**

- **A — Why this reaches a board at all.** A two-layer SVG: engineering symptoms below, six
  management levers above (controllability, scaling, quality, investment, architecture principles,
  long-term product responsibility), with no arrow terminating in the lower layer. Sources: CSRD /
  ESRS E1, EU Energy Efficiency Directive (EU/2023/1791), ISO 50001, IEA *Energy and AI*.
- **B — RACI in full.** A sandbox RACI grid (click to cycle blank → R → A → C → I) that live-validates
  exactly one A per row, flags a missing R, and asks the authority question when an Accountable
  cannot bind capacity; plus the two failure modes (diffused accountability, accountability without
  authority). Sources: RACI in IT governance / COBIT, iSAQB Module GREEN.
- **C — Holding a decision together under incomplete information.** A clickable 2×2 of four
  decision postures (information available × cost of delay), the five-part recommendation, and the
  three anchors against pilot purgatory. Sources: Snowden & Boone (HBR 2007), ISO 50001, SEI ATAM.
- **D — Worked example: MetricFlow Digital Systems GmbH.** Read-only and dark-bannered: situation,
  initial position, a reasoning SVG, the four levers, the prioritised first measure and the option
  deliberately not taken, and the short / medium / structural sequence.

**The NexLayer case** is briefed once, directly above the task, with the name field.

**Task — four exercises**, with the NexLayer Board Memo assembling beside them:

1. **Rank the guiding decisions** — three of seven: click to add, click to remove, arrows to
   reorder, full undo/redo, then justify #1. "Test my ranking" never grades the order; it asks
   whether the learner's own #1 changes what teams are required to do, with a clue behind a second
   click.
2. **The trade-off map** — five measures, two yes/no diagnostics each (momentum cost, structural
   impact). The pair of answers places the measure, which then slides into its quadrant. The check
   reports per measure, not per question, because naming which yes/no answer is wrong would be the
   answer. Undo/redo on every change, remove-and-retry on every placed measure, and a required
   one-line justification for every measure that lands in Strategic bets.
3. **RACI** for ownership of the efficiency and architecture standard — the same grid component,
   persisted, reporting structure only.
4. **The decision that cannot wait** — decision, assumption, falsifier, cost of waiting.

**Export.** JSON with `rankedDecisions`, `tradeOffMap` (answers, correctness, derived quadrant,
retries, bet line), `raci` (full grid plus validation state) and `decisionNow`; HTML as a real
board memo — recommendation, ranked decisions, the map as inline SVG plus a table, the RACI table,
and the decision required now — printable to A4.

## Shared components introduced on Day 11

- `lib/materialSection.ts` — the section type both routes use (adds `code`, `standfirst`, `body`,
  `minutes`, and a reference `detail`).
- `components/ui/MaterialBlock.tsx` — rewritten to render the diagram before the prose.
- `components/ui/MiniNav.tsx` — sticky section dots and the top progress bar.
- `components/ui/LivePanel.tsx` — a sticky deliverable column on desktop, an expandable strip on
  mobile.
- `components/ui/RaciGrid.tsx` — the interactive, structure-only-validating RACI grid.
- `components/ui/MissingList.tsx` — `MissingItem.before` opens a closed container before scrolling.
- `components/ui/RadarChart.tsx` — `ringCount` for 0–10 scales and `showGrid` for fade-in overlays.

## Standards both routes implement

- **Itemized missing items**, every one a button that scrolls to and flashes the exact field —
  opening a collapsed card or hidden tab on the way when needed.
- **Export buttons are never disabled.** From an empty state they open the missing list and jump
  to the first gap.
- **Check on demand, clue not answer.**
- **Undo/redo and retry** on every placement; completed cards stay editable.
- **No hard locks** between routes or parts.
- **Mentor tools once per route** — one auto-fill for everything, answer keys per exercise, shared
  passcode `muchson123` in plaintext on purpose. The unlock flag is session-only, so a reload
  re-locks the keys.
- **Field instructions below the label**, never only in a placeholder.
- **Material traceability** — `MaterialRefs` chips on every task step.

## Layout

```
app/
  page.tsx                          two route cards, labelled with the levels they cover
  route-1-diagnose-and-decide/      DataWeave
  route-2-management-decision/      MetricFlow → NexLayer
lib/
  routes.ts                         day identity + the two-entry registry
  materialSection.ts                shared material section type
  route1/  index · sections · material · partOne · partTwo
  route2/  index · sections · material · task
  downloadFile.ts                   exportFilename(name, levels[], taskNumber) + Blob download
  store.ts                          Zustand + localStorage (key aion-greenit-day11), useHydrated()
components/
  route1/   CaseBrief · Material · MaterialDiagrams · PartOne · SignalCard · ReportPanel ·
            Handover · PartTwo · MeasurePanel · CommitPanel · ExportBar · MentorTools · …
  route2/   Material · MaterialDiagrams · CaseBrief · Task · RankExercise · MapExercise ·
            RaciExercise · DecideNow · BoardMemo · ExportBar · MentorTools · …
  ui/       cross-day shared components
```

## Running it

```bash
npm ci
npm run dev
```

The parent `../.claude/launch.json` has a `day11-dev` entry — `preview_start` reads the parent
config, not this folder's.

```bash
npm run build
```

Static output lands in `out/`. **Never run the build while the dev server is running** — both
write to `.next`, after which the dev server serves 404s for `main-app.js` and nothing hydrates
while the page still looks fine.

```bash
npm run typecheck
```
