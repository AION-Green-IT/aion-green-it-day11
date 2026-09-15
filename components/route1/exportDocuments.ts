import {
  DIMENSIONS,
  ENGAGEMENT,
  EXPORT,
  HORIZONS,
  MEASURES,
  ROOT_CAUSES,
  SIGNALS,
  areaById,
} from "@/lib/route1";
import type { Route1State } from "./useRoute1";

/**
 * The route's single export: one JSON for grading and one print-ready HTML
 * report for reading, both covering the whole engagement.
 *
 * Route 1 spans curriculum levels 1 and 2, so the document has a banner per
 * part and the JSON keeps `partOne` and `partTwo` as separate top-level blocks.
 * Part 1 itself has three steps — triage (all six), escalation (the two
 * chosen and why), and the deep dive (only those two) — kept as three blocks
 * so a grader can see the triage-level judgement separately from the depth of
 * the analysis it led to.
 */

const rootLabel = (id: string | null) => ROOT_CAUSES.find((r) => r.id === id)?.label ?? "—";
const horizonLabel = (id: string | null) => HORIZONS.find((h) => h.id === id)?.label ?? "—";
const areaLabel = (id: string | null) => (id ? areaById(id as never).name : "—");

export function buildEngagementJson(r1: Route1State, filename: string): string {
  const payload = {
    meta: {
      day: 11,
      route: 1,
      levels: EXPORT.filenameLevels,
      task: EXPORT.filenameTask,
      schemaVersion: EXPORT.schemaVersion,
      filename,
      name: r1.name,
      case: ENGAGEMENT.company,
      role: ENGAGEMENT.role,
      exportedAt: new Date().toISOString(),
    },

    partOne: {
      label: EXPORT.partOne,
      level: 1,

      triage: {
        rows: r1.triage.map((t) => ({
          id: t.signal.id,
          n: t.signal.n,
          title: t.signal.title,
          signalText: t.signal.text,
          tag: t.tag,
          tagExpected: t.signal.rootCause,
          evidenceIndex: t.evidence,
          evidenceText: t.evidenceText,
          holds: t.holds,
        })),
        checks: r1.triageChecks,
        allHold: r1.triageAllHold,
        clueUsed: r1.triageClue,
        reasoningRevealed: r1.triageRevealed,
        reasoningRevealedAtCheck: r1.triageRevealAt,
      },

      escalation: {
        signalIds: r1.escalated,
        justification: r1.escalateWhy,
      },

      analysis: r1.analyses.map((a) => ({
        id: a.signal.id,
        n: a.signal.n,
        title: a.signal.title,
        area: a.area,
        areaExpected: a.signal.area,
        areaCorrect: a.area === a.signal.area,
        horizon: a.horizon,
        horizonExpected: a.signal.horizon,
        horizonCorrect: a.horizon === a.signal.horizon,
        improvementApproach: a.approach,
        checks: a.checks,
        verdict: a.verdict,
        reasoningRevealed: a.revealed,
        complete: a.complete,
      })),

      tally: {
        triaged: r1.triageCompleteCount,
        total: SIGNALS.length,
        measurementGaps: r1.triage.filter((t) => t.complete && t.tag === "measurement").length,
        architectureDecisions: r1.triage.filter((t) => t.complete && t.tag === "architecture").length,
        escalatedCount: r1.escalated.length,
        analysedComplete: r1.analysisCompleteCount,
      },
    },

    partTwo: {
      label: EXPORT.partTwo,
      level: 2,
      measures: r1.measureStates.map((s) => ({
        id: s.measure.id,
        name: s.measure.name,
        situationalAnswer: s.situational,
        situationalText:
          s.measure.situational.options.find((o) => o.id === s.situational)?.text ?? null,
        situationalCorrect: s.situationalCorrect,
        revealed: s.revealed,
        dimensions: DIMENSIONS.map((d) => ({
          key: d.key,
          name: d.name,
          higherIsWorse: !!d.inverted,
          prediction: s.prediction[d.key] ?? null,
          groundTruth: s.measure.profile[d.key],
          gap: s.prediction[d.key] ? s.measure.profile[d.key] - s.prediction[d.key]! : null,
        })),
        meanAbsoluteGap: (() => {
          const gaps = DIMENSIONS.map((d) =>
            s.prediction[d.key] ? Math.abs(s.measure.profile[d.key] - s.prediction[d.key]!) : null,
          ).filter((g): g is number => g !== null);
          return gaps.length
            ? Number((gaps.reduce((a, b) => a + b, 0) / gaps.length).toFixed(2))
            : null;
        })(),
      })),
      commit: {
        pick: r1.pick,
        measure: r1.pickedMeasure ? r1.pickedMeasure.name : null,
        rationale: r1.rationale,
        feasibility: r1.feasibility,
        followUpDecisions: r1.followUp.filter(Boolean),
        risksOfRoadNotTaken: r1.risks.filter(Boolean),
      },
    },
  };
  return JSON.stringify(payload, null, 2);
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Standalone, print-ready HTML — no external stylesheet, prints cleanly to A4. */
export function buildEngagementHtml(r1: Route1State): string {
  const date = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const triageRows = r1.triage
    .map(
      (t) => `<tr>
      <td><strong>${t.signal.n}. ${esc(t.signal.title)}</strong><div class="muted">${esc(t.signal.source)}</div></td>
      <td class="nowrap">${esc(rootLabel(t.tag))}</td>
      <td>${t.evidenceText ? `&ldquo;${esc(t.evidenceText)}&rdquo;` : '<span class="muted">not tapped</span>'}</td>
    </tr>`,
    )
    .join("");

  const escalatedTitles = r1.escalated
    .map((id) => r1.triageById(id))
    .map((t) => `${t.signal.n}. ${esc(t.signal.title)}`)
    .join(" and ");

  const analysisRows = r1.analyses
    .map(
      (a) => `<tr>
      <td><strong>${a.signal.n}. ${esc(a.signal.title)}</strong></td>
      <td>${esc(areaLabel(a.area))}</td>
      <td class="nowrap">${esc(horizonLabel(a.horizon))}</td>
    </tr>${
      a.approach
        ? `<tr class="why"><td colspan="3"><span class="muted">First step — </span>&ldquo;${esc(a.approach)}&rdquo;</td></tr>`
        : ""
    }`,
    )
    .join("");

  const measureBlocks = r1.measureStates
    .map(
      (s) => `<h3>Measure ${s.measure.id} — ${esc(s.measure.shortName)}</h3>
    <p class="muted">${
      s.situational
        ? `Situational answer: &ldquo;${esc(
            s.measure.situational.options.find((o) => o.id === s.situational)?.text ?? "",
          )}&rdquo;`
        : "Situational question not answered."
    }</p>
    <table>
      <thead><tr><th>Dimension</th><th class="num">Predicted</th><th class="num">Real</th><th class="num">Gap</th></tr></thead>
      <tbody>${DIMENSIONS.map((d) => {
        const p = s.prediction[d.key];
        const actual = s.measure.profile[d.key];
        const gap = p ? actual - p : null;
        return `<tr>
          <td>${esc(d.name)}${d.inverted ? ' <span class="warn" title="higher is worse">&#9650;</span>' : ""}</td>
          <td class="num">${p ?? "—"}</td>
          <td class="num">${s.revealed ? actual : "—"}</td>
          <td class="num">${gap === null || !s.revealed ? "—" : gap > 0 ? `+${gap}` : gap}</td>
        </tr>`;
      }).join("")}</tbody>
    </table>`,
    )
    .join("");

  const bullets = (items: string[], empty: string) =>
    items.filter(Boolean).length
      ? `<ul>${items
          .filter(Boolean)
          .map((t) => `<li>${esc(t)}</li>`)
          .join("")}</ul>`
      : `<p class="muted">${esc(empty)}</p>`;

  const justification = [r1.rationale, r1.feasibility].filter(Boolean).join(" ");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(EXPORT.docHeading)} — ${esc(r1.name.trim() || "learner")}</title>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 40px 24px; background: #F5F6F7; color: #16191D;
         font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif; font-size: 15px; line-height: 1.6; }
  .sheet { max-width: 860px; margin: 0 auto; background: #fff; border: 1px solid #E2E5E9;
           border-radius: 16px; padding: 40px; }
  .kicker { margin: 0 0 4px; font-size: 11px; letter-spacing: .06em; text-transform: uppercase;
            font-weight: 700; color: #0E7A5A; }
  h1 { margin: 0 0 4px; font-size: 27px; line-height: 1.2; }
  .part { margin: 36px 0 6px; padding: 10px 14px; border-radius: 10px; background: #16191D;
          color: #fff; font-size: 12px; letter-spacing: .08em; text-transform: uppercase; font-weight: 700; }
  h2 { margin: 24px 0 10px; font-size: 13px; letter-spacing: .06em; text-transform: uppercase;
       color: #5E6670; border-top: 1px solid #E2E5E9; padding-top: 16px; }
  h3 { margin: 20px 0 6px; font-size: 15px; }
  .meta { margin: 0; color: #5E6670; font-size: 13px; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 13px; }
  th { text-align: left; font-size: 11px; letter-spacing: .05em; text-transform: uppercase;
       color: #5E6670; border-bottom: 1px solid #E2E5E9; padding: 8px 10px 8px 0; font-weight: 700; }
  th.num, td.num { text-align: center; width: 74px; padding-right: 0; }
  td { vertical-align: top; padding: 9px 10px 9px 0; border-bottom: 1px solid #EEF1F3; }
  tr.why td { padding-top: 0; border-bottom: 1px solid #EEF1F3; font-style: italic; }
  .warn { color: #B87514; }
  .muted { color: #5E6670; font-size: 12px; font-style: normal; }
  .nowrap { white-space: nowrap; }
  .pick { margin-top: 10px; padding: 14px 16px; border: 1px solid #E2E5E9;
          border-left: 3px solid #0E7A5A; border-radius: 10px; background: #E7F2EC; }
  .pick strong { display: block; font-size: 16px; margin-bottom: 4px; }
  .summary { margin-top: 10px; padding: 14px 16px; border-radius: 10px; background: #EEF1F3; }
  .summary strong { display: block; font-size: 16px; }
  ul { margin: 8px 0 0; padding-left: 20px; }
  li { margin-bottom: 6px; }
  footer { margin-top: 32px; border-top: 1px solid #E2E5E9; padding-top: 14px;
           color: #5E6670; font-size: 11px; }
  @media (max-width: 560px) {
    body { padding: 12px 8px; }
    .sheet { padding: 18px 14px; border-radius: 12px; }
    th.num, td.num { width: 44px; }
  }
  @media print {
    body { background: #fff; padding: 0; }
    .sheet { border: 0; border-radius: 0; padding: 0; max-width: none; }
    .part { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    h3, table { break-inside: avoid; }
    @page { margin: 16mm; }
  }
</style>
</head>
<body>
<div class="sheet">
  <p class="kicker">AION Green IT · Day 11 · Route 1 · Levels 1–2</p>
  <h1>${esc(EXPORT.docHeading)}</h1>
  <p class="meta">${esc(r1.name.trim() || "learner")} · ${esc(date)} · Case: ${esc(
    ENGAGEMENT.company,
  )} · Role: ${esc(ENGAGEMENT.role)}</p>

  <p class="part">${esc(EXPORT.partOne)}</p>

  <h2>Triage — all six signals</h2>
  <table>
    <thead><tr><th>Signal</th><th>Root cause</th><th>Decisive evidence</th></tr></thead>
    <tbody>${triageRows}</tbody>
  </table>

  <h2>Escalated for a deeper look</h2>
  ${
    r1.escalated.length
      ? `<p>${escalatedTitles || esc("—")}</p><p class="muted">${
          r1.escalateWhy ? esc(r1.escalateWhy) : "No justification written."
        }</p>`
      : `<p class="muted">No signals escalated.</p>`
  }

  <h2>Deep-dive analysis</h2>
  ${
    r1.analyses.length
      ? `<table>
    <thead><tr><th>Signal</th><th>Area</th><th>Horizon</th></tr></thead>
    <tbody>${analysisRows}</tbody>
  </table>`
      : `<p class="muted">No deep-dive analysis yet.</p>`
  }

  <h2>Split</h2>
  <div class="summary">
    <strong>${r1.triageCompleteCount} of ${r1.totalSignals} signals triaged, ${r1.analysisCompleteCount} of ${
      r1.escalated.length || 2
    } escalated signals analysed.</strong>
    <span class="muted">${r1.triage.filter((t) => t.complete && t.tag === "measurement").length} measurement gap(s) · ${
      r1.triage.filter((t) => t.complete && t.tag === "architecture").length
    } architecture decision(s) in the triage.</span>
  </div>

  <p class="part">${esc(EXPORT.partTwo)}</p>

  <h2>Prediction against the real profile</h2>
  ${measureBlocks}
  <p class="muted"><span class="warn">&#9650;</span> Risk is inverted — a higher value is worse.</p>

  <h2>Recommendation</h2>
  <div class="pick">
    <strong>${
      r1.pickedMeasure
        ? `Measure ${esc(r1.pickedMeasure.id)} — ${esc(r1.pickedMeasure.name)}`
        : "No measure committed to."
    }</strong>
    ${justification ? esc(justification) : '<span class="muted">No justification written.</span>'}
  </div>

  <h2>Follow-up decisions this choice forces</h2>
  ${bullets(r1.followUp, "Not written.")}

  <h2>Risks of the road not taken</h2>
  ${bullets(r1.risks, "Not written.")}

  <footer>
    AION Green IT — Day 11, Route 1 (Diagnose &amp; Decide), covering levels 1 and 2.
    ${esc(ENGAGEMENT.company)} is a fictional case for training use. Prepared by the learner named above.
  </footer>
</div>
</body>
</html>`;
}

/** All measures, for the side-by-side table in the HTML footer of future versions. */
export const ALL_MEASURES = MEASURES;
