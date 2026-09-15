/**
 * Part 1 — Diagnose. Level 1, ~10 minutes.
 *
 * Three steps, not one flat list of six full workups:
 *
 *  1. Triage — all six signals, but shallow: tag the root cause and tap the
 *     phrase in the signal that proves it. Checked as a set, because the tag
 *     is a two-way choice and naming which row is wrong would be the answer.
 *  2. Escalate — the learner picks exactly two signals to take further,
 *     with a one-line reason. This is the actual level-1 skill: judging what
 *     deserves attention, not processing everything to the same depth.
 *  3. Deep dive — only the two escalated signals get the full workup: area,
 *     horizon, first step. Checked per signal, since area is a six-way choice.
 *
 * Both checks are set/pair-level and never name which specific answer is
 * wrong (CLAUDE.md #4, #12). After two genuine checks a "show the reasoning"
 * option opens — recorded in the export — so a learner who is stuck has a
 * real tumpuan (anchor) to reason from, not just repeated guessing.
 */

import type { AnswerKeyBlock } from "@/lib/answerKey";
import type { IconKey } from "@/lib/routes";
import type { MaterialSectionId } from "./sections";

// ---------------------------------------------------------------------------
// Areas
// ---------------------------------------------------------------------------

export type AreaId =
  | "monitoring"
  | "scaling"
  | "dataflows"
  | "principles"
  | "management"
  | "priorities";

export type Area = {
  id: AreaId;
  name: string;
  icon: IconKey;
  /** One line under the name — what belongs here, not what the answer is. */
  note: string;
};

export const AREAS: Area[] = [
  {
    id: "monitoring",
    name: "Monitoring",
    icon: "gauge",
    note: "Whether the system can be seen and its behaviour attributed to a cause.",
  },
  {
    id: "scaling",
    name: "Scaling",
    icon: "cycle",
    note: "The rule that decides how much capacity exists, and who owns it.",
  },
  {
    id: "dataflows",
    name: "Data Flows",
    icon: "network",
    note: "How often a record moves, is transformed, and is stored again.",
  },
  {
    id: "principles",
    name: "Architectural Principles",
    icon: "blueprint",
    note: "What teams are required to design against when they decide.",
  },
  {
    id: "management",
    name: "Management Logic",
    icon: "layers",
    note: "Whether evidence is reviewed on a cadence and turned into decisions.",
  },
  {
    id: "priorities",
    name: "Team Priorities",
    icon: "target",
    note: "What teams are measured and rewarded for delivering.",
  },
];

export const areaById = (id: AreaId): Area => AREAS.find((a) => a.id === id)!;

// ---------------------------------------------------------------------------
// Tags
// ---------------------------------------------------------------------------

export type RootCause = "measurement" | "architecture";
export type Horizon = "short" | "structural";

export const ROOT_CAUSES: { id: RootCause; label: string; hint: string }[] = [
  {
    id: "measurement",
    label: "Measurement Gap",
    hint: "We cannot see it, attribute it, or nobody reads what we do see.",
  },
  {
    id: "architecture",
    label: "Architecture Decision",
    hint: "We can see it perfectly well, and it should not exist in this shape.",
  },
];

export const HORIZONS: { id: Horizon; label: string; hint: string }[] = [
  {
    id: "short",
    label: "Short-term visible",
    hint: "A team can show a result inside a quarter without changing what others are required to do.",
  },
  {
    id: "structural",
    label: "Structural",
    hint: "It needs a rule, an owner or a contract that outlives the change itself.",
  },
];

export const HORIZON_FIELD = {
  label: "Horizon",
  instruction:
    "Ask what has to stay true after the fix. If it needs a rule or an owner to survive, it is structural.",
};

export const APPROACH_FIELD = {
  label: "Improvement approach",
  instruction:
    "One sentence: the first concrete step you would take. Name the action and its owner, not the outcome.",
  placeholder: "e.g. Architecture guild adds request attribution to the trace pipeline for the top five endpoints.",
};

export const AREA_FIELD = {
  label: "Which area does this belong to?",
  instruction:
    "Sort by the defect the signal actually reports, not by the cause you suspect behind it.",
};

// ---------------------------------------------------------------------------
// The six signals
// ---------------------------------------------------------------------------

