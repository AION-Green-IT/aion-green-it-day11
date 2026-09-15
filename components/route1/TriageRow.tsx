"use client";

import clsx from "clsx";
import { useProgress } from "@/lib/store";
import { Check } from "@/components/icons/LineIcons";
import { ROOT_CAUSES, R1, TRIAGE } from "@/lib/route1";
import { domId, type TriageRowState } from "./useRoute1";

/**
 * One signal in the triage: a root-cause tag plus the phrase in the signal
 * that proves it.
 *
 * The phrase is the anchor. A tag on its own can be a guess; a tag that has to
 * point at something the signal actually says cannot. The phrases are inline
 * spans (not buttons) so the sentence still wraps like a sentence on a phone.
 */
export function TriageRow({
  row,
  highlightDecisive,
  showWhy,
}: {
  row: TriageRowState;
  /** The clue: mark the deciding phrase — in every row, so it never reveals which rows are wrong. */
  highlightDecisive: boolean;
  /** The reasoning, once the whole triage holds or the learner has asked for it after two checks. */
  showWhy: boolean;
}) {
  const choose = useProgress((s) => s.choose);
  const { signal } = row;

  const pick = (index: number) => choose(R1.triageEvidence(signal.id), String(index));

  return (
    <li id={domId.triageRow(signal.id)} className="scroll-mt-24 rounded-2xl border border-line bg-paper p-4">
      <div className="flex items-start gap-3">
        <span
          className={clsx(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-caption font-bold tabular-nums",
            row.complete ? "bg-accent text-paper" : "bg-mist text-ash",
          )}
        >
          {row.complete ? <Check className="h-4 w-4" /> : signal.n}
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-caption font-semibold text-ink">{signal.title}</p>
          <p className="text-micro uppercase tracking-wide text-ash">{signal.source}</p>

          <p id={domId.triageEvidence(signal.id)} className="mt-2 scroll-mt-24 text-body leading-7 text-ink">
            {signal.segments.map((seg, i) => {
              if (typeof seg === "string") return <span key={i}>{seg}</span>;
              const selected = row.evidence === i;
              const hinted = highlightDecisive && seg.decisive && !selected;
              return (
                <span
                  key={i}
                  role="button"
                  tabIndex={0}
                  aria-pressed={selected}
                  onClick={() => pick(i)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      pick(i);
                    }
                  }}
                  className={clsx(
                    "cursor-pointer rounded px-0.5 underline decoration-dotted underline-offset-4 transition-colors duration-150",
                    selected
                      ? "bg-accentSoft text-accent decoration-accent"
                      : hinted
                        ? "bg-warn/15 decoration-warn"
                        : "decoration-ash/70 hover:bg-mist",
                  )}
                >
                  {seg.text}
                </span>
              );
            })}
          </p>

          <div id={domId.triageTag(signal.id)} className="mt-3 flex scroll-mt-24 flex-wrap gap-2">
            {ROOT_CAUSES.map((rc) => {
              const on = row.tag === rc.id;
              return (
                <button
                  key={rc.id}
                  type="button"
                  onClick={() => choose(R1.triageTag(signal.id), rc.id)}
                  aria-pressed={on}
                  title={rc.hint}
                  className={clsx(
                    "rounded-xl border px-3 py-1.5 text-caption font-semibold transition-colors duration-150",
                    on ? "border-accent bg-accentSoft text-accent" : "border-line bg-canvas text-ink hover:border-ash",
                  )}
                >
                  {rc.label}
                </button>
              );
            })}
          </div>

          <p className="mt-2 text-micro text-ash">
            {row.evidenceText ? (
              <>
                {TRIAGE.becauseLabel}: <span className="text-ink">&ldquo;{row.evidenceText}&rdquo;</span>
              </>
            ) : (
              TRIAGE.evidencePrompt
            )}
          </p>

          {showWhy && (
            <div
              className={clsx(
                "reveal-in mt-2 rounded-xl border px-3 py-2",
                row.holds ? "border-accent/30 bg-accentSoft" : "border-warn/40 bg-warn/5",
              )}
            >
              <p className="text-micro font-semibold uppercase tracking-wide text-ash">
                {row.holds ? TRIAGE.whyHolds : TRIAGE.whyNot}
              </p>
              <p className="mt-0.5 text-caption text-ink">{signal.triageWhy}</p>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
