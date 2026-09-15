# AION Green IT — Cross-Day UX/Interaction Standards

Twelve interaction/UX standards. The first ten were generalized from Day 5 fixes (commits `e8b0077`, `7e4f9a7`,
`294b8af`, `b2fe5cd`). This is **not curriculum content** — it says nothing about what any
route teaches. It's the minimum interaction bar every route, on every day, is expected to
clear.

Each new day is bootstrapped by copying the previous day's folder (see the day-folder
workflow), so this file travels forward automatically. If a future day needs to deviate
from one of these, that should be a deliberate, flagged decision — update this file in the
same change, don't just silently drift.

---

## 1. "Missing" messages are always specific, never generic

**Why:** "Complete Steps 1–5 to unlock export." tells the learner nothing about what's
actually left. Every gate message must enumerate the concrete incomplete parts.

**Pattern** — build a `missing: string[]` from the same completion flags that gate the
action, one human-readable line per gap:

```tsx
const missing: string[] = [];
if (!r1.step1Complete) missing.push("Step 1 — click every lifecycle stage");
if (!r1.step2Complete) missing.push("Step 2 — correctly place every real tag");
if (!r1.step3Complete) missing.push("Step 3 — run the calculator and use the data");
```

Ref: `components/route1/LifecycleExport.tsx`, `components/route1/ManagementPushback.tsx`.

---

## 2. Every "missing" item is clickable — jumps to and flashes its exact location

**Why:** naming what's missing is only half the job; the learner still has to find it on a
long page. Make the item itself the shortcut.

**Pattern** — a shared scroll+flash utility, and a shared list component that wraps it:

```ts
// lib/scrollToAndFlash.ts
export function scrollToAndFlash(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.classList.remove("anim-flash-warn");
  void el.offsetWidth; // force reflow so it restarts if already flashing
  el.classList.add("anim-flash-warn");
  window.setTimeout(() => el.classList.remove("anim-flash-warn"), 1200);
}
```

```tsx
// components/ui/MissingList.tsx
export type MissingItem = { id: string; label: string };
export function MissingList({ items, lead = "Still needed:" }: { items: MissingItem[]; lead?: string }) {
  if (items.length === 0) return null;
  return (
    <div className="text-caption text-ash">
      <p>{lead}</p>
      <ul className="mt-1 list-disc space-y-0.5 pl-5">
        {items.map((m, i) => (
          <li key={`${m.id}-${i}`}>
            <button type="button" onClick={() => scrollToAndFlash(m.id)} className="text-left underline decoration-dotted underline-offset-2 hover:text-ink">
              {m.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

Every section a `MissingList` can point to needs a stable `id` on its wrapper element (e.g.
`id="r1-export-missing"`) for `scrollToAndFlash` to target.

---

## 3. Primary action buttons (export/submit) are never actually `disabled`

**Why:** a `disabled` element can't run an `onClick`, so it can't explain *why* — it just
sits there inert. Clicking it while incomplete should be as informative as reading the
missing-list.

**Pattern:**

```tsx
<button
  type="button"
  onClick={() => (canExport ? setOpen(true) : scrollToAndFlash("r1-export-missing"))}
  className="btn-accent flex items-center gap-2"
  aria-describedby={canExport ? undefined : "r1-export-missing"}
>
  {!canExport && <Lock className="h-4 w-4" />}
  Export {TASK1.export.taskLabel}
