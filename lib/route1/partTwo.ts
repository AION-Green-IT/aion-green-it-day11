/**
 * Part 2 — Decide. Level 2, ~15 minutes.
 *
 * Three competing measures under a fixed constraint set, worked as one
 * continuous pass rather than three repeated per-measure cycles:
 *
 *  1. All three situational questions, shown together (not tab-gated) — each
 *     still tests something specific to that measure, so the learner reasons
 *     about each before predicting, but there is no re-orientation cost from
 *     switching tabs three times.
 *  2. One shared 7×3 grid (dimension × measure). Each cell click-cycles
 *     through Low / Mid / High — a single tap, not a slider drag — and having
 *     all three measures side by side makes the comparison the exercise is
 *     actually about easier, not harder.
 *  3. One Reveal action for the whole grid. The gap between a predicted
 *     bucket and the real one (bucketed the same way) is the teaching
 *     material; there is no score.
 */

import type { AnswerKeyBlock } from "@/lib/answerKey";
import type { MaterialSectionId } from "./sections";

// ---------------------------------------------------------------------------
// The constraint set — stated once, above the measures
// ---------------------------------------------------------------------------

export const CONSTRAINTS = [
  {
    n: 1,
    label: "The budget is limited",
    text: "One line of measures gets funded this quarter. There is no version of this decision in which two of them run properly.",
  },
  {
    n: 2,
    label: "Teams are under delivery pressure",
    text: "Nothing has been taken out of the roadmap to make room for this work, and product management has not moved a date.",
  },
  {
    n: 3,
    label: "The data situation is incomplete",
    text: "Nobody at DataWeave can yet say, with evidence, which application is the most expensive to run or why.",
  },
  {
    n: 4,
    label: "Architectural change is expensive",
    text: "Larger structural changes are time- and coordination-intensive, and touch teams that do not report to the same person.",
  },
  {
    n: 5,
    label: "Management expects visible progress",
    text: "Without a backlog of stalled innovation. Both halves of that sentence are real, and they pull in opposite directions.",
  },
] as const;

// ---------------------------------------------------------------------------
// Dimensions
// ---------------------------------------------------------------------------

export type DimensionKey =
  | "leverage"
  | "transparency"
  | "sustainability"
  | "feasibility"
  | "acceptance"
  | "longterm"
  | "risk";

export type Dimension = {
  key: DimensionKey;
  /** Short label for the radar axis. */
  label: string;
  /** Full name in the slider list. */
  name: string;
  question: string;
  /** Risk is the one axis where a higher value is worse. */
  inverted?: boolean;
};

export const DIMENSIONS: Dimension[] = [
  {
    key: "leverage",
    label: "Leverage",
    name: "Strategic leverage",
    question: "Does this make the next decision better, or only this one?",
  },
  {
    key: "transparency",
    label: "Transparency",
    name: "Transparency impact",
    question: "After this, can we attribute cost to cause where we could not before?",
  },
  {
    key: "sustainability",
    label: "Sustainability",
    name: "Sustainability impact",
    question: "How much resource consumption does this actually remove, not defer?",
  },
  {
    key: "feasibility",
    label: "Feasibility",
    name: "Feasibility",
    question: "Can this be delivered with the capacity that genuinely exists this quarter?",
  },
  {
    key: "acceptance",
    label: "Acceptance",
    name: "Team acceptance",
    question: "Will the teams affected support it without an escalation?",
  },
  {
    key: "longterm",
    label: "Long-term",
    name: "Long-term effect",
    question: "Is the effect still there in two years without anyone repeating the work?",
  },
  {
    key: "risk",
    label: "Risk ▲",
    name: "Risk",
    question: "How likely is this to stall, overrun or be reversed? Higher is worse.",
    inverted: true,
  },
];

export const dimensionByKey = (key: DimensionKey): Dimension =>
  DIMENSIONS.find((d) => d.key === key)!;

