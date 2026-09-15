"use client";

import clsx from "clsx";
import { useProgress } from "@/lib/store";
import { Check } from "@/components/icons/LineIcons";
import {
  BUCKETS,
  DIMENSIONS,
  MEASURES,
  PART_TWO,
  R1,
  bucketFor,
  bucketLetter,
  nextBucket,
  type Bucket,
} from "@/lib/route1";
import { useRoute1, domId } from "./useRoute1";

/**
 * The shared 7×3 prediction grid — one dimension per row, one measure per
 * column, one tap per cell to cycle Low → Mid → High → blank. Replaces three
 * separate 7-slider forms behind three tabs: same 21 judgements, but made in
 * one continuous pass with all three measures visible at once, so the
 * comparison the exercise is actually testing is easier to make, not harder.
 *
 * One Reveal action colours every cell at once — no per-measure reveal state
 * (CLAUDE.md #12-style single-flag pattern, applied to a grid instead of a
 * tab set).
 */
export function PredictionGrid() {
  const r1 = useRoute1();
  const choose = useProgress((s) => s.choose);
  const toggleCheck = useProgress((s) => s.toggleCheck);

  const cycle = (measureId: string, dimKey: string, current: Bucket | null) => {
    const next = nextBucket(current);
    choose(R1.predict(measureId, dimKey), next ?? "");
  };

  return (
    <div id={domId.predictGrid} className="scroll-mt-24 space-y-4">
      <div>
        <p className="text-caption font-semibold text-ink">{PART_TWO.predictHeading}</p>
        <p className="mt-0.5 text-micro text-ash">{PART_TWO.predictInstruction}</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line bg-paper p-3">
        <table className="w-full min-w-[440px] border-collapse">
          <thead>
            <tr>
              <th className="w-[46%] pb-2 pr-2 text-left text-micro font-semibold uppercase tracking-wide text-ash">
                Dimension
              </th>
              {MEASURES.map((m) => (
                <th key={m.id} className="pb-2 text-center">
                  <span className="mx-auto flex h-7 w-7 items-center justify-center rounded-lg bg-ink text-micro font-bold text-paper">
                    {m.id}
                  </span>
                  <span className="mt-1 block text-micro font-normal text-ash">
                    {r1.measureStateById(m.id).predictedCount}/{DIMENSIONS.length}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DIMENSIONS.map((d) => (
              <tr key={d.key} className="border-t border-line/70 align-top">
                <td className="py-2 pr-2">
                  <p className="text-caption font-semibold text-ink">
                    {d.name}
                    {d.inverted && (
                      <span className="ml-1 text-warn" title="Higher is worse on this row">
                        ▲
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-micro text-ash">{d.question}</p>
                </td>
                {MEASURES.map((m) => {
                  const state = r1.measureStateById(m.id);
                  const predicted = state.predictions[d.key] ?? null;
                  const actualValue = m.profile[d.key];
                  const actualBucket = bucketFor(actualValue);
                  const showActual = r1.revealedAll;
                  const miss = showActual && predicted !== null && predicted !== actualBucket;
                  const match = showActual && predicted !== null && predicted === actualBucket;
                  return (
                    <td key={m.id} className="py-2 text-center">
                      <button
                        type="button"
                        onClick={() => cycle(m.id, d.key, predicted)}
                        aria-label={`${d.name} — Measure ${m.id}: ${
                          predicted ? BUCKETS.find((b) => b.id === predicted)!.label : "not set"
                        }. Click to cycle.`}
                        className={clsx(
                          "mx-auto flex h-9 w-9 items-center justify-center rounded-lg border text-caption font-bold transition-colors duration-150",
                          match
                            ? "border-accent bg-accentSoft text-accent"
                            : miss
                              ? "border-warn/50 bg-warn/10 text-warn"
                              : predicted === "high"
                                ? "border-accent/60 bg-accent/15 text-ink"
                                : predicted === "mid"
                                  ? "border-line bg-mist text-ink"
                                  : predicted === "low"
                                    ? "border-line bg-canvas text-ash"
                                    : "border-dashed border-line bg-paper text-ash hover:border-ash",
                        )}
                      >
                        {bucketLetter(predicted)}
                      </button>
                      {showActual && (
                        <p
                          className={clsx(
                            "mt-1 text-micro font-semibold tabular-nums",
                            predicted === null ? "text-ash" : match ? "text-accent" : "text-warn",
                          )}
                        >
                          real {actualValue}
                        </p>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="rounded-lg border border-warn/40 bg-warn/5 px-3 py-1.5 text-micro text-ink">
        {PART_TWO.invertedNote}
      </p>

      <div id={domId.revealAction} className="scroll-mt-24">
        {r1.revealedAll ? (
          <p className="inline-flex items-center gap-1.5 text-caption font-semibold text-accent">
            <Check className="h-4 w-4" />
            {PART_TWO.revealedLabel}
          </p>
        ) : (
          <button type="button" onClick={() => toggleCheck(R1.revealed, true)} className="btn-accent">
            {PART_TWO.revealLabel}
          </button>
        )}
      </div>

      {r1.revealedAll && <GapSummary />}
    </div>
  );
}

/** After reveal: every missed cell, grouped by measure, with the reasoning sentence already written for it. */
function GapSummary() {
  const r1 = useRoute1();

  const byMeasure = MEASURES.map((m) => ({
    measure: m,
    misses: r1.missedCells.filter((c) => c.measure.id === m.id),
  })).filter((g) => g.misses.length > 0);

  return (
    <div className="reveal-in space-y-3">
      <p className="text-micro font-semibold uppercase tracking-wide text-ash">{PART_TWO.gapHeading}</p>

      {r1.gapCells.length === 0 ? (
        <p className="text-caption text-ash">{PART_TWO.gapNone}</p>
      ) : byMeasure.length === 0 ? (
        <p className="text-caption text-ash">{PART_TWO.gapEmpty}</p>
      ) : (
        <div className="space-y-3">
          {byMeasure.map(({ measure, misses }) => (
            <div key={measure.id} className="rounded-xl border border-line bg-canvas p-3">
              <p className="text-caption font-semibold text-ink">
                Measure {measure.id} — {measure.shortName}
              </p>
              <ul className="mt-1.5 space-y-1.5">
                {misses.map((c) => {
                  const dim = DIMENSIONS.find((d) => d.key === c.dimension)!;
                  return (
                    <li key={c.dimension} className="text-caption text-ash">
                      <span className="font-semibold text-ink">{dim.name}</span> — you said{" "}
                      {BUCKETS.find((b) => b.id === c.predicted)!.label}, real value is {c.actualValue}.{" "}
                      {measure.reveal[c.dimension]}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}

      <details className="rounded-xl border border-line bg-canvas p-3">
        <summary className="cursor-pointer text-caption font-semibold text-ink">
          {PART_TWO.allReasoningLabel}
        </summary>
        <div className="mt-2 space-y-3">
          {MEASURES.map((m) => (
            <div key={m.id}>
              <p className="text-micro font-semibold uppercase tracking-wide text-ash">
                Measure {m.id} — {m.shortName}
              </p>
              <ul className="mt-1 space-y-1">
                {DIMENSIONS.map((d) => (
                  <li key={d.key} className="text-caption text-ash">
                    <span className="font-semibold text-ink">{d.name}: </span>
                    {m.reveal[d.key]}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