</button>
```

Ref: identical shape in `components/route1/LifecycleExport.tsx`,
`components/route2/ProcurementExport.tsx`, `components/route3/ExecutiveExport.tsx`.

This rule is specifically for the primary export/submit CTA. Secondary controls (choice
buttons, etc.) can still use `disabled` normally — don't over-apply this.

---

## 4. Check-on-demand + clue (not the answer) for drag/classification tasks

**Why:** instant right/wrong on drop teaches nothing and gives the answer away for free.
Delaying the check until the learner asks, and giving a reasoning nudge instead of a
correction, keeps it a reasoning exercise.

**Pattern** — attach a `hint` to each classifiable item's data model; gate reveal behind an
explicit "Check" action, not the drop itself:

```ts
export type Tag = { id: string; label: string; validStages: StageId[]; hint: string };
// { id: "spare-parts", ..., hint: "Think about when a broken device actually gets fixed —
//   not when it's bought or thrown away." }
```

```tsx
{hasAnyPlacement && (
  <button type="button" onClick={() => setReviewing(true)}>
    {reviewing ? "Re-check" : "Check placements"}
  </button>
)}
...
{reviewing && !p.valid && (
  <p className="reveal-in mt-0.5 text-micro italic text-ash">{p.hint}</p>
)}
```

Ref: `components/route1/LifecycleStageExplorer.tsx`, `lib/route1.ts` (`Tag.hint`).

---

## 5. Undo for wrong drag-and-drop placements

**Why:** without a fast undo, a wrong placement means hunting back through the source pool
to fix it — that punishes experimentation instead of rewarding it.

**Pattern** — every placed item gets an × that clears the placement *and* re-arms it for
immediate re-drop:

```tsx
const clearPlacement = (tagId: string) => {
  choose(R1.tag(tagId), "");
  setSelectedTagId(tagId); // re-selected, ready to place on a different target immediately
};
```

```tsx
<button type="button" onClick={(e) => { e.stopPropagation(); onRemoveTag?.(p.tagId); }} aria-label={`Remove ${p.label} from ${s.label}`}>
  <Close className="h-2.5 w-2.5" />
</button>
```

Ref: `components/route1/TaskFlow.tsx` (`clearPlacement`), `components/route1/LifecycleStageExplorer.tsx`.

---

## 6. No hard lock between sections/routes/days — always explorable, banner suggests order

**Why:** a hard gate (hiding a whole page behind a previous export) blocks a learner who
wants to skim ahead, review, or work out of order for a legitimate reason. A soft
recommendation preserves the intended path without punishing deviation.

**Pattern** — the gate always renders its children; it only *optionally* renders a banner
above them:

```tsx
export function RouteGate({ routeN, children }: { routeN: 2 | 3; children: React.ReactNode }) {
  const unlocked = useRouteUnlocked(routeN);
  return (
    <>
      {hydrated && !unlocked && (
        <div className="mb-10 flex items-start gap-3 rounded-xl border border-line bg-canvas p-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-ash" />
          <p className="text-caption text-ash">
            Recommended: complete <Link href={prevRoute.href} className="font-semibold text-ink underline underline-offset-2">{prevRoute.tag}</Link>{" "}
            and submit its export first — this route is built to follow on from it. You can still read and work
            through everything here regardless.
          </p>
        </div>
      )}
      {children}
    </>
  );
}
```

Ref: `components/chrome/RouteGate.tsx` (read the full file before reusing — it's short).
Same principle in `components/chrome/TopBar.tsx`: a route only shows a lock icon for
`available: false` (not yet built), never for being "out of order."

---

## 7. Mentor/QA tools, passcode-gated, on every route

Two tools, both required on every route, both behind the same passcode
(`lib/mentorPasscode.ts`).

**7a. Auto-fill.** Lets a mentor or QA reviewer exercise every field and every downstream
feature (export, live reports, branching outcomes) in seconds instead of manually filling
20+ fields by hand per route.

**Pattern** — one shared passcode component, one `fillDemoAnswers` callback per route that
writes straight into that route's store slice:

```ts
// components/ui/MentorFillButton.tsx
import { MENTOR_PASSCODE } from "@/lib/mentorPasscode";
const submit = () => {
  if (code === MENTOR_PASSCODE) { onFill(); setOpen(false); } else { setError(true); }
};
```

```tsx
// components/route1/MentorTools.tsx
export function MentorTools() {
  const fillDemoAnswers = () => {
    /* markSeen(...) / choose(...) / setNote(...) for every field the route defines */
  };
  return <MentorFillButton onFill={fillDemoAnswers} />;
}
```

**7b. Answer keys.** Because the learner-facing UI only ever gives a clue and never a verdict
(standard #4), the full reasoning has to live somewhere a facilitator can reach it — otherwise
they are improvising a counter-case live in front of a cohort. `AnswerKeyButton` unlocks an
`AnswerKeyBlock` (`lib/answerKey.ts`) next to every exercise where the learner picks from fixed
options: the expected answer, a `why` for **every** option including the rejected ones, and a
`teachingNote` wherever more than one answer genuinely defends.

```ts
// lib/store.ts — session slice, deliberately outside partialize
answerKeyUnlocked: boolean;   // a reload always re-locks the keys
```

Style keys in `warn`, never the accent — the accent belongs to the learner's own interactive
surfaces, so a key can never be misread as learner content.

Both tools render once at the top of each route page (e.g. `app/route-1-.../page.tsx`), via
that route's thin `MentorTools.tsx`.

---

## 8. Field instructions live under the label, always visible — not just in the placeholder

**Why:** placeholder text disappears the instant the learner starts typing, so it can't be
the *only* explanation of what a good answer looks like.

**Pattern:**

```tsx
<label className="block">
  <span className="text-caption font-semibold text-ink">Risk 1</span>
  <p className="text-micro text-ash">
    Name one concrete risk — reference a specific vendor, lifecycle stage, or number from the case, not a generic worry.
  </p>
  <textarea ... placeholder="Risk 1..." className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2 text-body text-ink" />