/** Axis set for the radar (kept for the material's own trade-off pentagon, S4). */
export const RADAR_AXES = DIMENSIONS.map((d) => ({ key: d.key, label: d.label, full: d.name }));

export const PREDICT_MAX = 10;

// ---------------------------------------------------------------------------
// Buckets — the prediction unit for the shared grid
// ---------------------------------------------------------------------------

export type Bucket = "low" | "mid" | "high";

export const BUCKETS: { id: Bucket; label: string; letter: string }[] = [
  { id: "low", label: "Low", letter: "L" },
  { id: "mid", label: "Mid", letter: "M" },
  { id: "high", label: "High", letter: "H" },
];

export const bucketLabel = (b: Bucket | null): string => (b ? BUCKETS.find((x) => x.id === b)!.label : "—");
export const bucketLetter = (b: Bucket | null): string => (b ? BUCKETS.find((x) => x.id === b)!.letter : "·");

/** Cycles blank → Low → Mid → High → blank, for a single tap per cell. */
const BUCKET_CYCLE: (Bucket | null)[] = [null, "low", "mid", "high"];
export const nextBucket = (current: Bucket | null): Bucket | null =>
  BUCKET_CYCLE[(BUCKET_CYCLE.indexOf(current) + 1) % BUCKET_CYCLE.length];

/**
 * Maps a real 1–10 profile value onto the same three-bucket scale a
 * prediction uses, so a predicted bucket and the real one are directly
 * comparable. 1–3 Low, 4–7 Mid, 8–10 High.
 */
export function bucketFor(value: number): Bucket {
  if (value <= 3) return "low";
  if (value <= 7) return "mid";
  return "high";
}

// ---------------------------------------------------------------------------
// The three measures
// ---------------------------------------------------------------------------

export type MeasureId = "A" | "B" | "C";

export type SituationalOption = {
  id: string;
  text: string;
  correct?: boolean;
  /** Shown immediately after selection — explains why it does or does not follow. */
  feedback: string;
};

export type Measure = {
  id: MeasureId;
  shortName: string;
  name: string;
  summary: string;
  /** What the measure concretely consists of, for the tab body. */
  detail: string[];
  material: MaterialSectionId[];
  situational: {
    question: string;
    instruction: string;
    options: SituationalOption[];
    answerKey: AnswerKeyBlock;
  };
  profile: Record<DimensionKey, number>;
  /** One sentence per dimension, shown after reveal where the gap is large. */
  reveal: Record<DimensionKey, string>;
};

