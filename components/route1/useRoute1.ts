"use client";

import { useProgress, useHydrated } from "@/lib/store";
import type { MissingItem } from "@/components/ui/MissingList";
import {
  DIMENSIONS,
  ESCALATE,
  MEASURES,
  R1,
  SIGNALS,
  areaById,
  measureById,
  type AreaId,
  type DimensionKey,
  type Horizon,
  type Measure,
  type MeasureId,
  type RootCause,
  type Signal,
} from "@/lib/route1";

/** DOM ids the missing-item list scrolls to and flashes. */
export const domId = {
  name: "r1-name",

  // Part 1 — Step 1: triage
  partOne: "part-1",
  triage: "r1-triage",
  triageRow: (id: string) => `r1-triage-${id}`,
  triageEvidence: (id: string) => `r1-triage-${id}-evidence`,
  triageTag: (id: string) => `r1-triage-${id}-tag`,
  triageCheck: "r1-triage-check",

  // Part 1 — Step 2: escalate
  escalate: "r1-escalate",
  escalateWhy: "r1-escalate-why",

  // Part 1 — Step 3: deep dive (reuses one id shape per signal)
  analysis: (id: string) => `r1-analysis-${id}`,
  area: (id: string) => `r1-analysis-${id}-area`,
  horizon: (id: string) => `r1-analysis-${id}-horizon`,
  approach: (id: string) => `r1-analysis-${id}-approach`,

  handover: "r1-handover",

  // Part 2
  partTwo: "part-2",
  measure: (id: MeasureId) => `r1-measure-${id}`,
  situational: (id: MeasureId) => `r1-measure-${id}-situational`,
  predict: (id: MeasureId) => `r1-measure-${id}-predict`,
  reveal: (id: MeasureId) => `r1-measure-${id}-reveal`,
  commit: "r1-commit",
  pick: "r1-commit-pick",
  rationale: "r1-commit-rationale",
  feasibility: "r1-commit-feasibility",
  followUp: (n: 1 | 2) => `r1-commit-followup-${n}`,
  risk: (n: 1 | 2) => `r1-commit-risk-${n}`,

  export: "r1-export",
};

// ---------------------------------------------------------------------------
// Step 1 — triage
// ---------------------------------------------------------------------------

export type TriageRowState = {
  signal: Signal;
  tag: RootCause | null;
  /** Index into signal.segments of the tapped phrase, or null. */
  evidence: number | null;
  evidenceText: string | null;
  complete: boolean;
  /** Ground truth — tag correct and the tapped phrase is the decisive one. Only ever surfaced when reasoning is visible. */
  holds: boolean;
};

// ---------------------------------------------------------------------------
// Step 3 — deep dive
// ---------------------------------------------------------------------------

export type Analysis = {
  signal: Signal;
  triage: TriageRowState;
  area: AreaId | null;
  horizon: Horizon | null;
  approach: string;
  checks: number;
  fresh: boolean;
  verdict: "holds" | "wrong" | null;
  revealed: boolean;
  reasoningVisible: boolean;
  complete: boolean;
};

export type MeasureState = {
  measure: Measure;
  situational: string | null;
  situationalCorrect: boolean;
  prediction: Partial<Record<DimensionKey, number>>;
  predictedCount: number;
  predictionComplete: boolean;
  missingDimensions: string[];
  revealed: boolean;
};

/**
 * Joins the shared progress store to Route 1's content — both parts, one hook.
 *
 * One route has one `missing` list and one definition of done (CLAUDE.md #12).
 * Part 1's own checks (triage, then per-signal deep dive) are set/pair-level so
 * neither one ever names which specific answer is wrong — only how many hold —
 * and both open onto a "show the reasoning" option after two genuine checks,
 * which is recorded in the export.
 */