</label>
```

Ref: `components/route1/AnalysisPanel.tsx`, `components/route2/DecisionPanel.tsx`,
`components/route3/ExecutiveDecisionBuilder.tsx`. If a field doesn't have a proper
`<label>` yet (some older fields only had a `placeholder`), give it one — don't just add
the caption next to nothing.

---

## 9. Stack conventions — don't reach for a new library for something the stack already covers

**Why:** keeps every day's build static-export-compatible, dependency-light, and
consistent to maintain across a growing number of day-folders.

Locked in as of Day 5/6:

- **Next.js 14 App Router, `output: "export"`** in `next.config.mjs` — ships as a static
  site, no server runtime, no image optimizer (`images: { unoptimized: true }`).
- **Zustand + its `persist` middleware to `localStorage`** is the only state mechanism —
  one global store (`lib/store.ts`), `partialize`d to exclude session-only fields. Nothing
  component-local for anything that must survive a refresh.
- **No animation library** (framer-motion, gsap) — animation is hand-written CSS keyframes
  in `styles/globals.css` (`.reveal-in`, `.anim-pop`, `.anim-flash-warn`, `.fade-up`,
  `.anim-draw`/`.anim-dash-loop`/`motifPulse` for SVGs) plus Tailwind transition utilities,
  all respecting `prefers-reduced-motion`.
- **No drag-and-drop library** (`@dnd-kit/*`, `react-beautiful-dnd`, `react-dnd`) —
  drag-and-drop is the native HTML5 Drag and Drop API (`draggable`,
  `onDragStart`/`onDragOver`/`onDrop`, `dataTransfer`), always paired with a click/keyboard
  tap-to-select fallback so it works on touch devices (native HTML5 DnD doesn't).
- **No PDF library** (`jspdf`, `pdf-lib`, `react-pdf`) — "export" is the browser's native
  `window.print()` → Save as PDF, with the suggested filename hinted via a temporary
  `document.title` swap (`lib/exportFilename.ts`).
- Only runtime deps today: `clsx`, `next`, `react`, `react-dom`, `zustand`. Adding a new one
  should be a deliberate, flagged decision, not a default reach.

---

## 10. Verification discipline: typecheck + build, then a real browser pass from a clean state

**Why:** there is no automated test suite. `npm run typecheck` and `npm run build` catch
type/build errors, not broken interaction flows — and since all state persists to
`localStorage`, testing without clearing it first can hide bugs that only a first-time
learner would ever hit.

**Checklist before calling a change done:**

```bash
npm run typecheck
npm run build
```

Then in the browser: clear the app's `localStorage` key (or use a private window), reload,
and walk the actual golden path end to end — don't just eyeball the diff. Re-check after
touching any `lib/routeN.ts` data file, since those drive the derived `stepNComplete` flags
that gate exports and are easy to silently break.

---

## 11. Every task step traces back to the material, with a clickable reference

**Why:** a learner should never meet a question whose reasoning was not taught above it.
Prose explains a concept; it does not tell anyone how to answer.

**Two halves, both required.** Each material section carries a `reasoning: string[]` — the
decision rules phrased the way the task will need them, including the rule that rules out
the plausible wrong option — rendered through `MaterialBlock` as "How to decide when this
comes up in the task". And each task step carries a `material: MaterialSectionId[]`,
rendered as `MaterialRefs` chips that scroll to that section and flash it in the accent
(`anim-flash-ref`), deliberately not the red `anim-flash-warn` used for missing items.

Coverage rule: before shipping a route, walk every task question and every selectable
option and confirm the material names the basis for choosing between them.

Ref: `lib/route1/sections.ts` (`materialAnchorId` / `materialRefs`),
`components/ui/MaterialRefs.tsx`.

---

## 12. Two routes per day, material first, one task per route — new in Day 11

**Why:** three routes meant the learner met the same company three times, with three intros,
three name fields and three exports. A first merge kept the material split either side of a
stage, which still read as two lessons stapled together. Day 11 settles on one facilitator-led
material block followed by one task, which reads as one engagement.

**Shape** (every route, from Day 11 on):

```
case brief + learner name (once)
  → MATERIAL — all teaching, one block (Route 1: S1–S5, Route 2: A–D)
  → TASK — one continuous scroll
       Route 1: Part 1 — Diagnose → inline handover → Part 2 — Decide
       Route 2: four exercises + the board memo assembling beside them
  → ONE EXPORT
```

**What it requires:**

- No material between Part 1 and Part 2. The handover (`components/route1/Handover.tsx`) is a
  small inline panel that reads the learner's own tally back to them, with a two-bar SVG — and it
  is never a gate: Part 2 is reachable with Part 1 unfinished.
- One case brief and one name field per route. Route 2's worked example (MetricFlow) is read-only
  and styled unlike any learner surface; the task case (NexLayer) is briefed once, directly above
  the task.
- One export bar and one `missing` list spanning the whole task. Entries pointing into a collapsed
  signal card, a closed measure card or a hidden tab carry `before`, which opens the container
  before scrolling (`MissingItem` in `components/ui/MissingList.tsx`).
- The JSON keeps one block per level: Route 1 exports `partOne` / `partTwo`.
- Material layout: `MiniNav` (sticky dots + progress bar) and `MaterialBlock` in the order
  *title → SVG → explanation → reasoning → callout → sources*. SVGs use `viewBox` +
  `preserveAspectRatio`, are legible at 380 px, and every hover has a tap equivalent.
- The live deliverable panel is `LivePanel`: a sticky column on desktop, a tap-to-expand strip on
  mobile.
- Completed cards stay editable with their text intact.
- Checks over yes/no answers report per item, not per question — on a binary question, "this one
  is wrong" is the answer.
- One `MentorFillButton` per route, filling everything in one click.

Export filenames list every level a route covers: `1-jane-day11-l1l2task1` (Route 1),
`1-jane-day11-l3task1` (Route 2) — `lib/downloadFile.ts`.

Canonical wording lives in `../CLAUDE.md` §12 and `../CURRICULUM-GUIDE.md` §2–§3. Days 1–10
are not retrofitted.

## 13. Triage-then-escalate on Route 1 Part 1 — new in Day 11

**Why:** six signals × full workup (area + two tags + free text, each checked) ran 15–20 minutes,
over the ~10-minute budget for Part 1 — and processing all six to equal depth isn't the level-1
skill anyway; judging which two deserve a closer look is.

**Shape, three steps:**

1. `TriageBlock.tsx` — all six signals tagged (measurement gap / architecture decision) with a
   *tapped phrase* from the signal's own text as evidence (`Signal.segments`, one `decisive: true`
   per signal). One set-level check reports only how many rows hold. A clue marks every decisive
   phrase at once. After two genuine checks, "Show the reasoning" opens per-row reasoning —
   recorded in the export (`triage.reasoningRevealed`, `reasoningRevealedAtCheck`).
2. `EscalatePicker.tsx` — exactly two signals chosen for a deeper look, plus a one-line
   justification. Deselecting a signal keeps its deep-dive answers in the store; re-selecting it
   restores them (CLAUDE.md #5).
3. `DeepDiveCard.tsx` — full workup (area, horizon, first step) on only the two escalated
   signals. Checked per signal (area+horizon together), same two-checks-then-reveal pattern.

`useRoute1.ts` computes a **signature** per check scope (all six tags+evidence for triage; one
signal's area+horizon for a deep dive) and compares it to the signature at the last check —
`triageFresh` / a deep dive's `fresh` — so an edited-but-unchecked answer never shows a stale
verdict.

The handover (`Handover.tsx`) draws its root-cause split from the *triage* step (all six, honest
to what the learner actually did) and a horizon split from the two escalated deep dives, plus
naming which two were escalated.

Canonical wording: `../CLAUDE.md` §13.