/**
 * A signal's text, broken into tappable spans. A plain string renders as-is;
 * `{ text, decisive }` renders as a tappable phrase — `decisive: true` is the
 * one phrase that actually proves the triage tag, the rest are texture or a
 * plausible-but-wrong anchor. The clue (Step 1) marks every decisive phrase at
 * once, never singling out which row was wrong.
 */
export type Segment = string | { text: string; decisive: boolean };

export type Signal = {
  id: string;
  n: number;
  /** Short handle used in the missing list and the report. */
  title: string;
  /** Where in the platform this was observed. */
  source: string;
  /** The signal as the learner reads it, unbroken — used in the deep-dive quote. */
  text: string;
  /** The same text, broken into tappable evidence phrases for the triage step. */
  segments: Segment[];
  area: AreaId;
  rootCause: RootCause;
  horizon: Horizon;
  /** Which material sections this signal draws on. */
  material: MaterialSectionId[];

  /** Step 1 (triage) reasoning — why the root-cause tag holds. */
  triageWhy: string;
  /** Step 3 (deep dive) directional clues — never name the area or horizon. */
  areaClue: string;
  horizonClue: string;
  /** Step 3 reasoning — why the area and horizon hold, shown together. */
  analysisWhy: string;

  /** Demo answer for the mentor auto-fill. */
  sampleApproach: string;
  answerKey: AnswerKeyBlock;
};