export function useRoute1() {
  const hydrated = useHydrated();
  const notes = useProgress((s) => s.notes);
  const choices = useProgress((s) => s.choices);
  const checks = useProgress((s) => s.checks);
  const seen = useProgress((s) => s.seen);
  const choose = useProgress((s) => s.choose);

  const name = notes[R1.name] ?? "";

  // -- Step 1: triage ---------------------------------------------------------
  const triage: TriageRowState[] = SIGNALS.map((signal) => {
    const rawTag = choices[R1.triageTag(signal.id)];
    const tag = rawTag === "measurement" || rawTag === "architecture" ? (rawTag as RootCause) : null;
    const rawEv = choices[R1.triageEvidence(signal.id)];
    const evidence = rawEv !== undefined && rawEv !== "" ? Number(rawEv) : null;
    const seg = evidence !== null ? signal.segments[evidence] : null;
    const evidenceText = seg && typeof seg !== "string" ? seg.text : null;
    const decisive = seg && typeof seg !== "string" ? seg.decisive : false;
    return {
      signal,
      tag,
      evidence,
      evidenceText,
      complete: !!tag && evidence !== null,
      holds: tag === signal.rootCause && decisive,
    };
  });

  const triageById = (id: string) => triage.find((t) => t.signal.id === id)!;
  const triageCompleteCount = triage.filter((t) => t.complete).length;
  const triageSignature = triage.map((t) => `${t.signal.id}:${t.tag ?? "-"}:${t.evidence ?? "-"}`).join("|");

  const triageChecks = Number(notes[R1.triageChecks] ?? "0") || 0;
  const triageLastSig = notes[R1.triageLastSig] ?? "";
  const triageLastOk = Number(notes[R1.triageLastOk] ?? "0") || 0;
  const triageFresh = triageChecks > 0 && triageLastSig === triageSignature;
  const triageAllHold = triageFresh && triageLastOk === SIGNALS.length;
  const triageClue = checks[R1.triageClue] === true;
  const triageRevealed = checks[R1.triageReveal] === true;
  const triageRevealAt = Number(notes[R1.triageRevealAt] ?? "0") || 0;
  const triageReasoningVisible = triageAllHold || triageRevealed;

  // -- Step 2: escalate ---------------------------------------------------------
  const escalated = (notes[R1.escalate] ?? "")
    .split("|")
    .filter((id) => SIGNALS.some((s) => s.id === id))
    .slice(0, ESCALATE.limit);
  const escalateWhy = (notes[R1.escalateWhy] ?? "").trim();

  // -- Step 3: deep dive (only the escalated signals) --------------------------
  const analyses: Analysis[] = escalated.map((id) => {
    const signal = SIGNALS.find((s) => s.id === id)!;
    const rawArea = choices[R1.area(id)];
    const area = rawArea ? (rawArea as AreaId) : null;
    const rawHorizon = choices[R1.horizon(id)];
    const horizon = rawHorizon === "short" || rawHorizon === "structural" ? (rawHorizon as Horizon) : null;
    const approach = (notes[R1.approach(id)] ?? "").trim();

    const signature = `${area ?? "-"}:${horizon ?? "-"}`;
    const analysisChecks = Number(notes[R1.analysisChecks(id)] ?? "0") || 0;
    const lastSig = notes[R1.analysisLastSig(id)] ?? "";
    const fresh = analysisChecks > 0 && lastSig === signature;
    const verdict: "holds" | "wrong" | null = !fresh
      ? null
      : area === signal.area && horizon === signal.horizon
        ? "holds"
        : "wrong";
    const revealed = checks[R1.analysisReveal(id)] === true;

    return {
      signal,
      triage: triageById(id),
      area,
      horizon,
      approach,
      checks: analysisChecks,
      fresh,
      verdict,
      revealed,
      reasoningVisible: verdict === "holds" || revealed,
      complete: !!area && !!horizon && approach.length > 0,
    };
  });

  const analysisById = (id: string) => analyses.find((a) => a.signal.id === id);
  const analysisCompleteCount = analyses.filter((a) => a.complete).length;

  // -- Part 2 -------------------------------------------------------------
  const revealedIds = seen[R1.revealed] ?? [];
  const rawTab = choices[R1.tab];
  const activeMeasure: MeasureId =
    rawTab === "A" || rawTab === "B" || rawTab === "C" ? (rawTab as MeasureId) : "A";

  const measureStates: MeasureState[] = MEASURES.map((measure) => {
    const prediction: Partial<Record<DimensionKey, number>> = {};
    const missingDimensions: string[] = [];
    for (const d of DIMENSIONS) {
      const raw = choices[R1.predict(measure.id, d.key)];
      const v = raw ? Number(raw) : 0;
      if (v >= 1) prediction[d.key] = v;
      else missingDimensions.push(d.name);
    }
    const situational = choices[R1.situational(measure.id)] || null;
    return {
      measure,
      situational,
      situationalCorrect: !!measure.situational.options.find((o) => o.id === situational)?.correct,
      prediction,
      predictedCount: DIMENSIONS.length - missingDimensions.length,
      predictionComplete: missingDimensions.length === 0,
      missingDimensions,
      revealed: revealedIds.includes(measure.id),
    };
  });

  const measureStateById = (id: MeasureId) => measureStates.find((m) => m.measure.id === id)!;
  const revealedCount = measureStates.filter((m) => m.revealed).length;
  const allRevealed = revealedCount === MEASURES.length;

  const rawPick = choices[R1.pick];
  const pick: MeasureId | null =
    rawPick === "A" || rawPick === "B" || rawPick === "C" ? (rawPick as MeasureId) : null;

  const rationale = (notes[R1.rationale] ?? "").trim();
  const feasibility = (notes[R1.feasibility] ?? "").trim();
  const followUp: [string, string] = [
    (notes[R1.followUp(1)] ?? "").trim(),
    (notes[R1.followUp(2)] ?? "").trim(),
  ];
  const risks: [string, string] = [
    (notes[R1.risk(1)] ?? "").trim(),
    (notes[R1.risk(2)] ?? "").trim(),
  ];

  // -- Missing list ---------------------------------------------------------
  // Standard #1: one entry per concretely-missing thing, named, in page order.
  const openTab = (id: MeasureId) => () => choose(R1.tab, id);

  const missingPartOne: MissingItem[] = [];
  for (const t of triage) {
    if (t.complete) continue;
    const who = `Signal ${t.signal.n} — ${t.signal.title}`;
    missingPartOne.push({
      id: t.tag ? domId.triageEvidence(t.signal.id) : domId.triageTag(t.signal.id),
      label: !t.tag && t.evidence === null ? `Triage for ${who} — tag and evidence` : !t.tag ? `Triage tag for ${who}` : `Triage evidence for ${who}`,
    });
  }
  if (escalated.length < ESCALATE.limit) {
    missingPartOne.push({
      id: domId.escalate,
      label: `Escalate ${ESCALATE.limit} signals for a deeper look — ${escalated.length} of ${ESCALATE.limit} chosen`,
    });
  }
  if (!escalateWhy) {
    missingPartOne.push({ id: domId.escalateWhy, label: "Justification for your two escalated signals" });
  }
  for (const a of analyses) {
    const who = `Signal ${a.signal.n} — ${a.signal.title}`;
    if (!a.area) missingPartOne.push({ id: domId.area(a.signal.id), label: `Area for ${who}` });
    if (!a.horizon) missingPartOne.push({ id: domId.horizon(a.signal.id), label: `Horizon for ${who}` });
    if (!a.approach) missingPartOne.push({ id: domId.approach(a.signal.id), label: `Improvement approach for ${who}` });
  }

  const missingPartTwo: MissingItem[] = [];
  for (const m of measureStates) {
    const who = `Measure ${m.measure.id} — ${m.measure.shortName}`;
    if (!m.situational) {
      missingPartTwo.push({
        id: domId.situational(m.measure.id),
        label: `Situational question for ${who}`,
        before: openTab(m.measure.id),
      });
    }
    if (!m.predictionComplete) {
      const n = m.missingDimensions.length;
      missingPartTwo.push({
        id: domId.predict(m.measure.id),
        label: `Prediction for ${who} — ${n} dimension${n === 1 ? "" : "s"} not set (${m.missingDimensions.join(", ")})`,
        before: openTab(m.measure.id),
      });
    }
    if (!m.revealed) {
      missingPartTwo.push({
        id: domId.reveal(m.measure.id),
        label: `Reveal the real profile for ${who}`,
        before: openTab(m.measure.id),
      });
    }
  }
  if (!pick) {
    missingPartTwo.push({ id: domId.pick, label: "Your recommendation — pick one measure to commit to" });
  }
  if (!rationale) {
    missingPartTwo.push({ id: domId.rationale, label: "Strategic rationale for your recommendation" });
  }
  if (!feasibility) {
    missingPartTwo.push({ id: domId.feasibility, label: "Feasibility argument for your recommendation" });
  }
  if (!followUp[0]) {
    missingPartTwo.push({ id: domId.followUp(1), label: "First follow-up decision this choice forces" });
  }
  if (!followUp[1]) {
    missingPartTwo.push({ id: domId.followUp(2), label: "Second follow-up decision this choice forces" });
  }
  if (!risks[0]) missingPartTwo.push({ id: domId.risk(1), label: "First risk of the road not taken" });
  if (!risks[1]) missingPartTwo.push({ id: domId.risk(2), label: "Second risk of the road not taken" });

  const missing: MissingItem[] = [
    ...(name.trim() ? [] : [{ id: domId.name, label: "Your name — needed to label the export" }]),
    ...missingPartOne,
    ...missingPartTwo,
  ];

  return {
    hydrated,
    name,

    // Step 1
    triage,
    triageById,
    triageCompleteCount,
    triageSignature,
    triageChecks,
    triageFresh,
    triageLastOk,
    triageAllHold,
    triageClue,
    triageRevealed,
    triageRevealAt,
    triageReasoningVisible,
    totalSignals: SIGNALS.length,

    // Step 2
    escalated,
    escalateWhy,

    // Step 3
    analyses,
    analysisById,
    analysisCompleteCount,

    // Part 2
    measureStates,
    measureStateById,
    activeMeasure,
    revealedCount,
    allRevealed,
    totalMeasures: MEASURES.length,
    pick,
    pickedMeasure: pick ? measureById(pick) : null,
    rationale,
    feasibility,
    followUp,
    risks,

    // route-wide
    missingPartOne,
    missingPartTwo,
    missing,
    partOneComplete: missingPartOne.length === 0,
    partTwoComplete: missingPartTwo.length === 0,
    allComplete: missing.length === 0,

    // helpers components need
    areaName: (id: AreaId | null) => (id ? areaById(id).name : "— not assigned"),
  };
}

export type Route1State = ReturnType<typeof useRoute1>;