export const MEASURES: Measure[] = [
  {
    id: "A",
    shortName: "Expand monitoring",
    name: "Expand monitoring with efficiency and resource indicators",
    summary:
      "Extend the existing telemetry with efficiency and resource indicators across applications and services, aggregated so that cost can be attributed to cause.",
    detail: [
      "Define the efficiency indicators every product must expose, and the aggregation that makes them comparable between products.",
      "Add request attribution so a load peak can be traced to a workload rather than to a time of day.",
      "Establish the review in which the numbers are read — the indicators are the cheap half, the standing meeting is the half that decides whether this changes anything.",
    ],
    material: ["monitoring", "coupling"],
    situational: {
      question:
        "Management wants visible progress this quarter. If you fund only the monitoring expansion, what do they actually see in three months?",
      instruction:
        "Answer from what the measure does, not from what you hope follows it.",
      options: [
        {
          id: "a1",
          text: "A measurable drop in infrastructure cost",
          feedback:
            "No. Monitoring removes no load by itself. Anything saved in month three came from a change someone made after reading it — which is a different measure, and one you did not fund.",
        },
        {
          id: "a2",
          text: "Numbers that finally explain the load, but no reduction in it yet",
          correct: true,
          feedback:
            "Yes. That is exactly what this measure delivers and the limit of what it delivers: attribution, not reduction. Selling it as a saving is how a monitoring quarter gets read afterwards as a wasted one.",
        },
        {
          id: "a3",
          text: "Fewer incidents",
          feedback:
            "No. The incident pipeline already works — that is the classic posture from S1, and it is not what is missing here. Efficiency indicators are read on a cadence, not at 3 a.m.",
        },
        {
          id: "a4",
          text: "A simplified architecture",
          feedback:
            "No. Nothing in this measure changes a structure. It tells you which structure to change, which is valuable and is not the same thing.",
        },
      ],
      answerKey: {
        prompt: "Measure A — situational question",
        items: [
          {
            option: "Numbers that explain the load, no reduction yet (expected)",
            verdict: "pick",
            why: "The honest three-month outcome. Naming it up front is what protects the measure politically: a sponsor who expected a saving will call this a failed quarter.",
          },
          {
            option: "A measurable drop in infrastructure cost",
            verdict: "avoid",
            why: "Confuses the instrument with the intervention. Monitoring removes nothing; it locates what could be removed.",
          },
          {
            option: "Fewer incidents",
            verdict: "avoid",
            why: "Incidents are the classic posture's domain and already covered. This measure is aimed at the waste that never pages anyone.",
          },
          {
            option: "A simplified architecture",
            verdict: "avoid",
            why: "Simplification is measure B. Assuming it follows automatically from visibility is the most expensive optimism in this exercise.",
          },
        ],
        teachingNote:
          "Participants who pick the cost answer are usually arguing that transparency always produces quick wins. It sometimes does — but the exercise is about what you can promise a board, and an unpromised quick win is a bonus while a promised one you cannot deliver is a credibility loss.",
      },
    },
    profile: {
      leverage: 7,
      transparency: 10,
      sustainability: 5,
      feasibility: 8,
      acceptance: 7,
      longterm: 7,
      risk: 3,
    },
    reveal: {
      leverage:
        "7 — high but not maximal: it makes every later decision better without itself changing what teams are required to do.",
      transparency:
        "10 — this is the only measure of the three that raises transparency at all, and raising it is its entire purpose.",
      sustainability:
        "5 — middling on purpose. Attribution alone removes nothing; the saving comes from what the attribution then justifies.",
      feasibility:
        "8 — additive work on an existing pipeline, with no live customer path modified and no other team's roadmap touched.",
      acceptance:
        "7 — teams rarely object to being measured better, though some will read new indicators as surveillance until the review is framed as decisions rather than scores.",
      longterm:
        "7 — durable if the review cadence is established with it, and close to worthless if the dashboards ship without a meeting.",
      risk: "3 — the lowest risk of the three (remember: lower is better here). The realistic failure is not technical, it is that nobody acts on the output.",
    },
  },
  {
    id: "B",
    shortName: "Architecture review",
    name: "Architecture review to reduce inefficient structures",
    summary:
      "A systematic review aimed at reducing inefficient structures and unnecessary complexity, with the authority to require rework and the principles to test against.",
    detail: [
      "Identify the architecturally most problematic areas in priority order, rather than the most visible ones.",
      "Introduce binding principles for resource-friendly, scalable, maintainable systems, so the review has something to test against.",
      "Attach the review to a gate with a named owner who can require rework — a review without that authority produces a report.",
    ],
    material: ["architecture", "tradeoff", "coupling"],
    situational: {
      question:
        "The architecture review will surface more work than the quarter can absorb. What is the first thing that must exist for it to be more than a report?",
      instruction: "Think about what converts a finding into a change that actually lands.",
      options: [
        {
          id: "b1",
          text: "A larger budget",
          feedback:
            "No. More money with no one able to bind teams to the outcome produces a better-researched report. Budget is a constraint here, not the binding one.",
        },
        {
          id: "b2",
          text: "A named owner who can bind teams to the outcome",
          correct: true,
          feedback:
            "Yes. A review is only real if someone can say 'this is required' and the requirement survives contact with a product roadmap. Without that, every finding is advice.",
        },
        {
          id: "b3",
          text: "A new monitoring tool",
          feedback:
            "No — and note the trap: tooling is measure A. A review that waits for perfect data never starts, and one that produces findings nobody must act on never lands.",
        },
        {
          id: "b4",
          text: "Agreement from every product team",
          feedback:
            "No. Unanimity is not available under delivery pressure, and requiring it hands every team a veto. Consultation yes; consent from all, no.",
        },
      ],
      answerKey: {
        prompt: "Measure B — situational question",
        items: [
          {
            option: "A named owner who can bind teams (expected)",
            verdict: "pick",
            why: "Authority is the scarce input, not insight. This is the same failure mode Route 2 names as accountability without authority.",
          },
          {
            option: "A larger budget",
            verdict: "avoid",
            why: "Money buys analysis. It does not buy the ability to require rework in someone else's quarter.",
          },
          {
            option: "A new monitoring tool",
            verdict: "avoid",
            why: "Conflates the two measures. Better data improves the review's targeting; it does not make its findings binding.",
          },
          {
            option: "Agreement from every product team",
            verdict: "avoid",
            why: "Consensus as a precondition is a veto in disguise, and under delivery pressure it will always be exercised.",
          },
        ],
        teachingNote:
          "Worth naming out loud: this is the question that separates an architecture review from an architecture opinion. If a participant argues for the budget option, ask who they would send the invoice to when a team declines the rework.",
      },
    },
    profile: {
      leverage: 10,
      transparency: 4,
      sustainability: 9,
      feasibility: 3,
      acceptance: 4,
      longterm: 10,
      risk: 8,
    },
    reveal: {
      leverage:
        "10 — the highest of the three: it changes what teams are required to design against, which is the definition of leverage.",
      transparency:
        "4 — a review produces findings about specific areas, not a standing ability to attribute cost to cause.",
      sustainability:
        "9 — this is where the structural savings actually live: redundant flows removed, scaling rules re-owned, shapes fixed rather than symptoms.",
      feasibility:
        "3 — the worst of the three. It needs senior capacity, cross-team coordination and authority that may not exist yet.",
      acceptance:
        "4 — low, and honestly so: it creates work for teams already committed, and the work is invisible to their customers.",
      longterm: "10 — principles and a gate keep working after the programme ends, which is what nothing else here does.",
      risk: "8 — high (higher is worse): the most common outcome is a finished analysis and an unfunded remediation backlog.",
    },
  },
  {
    id: "C",
    shortName: "Targeted optimisation",
    name: "Targeted technical optimisation of conspicuous applications",
    summary:
      "Direct optimisation of the handful of individual applications and services that are most visibly expensive right now.",
    detail: [
      "Pick the three most conspicuous services and fix what is measurably wrong in them.",
      "Deliver a real, attributable saving inside the quarter, with no dependency on another team's roadmap.",
      "Change nothing about the rule, principle or review that produced the pattern in the first place.",
    ],
    material: ["load", "architecture", "tradeoff"],
    situational: {
      question:
        "Optimising the three most conspicuous services will produce a real, measurable saving. What is the structural risk of stopping there?",
      instruction: "Assume the saving is genuine. The question is what it does not do.",
      options: [
        {
          id: "c1",
          text: "The saving will be reversed by the next release",
          feedback:
            "Possible but not the structural risk. A specific fix usually survives the next release; what does not survive is the assumption that the estate is now fine.",
        },
        {
          id: "c2",
          text: "The same pattern will reappear elsewhere because nothing changed the rule that produced it",
          correct: true,
          feedback:
            "Yes. The three services were symptoms of a design practice nobody has changed. The fourth-most conspicuous service is already being written under the same conventions.",
        },
        {
          id: "c3",
          text: "Teams will lose motivation",
          feedback:
            "No. This is the measure teams usually enjoy — visible, self-contained, quickly finished. Popularity is precisely what makes it seductive.",
        },
        {
          id: "c4",
          text: "Monitoring costs will rise",
          feedback:
            "No. Optimisation does not meaningfully change telemetry cost, and even if it did, that is a rounding error against the point.",
        },
      ],
      answerKey: {
        prompt: "Measure C — situational question",
        items: [
          {
            option: "The pattern reappears elsewhere (expected)",
            verdict: "pick",
            why: "The saving is real and the mechanism that produced the waste is untouched, so the estate regenerates the problem at its own pace.",
          },
          {
            option: "The saving will be reversed by the next release",
            verdict: "avoid",
            why: "Sometimes true, but it describes a fragile fix rather than the structural gap. Do not let a participant settle here — it sounds structural and is not.",
          },
          {
            option: "Teams will lose motivation",
            verdict: "avoid",
            why: "The opposite is the risk: this measure is popular, finishes fast and produces a number to celebrate, which is what makes it so easy to choose.",
          },
          {
            option: "Monitoring costs will rise",
            verdict: "avoid",
            why: "Not a material effect, and it points at the wrong measure entirely.",
          },
        ],
        teachingNote:
          "C is not worthless and should never be taught as a trap. It is a real saving with no durability — the 'short-term visible but structurally weak' option the curriculum warns about. The professional error is choosing it and reporting it as if the problem were solved.",
      },
    },
    profile: {
      leverage: 3,
      transparency: 3,
      sustainability: 4,
      feasibility: 9,
      acceptance: 9,
      longterm: 2,
      risk: 4,
    },
    reveal: {
      leverage: "3 — it changes three services and nothing about how the next three get written.",
      transparency:
        "3 — you learn a lot about those three services and nothing generalisable about the estate.",
      sustainability:
        "4 — a real saving, bounded by the size of three services and eroded as new ones are added under unchanged conventions.",
      feasibility: "9 — the easiest of the three to deliver: self-contained, no cross-team dependency, finishes inside the quarter.",
      acceptance: "9 — the most popular. Visible, technical, satisfying, and nobody has to renegotiate a roadmap.",
      longterm: "2 — the lowest score in the entire matrix, and the honest one: nothing about it persists structurally.",
      risk: "4 — low delivery risk (lower is better). The real risk is political rather than technical: a celebrated saving that closes the question for two years.",
    },
  },
];