export const SIGNALS: Signal[] = [
  {
    id: "s1",
    n: 1,
    title: "Peaks visible, causes untraceable",
    source: "Platform dashboards · weekly load report",
    text: "Load peaks are clearly visible in the dashboards, but their causes can only be traced in part — the team can see that Tuesday 14:00 is expensive, not why.",
    segments: [
      "Load peaks are clearly visible in the dashboards, but ",
      { text: "their causes can only be traced in part", decisive: true },
      " — the team can see that ",
      { text: "Tuesday 14:00 is expensive", decisive: false },
      ", not why.",
    ],
    area: "monitoring",
    rootCause: "measurement",
    horizon: "short",
    material: ["monitoring", "load"],
    triageWhy:
      "Nothing here describes a structure that should not exist — it describes an inability to see. Attribution, trace context and per-workload aggregation are instrumentation questions, not architecture ones.",
    areaClue: "Nothing here says the system is doing the wrong thing. It says the team cannot follow the trail.",
    horizonClue: "Ask whether attribution needs a new rule for other teams to follow, or just work on the existing pipeline.",
    analysisWhy:
      "Monitoring — the dashboards already report that Tuesday 14:00 is expensive; the trail from effect back to cause is broken, which is a transparency defect. Short-term visible — attribution is additive work on a pipeline that already exists, so the team can show a result inside the quarter without changing what any other team is required to do.",
    sampleApproach:
      "Platform team adds request attribution and per-workload tagging to the existing trace pipeline for the five most expensive endpoints.",
    answerKey: {
      prompt: "Signal 1 — Peaks visible, causes untraceable",
      items: [
        {
          option: "Monitoring (expected)",
          verdict: "pick",
          why: "The dashboards already report that Tuesday 14:00 is expensive. Nothing in the signal claims the load is wrong — it says the trail from effect back to cause is broken. A broken trail is a transparency defect, which is what the Monitoring area owns.",
        },
        {
          option: "Data Flows (strongest wrong answer)",
          verdict: "avoid",
          why: "Tempting, because unattributed peaks often do turn out to be a data-flow problem. But that is a hypothesis about the cause; this signal only reports that the hypothesis cannot currently be tested. Sorting by suspected cause rather than by observed defect is the most common error in this exercise.",
        },
        {
          option: "Root cause: Measurement Gap (expected)",
          verdict: "pick",
          why: "Nothing here describes a structure that should not exist — it describes an inability to see. Attribution, trace context and per-workload aggregation are instrumentation questions, not architecture ones.",
        },
        {
          option: "Horizon: Short-term visible (expected)",
          verdict: "pick",
          why: "Attribution is additive work on a pipeline that already exists. The team can show a result inside the quarter without changing what any other team is required to do.",
        },
      ],
      teachingNote:
        "Load band: unknown — and that is precisely the finding. Until the peaks are attributable, DataWeave cannot tell whether this is necessary load or poorly designed load, so any optimisation funded now is a guess. This signal is the strongest single argument for funding transparency before rework, and it is worth pointing at again during Part 2.",
    },
  },
  {
    id: "s2",
    n: 2,
    title: "Scaling rule nobody has revisited",
    source: "Three services · autoscaling configuration",
    text: "Three services scale up aggressively although their actual use is irregular and very low for most of the day. The scaling rule was set during a launch two years ago and never revisited.",
    segments: [
      "Three services scale up aggressively although ",
      { text: "their actual use is irregular and very low for most of the day", decisive: false },
      ". ",
      { text: "The scaling rule was set during a launch two years ago and never revisited", decisive: true },
      ".",
    ],
    area: "scaling",
    rootCause: "architecture",
    horizon: "structural",
    material: ["monitoring", "architecture"],
    triageWhy:
      "A scaling policy is an architecture decision expressed in configuration. It was taken deliberately, for a launch, under conditions that no longer hold — the defect is that nothing required it to be re-examined.",
    areaClue: "The demand is real. What is questionable is the rule that decides how much capacity exists to meet it.",
    horizonClue: "Ask what stops the same drift happening again after the next launch.",
    analysisWhy:
      "Scaling — the demand is genuine and irregular; what is in question is the rule that decides how much capacity exists to meet it, and the signal names that rule, its origin and the fact it has never been revisited. Structural — rewriting three rules is a day's work, but keeping them right needs a policy, a named threshold owner and a review date, or the same drift returns after the next launch.",
    sampleApproach:
      "Operations lead rewrites the three policies onto request-rate triggers with a justified minimum, and takes ownership of a six-monthly policy review.",
    answerKey: {
      prompt: "Signal 2 — Scaling rule nobody has revisited",
      items: [
        {
          option: "Scaling (expected)",
          verdict: "pick",
          why: "The demand is genuine and irregular; what is in question is the rule that decides how much capacity exists to meet it. The signal names the rule, its origin and the fact that it has never been revisited — that is the Scaling area exactly.",
        },
        {
          option: "Monitoring (strongest wrong answer)",
          verdict: "avoid",
          why: "Arguable, because nobody noticed for two years. But the signal states the facts are already visible: the aggressive scaling and the low use are both known. What is missing is not sight, it is ownership of the rule.",
        },
        {
          option: "Root cause: Architecture Decision (expected)",
          verdict: "pick",
          why: "A scaling policy is an architecture decision expressed in configuration. It was taken deliberately, for a launch, under conditions that no longer hold — the defect is that nothing required it to be re-examined.",
        },
        {
          option: "Horizon: Structural (expected)",
          verdict: "pick",
          why: "Rewriting three rules is a day's work. Keeping them right needs a policy, a named threshold owner and a review date — without those the same drift returns after the next launch, which is what makes this structural rather than short-term.",
        },
      ],
      teachingNote:
        "Load band: permanently inefficient. Capacity that exists regardless of demand is baseline consumption that never drops, so every dashboard renders it as normal. If a participant argues Short-term visible because the config change is quick, accept the observation and push back on the durability question: what stops it drifting again?",
    },
  },
  {
    id: "s3",
    n: 3,
    title: "Redundant customer-record fetch",
    source: "Customer platform · three services in sequence",
    text: "Data flows have grown historically. The same customer record is fetched, transformed and re-persisted by three services in sequence before it reaches the platform that needs it.",
    segments: [
      { text: "Data flows have grown historically", decisive: false },
      ". The same customer record is ",
      { text: "fetched, transformed and re-persisted by three services in sequence", decisive: true },
      " before it reaches the platform that needs it.",
    ],
    area: "dataflows",
    rootCause: "architecture",
    horizon: "structural",
    material: ["architecture", "load"],
    triageWhy:
      "Every hop was locally reasonable when it was added. The defect is the shape of the whole, which is visible and indefensible once you follow one record end to end.",
    areaClue: "Follow one record through the system and count how many times the same work is done.",
    horizonClue: "Ask whether one team can fix this alone, or whether it touches ownership across services.",
    analysisWhy:
      "Data Flows — one record should have one canonical path and one owner; here it has three hops, each re-fetching, re-transforming and re-persisting the same data. Structural — consolidating a grown flow touches record ownership, three services' contracts and almost certainly a migration, so it cannot be done and held without an owner for the canonical path.",
    sampleApproach:
      "Architecture guild names one owning service for the customer record and moves the two downstream consumers onto change events in the next two increments.",
    answerKey: {
      prompt: "Signal 3 — Redundant customer-record fetch",
      items: [
        {
          option: "Data Flows (expected)",
          verdict: "pick",
          why: "One record should have one canonical path and one owner. Here it has three hops, each re-fetching, re-transforming and re-persisting the same data — the textbook efficient-data-flows failure from S3.",
        },
        {
          option: "Architectural Principles (strongest wrong answer)",
          verdict: "avoid",
          why: "Defensible, and the absence of principles is genuinely why this happened. But Signal 4 already carries that absence explicitly. This signal names one specific flow, and sorting it into Principles loses the concrete finding an architecture review could act on next quarter.",
        },
        {
          option: "Root cause: Architecture Decision (expected)",
          verdict: "pick",
          why: "Every hop was locally reasonable when it was added. The defect is the shape of the whole, which is visible and indefensible once you follow one record end to end.",
        },
        {
          option: "Horizon: Structural (expected)",
          verdict: "pick",
          why: "Consolidating a grown data flow touches record ownership, three services' contracts and almost certainly a migration. It cannot be done and held without an owner for the canonical path.",
        },
      ],
      teachingNote:
        "Load band: poorly designed. The work is necessary — the record genuinely has to reach that platform — but the shape triples I/O, storage and coupling. Useful to contrast with Signal 2: both are Architecture Decisions, but one is a rule, the other is a structure.",
    },
  },
  {
    id: "s4",
    n: 4,
    title: "No binding principles for resource-friendly work",
    source: "Engineering organisation · design practice across teams",
    text: "There are no binding principles telling teams what a resource-friendly implementation looks like. Each team decides on its own, and each decision is defensible in isolation.",
    segments: [
      { text: "There are no binding principles telling teams what a resource-friendly implementation looks like", decisive: false },
      ". Each team decides on its own, and ",
      { text: "each decision is defensible in isolation", decisive: true },
      ".",
    ],
    area: "principles",
    rootCause: "architecture",
    horizon: "structural",
    material: ["architecture", "coupling"],
    triageWhy:
      "The absence of a binding principle is itself an architecture decision — the organisation has decided by default that consistency is optional. Nothing is unmeasurable here; there is simply nothing to measure against.",
    areaClue: "The problem is not any single implementation. It is that there is nothing for them to be consistent with.",
    horizonClue: "Ask what happens the day after the principles are published, if nobody owns enforcing them.",
    analysisWhy:
      "Architectural Principles — the signal describes the absence of a shared design constraint, not a defect in any one implementation; every decision being defensible in isolation is the diagnostic phrase, locally rational and collectively incoherent. Structural — principles only bind if they are owned, reviewed and applied at a gate; publishing a document with no owner reproduces exactly the state the signal describes.",
    sampleApproach:
      "Architecture board publishes five binding design rules with review criteria, and applies them to new services from the next increment onward.",
    answerKey: {
      prompt: "Signal 4 — No binding principles",
      items: [
        {
          option: "Architectural Principles (expected)",
          verdict: "pick",
          why: "The signal describes the absence of a shared design constraint, not a defect in any one implementation. Every decision being defensible in isolation is the diagnostic phrase: locally rational, collectively incoherent.",
        },
        {
          option: "Team Priorities (strongest wrong answer)",
          verdict: "avoid",
          why: "Close, and the two interact. But the signal says teams decide in isolation, not that they are aimed at the wrong goal. Priorities decide what a team works on; principles decide what 'done well' means once they do.",
        },
        {
          option: "Root cause: Architecture Decision (expected)",
          verdict: "pick",
          why: "The absence of a binding principle is itself an architecture decision — the organisation has decided by default that consistency is optional. Nothing is unmeasurable here; there is simply nothing to measure against.",
        },
        {
          option: "Horizon: Structural (expected)",
          verdict: "pick",
          why: "Principles only bind if they are owned, reviewed and applied at a gate. Publishing a document with no owner reproduces exactly the state the signal describes.",
        },
      ],
      teachingNote:
        "Load band: this one produces poorly designed and permanently inefficient load across the estate rather than being an instance of either. It is the multiplier signal — it explains why findings like Signals 2 and 3 keep reappearing in new services, and it is the reason Part 2's Option B scores so high on long-term effect.",
    },
  },
  {
    id: "s5",
    n: 5,
    title: "Monitoring data read only after failure",
    source: "Engineering management · review practice",
    text: "Monitoring data is pulled up when something breaks. No one reviews it on a cadence to steer improvement, and no meeting has it as a standing agenda item.",
    segments: [
      { text: "Monitoring data is pulled up when something breaks", decisive: false },
      ". ",
      { text: "No one reviews it on a cadence to steer improvement", decisive: true },
      ", and no meeting has it as a standing agenda item.",
    ],
    area: "management",
    rootCause: "measurement",
    horizon: "short",
    material: ["monitoring", "coupling"],
    triageWhy:
      "The data exists and is adequate. What is missing is the loop that turns it into a decision — cadence, owner, agenda. The gap sits at the point of consumption rather than collection, but it is still a gap in seeing, not a structure that should not exist.",
    areaClue: "The data exists. Ask who looks at it, when, and to decide what.",
    horizonClue: "Ask whether this needs new tooling, or just an owner and a standing invite.",
    analysisWhy:
      "Management Logic — the data exists and is adequate; what is missing is the loop that turns it into a decision, which is the ISO 50001 point that the mechanism is the review loop, not the metric. Short-term visible — a standing agenda item, a named owner and a cadence can be established this quarter without a line of code changing.",
    sampleApproach:
      "Engineering director adds a monthly efficiency review with three standing indicators and names an owner who brings one decision proposal each time.",
    answerKey: {
      prompt: "Signal 5 — Monitoring data read only after failure",
      items: [
        {
          option: "Management Logic (expected)",
          verdict: "pick",
          why: "The data exists and is adequate. What is missing is the loop that turns it into a decision — cadence, owner, agenda. That is management logic, and it is the ISO 50001 point from S5: the mechanism is the review loop, not the metric.",
        },
        {
          option: "Monitoring (strongest wrong answer)",
          verdict: "avoid",
          why: "The most common misplacement in this exercise. Signal 1 is about whether the data can answer the question; Signal 5 is about whether anyone ever asks it. Sorting both into Monitoring erases the difference between an instrument and a management routine — and they need different fixes and different owners.",
        },
        {
          option: "Root cause: Measurement Gap (expected)",
          verdict: "pick",
          why: "Measurement nobody reads is, for decision purposes, measurement that does not exist. The gap sits at the point of consumption rather than collection — but it is still a gap in seeing, not a structure that should not exist.",
        },
        {
          option: "Horizon: Short-term visible (expected)",
          verdict: "pick",
          why: "A standing agenda item, a named owner and a cadence can be established this quarter without a line of code changing. This is the cheapest high-leverage move in the whole set.",
        },
      ],
      teachingNote:
        "If a participant argues Structural here, they have a real point — a review that depends on one enthusiastic director is not durable. Accept it as defensible and draw the distinction: the *first* result is visible in weeks, which is what the Short-term visible tag records; durability is what Part 2's Option A-plus-review coupling is meant to buy.",
    },
  },
  {
    id: "s6",
    n: 6,
    title: "Teams measured only on shipped features",
    source: "Product and development organisation · objectives",
    text: "Product and development teams are measured on shipped features. Efficiency work has no route into the backlog and no one who can prioritise it.",
    segments: [
      "Product and development teams are ",
      { text: "measured on shipped features", decisive: true },
      ". ",
      { text: "Efficiency work has no route into the backlog and no one who can prioritise it", decisive: false },
      ".",
    ],
    area: "priorities",
    rootCause: "measurement",
    horizon: "structural",
    material: ["architecture", "tradeoff", "coupling"],
    triageWhy:
      "The teams are not making bad architecture calls — they are making no efficiency calls at all, because nothing measures them on it. What is unmeasured is unprioritised.",
    areaClue: "Ask what the teams are rewarded for, not what they are capable of.",
    horizonClue: "Ask whether one sprint of goodwill changes what a team is assessed on next quarter.",
    analysisWhy:
      "Team Priorities — permanently inefficient load in organisational form; the teams are capable, but nothing in their objectives, their backlog route or their approval path makes efficiency work possible to start, let alone finish. Structural — a single sprint of goodwill does not change what a team is assessed on; only an objective, a capacity allocation or an approval route changes it, and each of those outlives the person who introduced it.",
    sampleApproach:
      "Head of product adds one efficiency objective per product team for the next two quarters, with capacity ring-fenced in planning rather than left to spare time.",
    answerKey: {
      prompt: "Signal 6 — Teams measured only on shipped features",
      items: [
        {
          option: "Team Priorities (expected)",
          verdict: "pick",
          why: "Permanently inefficient load in organisational form. The teams are capable; nothing in their objectives, their backlog route or their approval path makes efficiency work possible to start, let alone finish.",
        },
        {
          option: "Management Logic (strongest wrong answer)",
          verdict: "avoid",
          why: "Very close — both are organisational. Management Logic is about whether anyone reviews the evidence; Team Priorities is about what teams are rewarded for. Signal 5 is the missing meeting; Signal 6 is the missing incentive. A cadence without an incentive produces a review everyone attends and nobody acts on, which is why they are separate findings.",
        },
        {
          option: "Root cause: Measurement Gap (expected)",
          verdict: "pick",
          why: "The teams are not making bad architecture calls — they are making no efficiency calls at all, because nothing measures them on it. What is unmeasured is unprioritised. The gap is in what the organisation measures about its own work, which is still a measurement gap.",
        },
        {
          option: "Horizon: Structural (expected)",
          verdict: "pick",
          why: "A single sprint of goodwill does not change what a team is assessed on. Only an objective, a capacity allocation or an approval route changes it, and each of those outlives the person who introduced it.",
        },
      ],
      teachingNote:
        "This is the signal where participants most often argue Architecture Decision, on the grounds that 'the organisation is the architecture'. It is a good argument and worth letting run for a minute — then draw it back to the operational test: could this be fixed by changing something in a system? No. Could it be fixed by changing what is measured and rewarded? Yes. That is the boundary the tag records.",
    },
  },
];

export const signalById = (id: string): Signal => SIGNALS.find((s) => s.id === id)!;

// ---------------------------------------------------------------------------
// Framing — three steps
// ---------------------------------------------------------------------------

export const PART_ONE = {
  id: "part-1",
  tag: "PART 1 · DIAGNOSE",
  title: "Six signals from DataWeave's platform",
  minutes: 10,
  framing:
    "These six signals were collected during a two-week review of DataWeave's platforms — from dashboards, configuration, the code base and conversations with the teams. You will not have time to analyse all six in depth, and that is deliberate: triage all six shallowly, then escalate the two that most deserve a closer look.",
} as const;

export const TRIAGE = {
  step: "Step 1",
  title: "Triage all six signals",
  minutes: 5,
  intro:
    "For each signal, tag the root cause and tap the phrase in the signal itself that proves your tag. Check the set when you're done — the check reports how many rows hold, never which ones, since the tag is a two-way choice.",
  material: ["monitoring", "load", "architecture"] as MaterialSectionId[],
  rule: {
    label: "Rule from the material — your tumpuan",
    text: "Can the team see it? If they cannot see, attribute or read it: measurement gap. If they can see it and it should not exist in this shape: architecture decision.",
  },
  becauseLabel: "Because",
  evidencePrompt: "Tap the phrase in the signal that proves your tag.",
  checkLabel: "Check my triage",
  recheckLabel: "Check again",
  clueLabel: "Need a clue?",
  clueText: "The decisive phrase in every signal is now marked. Read it again against the rule above, then retag the ones that don't fit yet.",
  revealAfter: 2,
  revealLabel: "Show the reasoning",
  whyHolds: "Why this holds",
  whyNot: "Why this doesn't hold yet",
  result: (ok: number, total: number) =>
    ok === total
      ? `All ${total} hold up — tag and evidence.`
      : `${ok} of ${total} hold up. A row holds when the tag is right and the phrase you tapped is the one that decides it.`,
  incomplete: (items: string[]) => `Before checking: ${items.join("; ")}.`,
  stale: "You've changed an answer since the last check — check again to see where you stand now.",
  revealNote: (at: number) => `Reasoning shown after ${at} check${at === 1 ? "" : "s"} — recorded in the export.`,
} as const;