export const measureById = (id: MeasureId): Measure => MEASURES.find((m) => m.id === id)!;

// ---------------------------------------------------------------------------
// The commit panel
// ---------------------------------------------------------------------------

export const COMMIT = {
  pick: {
    label: "Which measure do you recommend?",
    instruction:
      "There is no single correct letter. You are assessed on whether the argument below survives the constraints — not on which option you choose.",
  },
  rationale: {
    label: "Strategic rationale",
    instruction: "Why this one, given the constraints above. Argue from leverage, not from convenience.",
    placeholder:
      "e.g. DataWeave cannot currently name its most expensive workload, so any rework funded this quarter is…",
    sample:
      "DataWeave cannot today name which workload is most expensive or why, so any rework funded this quarter is a bet placed with someone else's money. Measure A scores 10 on transparency against B's 4, and that gap is the whole argument: it converts next quarter's decision from an argument into an evidence review. I am recommending A explicitly coupled to an architecture review in the following quarter — A on its own scores 5 on sustainability impact, and that is the number a board will eventually ask about.",
  },
  feasibility: {
    label: "Feasibility argument",
    instruction:
      "How it survives contact with limited budget and delivery pressure. Name what you would not do in order to do this.",
    placeholder: "e.g. Instrumentation runs alongside the roadmap rather than competing with it, because…",
    sample:
      "Instrumentation is additive: it runs alongside the feature roadmap rather than taking sprints out of it, which is why A scores 8 on feasibility where B scores 3. What we will not do this quarter is start the consolidation of the redundant customer-record flow, even though it is the largest single structural finding — it needs cross-team capacity we do not have and would be the fastest route to a stalled programme.",
  },
  followUp: {
    label: (n: number) => `Follow-up decision ${n}`,
    instruction: "Decisions that become unavoidable the moment this is funded.",
    placeholder: "e.g. Who owns the efficiency indicator once it exists, and what they are allowed to require…",
    samples: [
      "By month three, management has to decide whether the architecture review gets funded capacity next quarter or whether the findings become a standing input to roadmap planning — A without that sequel is a dashboard.",
      "Someone has to own the efficiency indicators the moment they exist: the architecture guild or each product lead. If nobody owns them by the first review, the review becomes a status report.",
    ],
  },
  risk: {
    label: (n: number) => `Risk of the road not taken ${n}`,
    instruction:
      "Specifically: what goes wrong if the short-term-visible but structurally weak option is chosen instead?",
    placeholder: "e.g. Choosing C produces a saving and closes the question for two years, because…",
    samples: [
      "Choosing C produces a celebrated saving and closes the question: the three services are fixed, the conventions that produced them are not, and the fourth-most expensive service is already being written the same way.",
      "Not funding B at all means every service built during this measurement quarter is designed under unchanged conventions — so we will be measuring a problem we are still actively adding to.",
    ],
  },
  answerKey: {
    prompt: "Commit — which measure, and on what grounds",
    items: [
      {
        option: "A, explicitly coupled to a following architecture review (curriculum model answer)",
        verdict: "pick",
        why: "It creates transparency about causes rather than symptoms, improves the quality of every later architecture decision, reduces the risk of untargeted optimisation, and connects technical observation to management responsibility in one framework. The coupling is the part that matters — A on its own is a dashboard.",
      },
      {
        option: "B — architecture review first",
        verdict: "pick",
        why: "Defensible, and not marked wrong. It has the highest leverage and long-term effect in the matrix. A learner choosing it must handle feasibility 3, acceptance 4 and risk 8 explicitly — normally by naming the owner who can bind teams and by scoping the review to two areas rather than the estate.",
      },
      {
        option: "C — targeted optimisation first",
        verdict: "avoid",
        why: "Only defensible as an explicitly temporary move: a credibility purchase that buys the political room to fund A or B next. A learner who chooses C and does not name what it fails to change has made the exact error the case is built to expose.",
      },
    ],
    teachingNote:
      "Assessment criteria, in order: (1) does the argument survive the stated constraints, (2) are monitoring and architecture connected rather than treated as alternatives, (3) is short-term optimisation distinguished from structural improvement, (4) does the learner name what they are giving up. A well-argued B scores higher than a weakly-argued A. The one answer that fails is any choice presented as having no cost.",
  } as AnswerKeyBlock,
};

export const PART_TWO = {
  id: "part-2",
  tag: "PART 2 · DECIDE",
  title: "One quarter, three measures, one funded",
  minutes: 15,
  framing:
    "Management will fund exactly one of these three lines of measures. Answer all three situational questions below, then predict where each measure lands on the seven decision dimensions — one shared grid, tap Low, Mid or High per cell, all three measures side by side so you can compare as you go. Reveal once to see the real profiles against your predictions, then commit to one and defend it, including the two risks of the road you did not take.",
  situationalHeading: "Read all three before you predict",
  situationalIntro: "One question per measure — each tests something specific to that option.",
  predictHeading: "Predict all three, one grid",
  predictInstruction:
    "Tap a cell to cycle Low → Mid → High. Set what you can across all 21 cells before you reveal — the comparison only means something if there is a guess behind it.",
  revealLabel: "Reveal all three profiles",
  revealedLabel: "Profiles revealed",
  invertedNote: "Risk is inverted — on that row, High is worse, not better.",
  gapHeading: "Where your predictions and the real profiles differ",
  gapEmpty: "Every prediction you set landed in the right bucket. Read the reasoning below anyway — the reasoning matters more than getting the bucket right.",
  gapNone: "You haven't predicted anything yet — set some cells above, then reveal.",
  allReasoningLabel: "See the reasoning behind every cell, all three measures",
};