export const ESCALATE = {
  step: "Step 2",
  title: "Escalate two for a deeper look",
  minutes: 1,
  limit: 2,
  intro:
    "You will not analyse all six in depth — pick the two signals that most deserve it, and say why. This is the actual skill: judging where attention pays off, not processing everything to the same depth.",
  material: ["tradeoff", "coupling"] as MaterialSectionId[],
  fullNote: "Two are already selected. Remove one first, then choose a different signal.",
  whyField: {
    label: "Why these two?",
    instruction: "One or two sentences. Argue from leverage — what's expensive or structural — not from what's easiest to write about.",
    placeholder: "e.g. These two are structural rather than short-term, and each explains findings the other four don't…",
  },
} as const;

export const ANALYSIS = {
  kicker: "Deep dive",
  step: "Step 3",
  title: "Analyse your two",
  minutes: 4,
  intro: "Full workup: area, horizon, and the first concrete step you'd take.",
  triageReminder: "Your triage",
  notTriaged: "You have not tagged this signal's root cause yet — do that in Step 1 first.",
  checkLabel: "Check area & horizon",
  recheckLabel: "Check again",
  checkScope: "Checks the area and horizon together — never your wording.",
  clueLabel: "Need a clue?",
  revealAfter: 2,
  revealLabel: "Show the reasoning",
  incomplete: "Pick an area and a horizon before checking.",
  holds: "That holds up — area and horizon both fit. Carry on with the first step.",
  wrong: "That doesn't hold up yet. Look again, or ask for a clue.",
  stale: "You've changed an answer since the last check — check again to see where you stand now.",
  whyLabel: "Why",
  revealNote: "Reasoning shown after two checks — recorded in the export.",
} as const;

// ---------------------------------------------------------------------------
// Mentor-only answer keys for the two set-level checks
// ---------------------------------------------------------------------------

export const TRIAGE_ANSWER_KEY: AnswerKeyBlock = {
  prompt: "Triage — expected tag and decisive phrase per signal",
  items: SIGNALS.map((s) => {
    const decisive = s.segments.find((seg): seg is { text: string; decisive: boolean } =>
      typeof seg !== "string" && seg.decisive,
    );
    const label = ROOT_CAUSES.find((r) => r.id === s.rootCause)!.label;
    return {
      option: `Signal ${s.n} — ${s.title}`,
      verdict: "pick" as const,
      why: `${label}, because "${decisive?.text}". ${s.triageWhy}`,
    };
  }),
  teachingNote:
    "Every row's non-decisive phrase is a plausible wrong anchor, not a distractor for its own sake — Signal 2's 'irregular and low use' reads like a measurement complaint, Signal 6's 'no route into the backlog' reads like a structural one. A learner who ends up on the wrong tag has usually anchored on that phrase.",
};

export const ESCALATION_ANSWER_KEY: AnswerKeyBlock = {
  prompt: "Which two signals are worth escalating",
  items: [
    {
      option: "Signal 2 — Scaling rule nobody has revisited",
      verdict: "pick",
      why: "Structural and concrete: a stale rule with a two-year blind spot. A strong pick if the learner's rationale is 'fix the most measurable drift'.",
    },
    {
      option: "Signal 3 — Redundant customer-record fetch",
      verdict: "pick",
      why: "The clearest structural finding with a traceable fix — one owner, one path. A strong pick if the rationale is 'this is the biggest single waste'.",
    },
    {
      option: "Signal 4 — No binding principles",
      verdict: "pick",
      why: "The multiplier signal — it explains why findings like 2 and 3 keep recurring in new services. A strong pick if the rationale is 'fix the cause of the causes'.",
    },
    {
      option: "Signal 6 — Teams measured only on shipped features",
      verdict: "pick",
      why: "The most politically expensive and highest-leverage structural finding. A strong pick only if the learner names who absorbs the cost of the change.",
    },
    {
      option: "Signal 1 — Peaks visible, causes untraceable",
      verdict: "avoid",
      why: "Real, but thin material for a deep dive: the fix is 'add attribution' and the horizon is obviously short-term. Escalating it spends a slot on the easiest signal in the set.",
    },
    {
      option: "Signal 5 — Monitoring data read only after failure",
      verdict: "avoid",
      why: "Real and cheap to fix, but its area, horizon and first step are almost a mirror of Signal 1's. Escalating both 1 and 5 spends both slots on two easy wins rather than two different structural questions.",
    },
  ],
  teachingNote:
    "There is no single correct pair. The assessment criterion is whether the written justification argues from leverage — what's expensive, structural or explains other findings — rather than from what happens to be quickest to write up. A pair of 1 and 5 with a leverage-based justification is a worse answer than a pair of 3 and 6 with none.",
};
