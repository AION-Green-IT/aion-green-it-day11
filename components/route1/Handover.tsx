"use client";

import clsx from "clsx";
import { HANDOVER } from "@/lib/route1";
import { scrollToAndFlash } from "@/lib/scrollToAndFlash";
import { ArrowRight } from "@/components/icons/LineIcons";
import { useRoute1, domId } from "./useRoute1";

/**
 * The handover between the two parts.
 *
 * This is what makes the route one thing rather than two exercises printed in
 * sequence: it reads the learner's own triage and escalation choices back to
 * them and turns the question from "what is broken" into "what gets funded".
 * It is never a gate — Part 2 sits directly below and is reachable whether or
 * not Part 1 is finished (CLAUDE.md #6); the button is convenience, not
 * permission.
 */
export function Handover() {
  const r1 = useRoute1();
  const complete = r1.triageCompleteCount === r1.totalSignals && r1.analysisCompleteCount === r1.escalated.length && r1.escalated.length === 2;

  const measurement = r1.triage.filter((t) => t.complete && t.tag === "measurement").length;
  const architecture = r1.triage.filter((t) => t.complete && t.tag === "architecture").length;
  const escalatedNames = r1.escalated.map((id) => {
    const t = r1.triageById(id);
    return `Signal ${t.signal.n}`;
  });
  const analysedShort = r1.analyses.filter((a) => a.complete && a.horizon === "short").length;
  const analysedStructural = r1.analyses.filter((a) => a.complete && a.horizon === "structural").length;

  return (
    <section
      id={HANDOVER.id}
      className={clsx(
        "scroll-mt-24 overflow-hidden rounded-2xl border bg-paper shadow-sm transition-colors duration-300",
        complete ? "border-accent/50" : "border-line",
      )}
    >
      <div className="flex items-center gap-3 bg-slate px-5 py-2.5">
        <span
          className={clsx(
            "h-1.5 w-1.5 rounded-full",
            complete ? "motif-pulse bg-accent" : "bg-paper/40",
          )}
        />
        <p className="text-micro font-semibold uppercase tracking-wide text-paper/80">
          {HANDOVER.kicker}
        </p>
      </div>

      <div className="space-y-4 p-6">
        <h2 className="text-h2 text-ink">{HANDOVER.heading}</h2>

        <div
          className={clsx(
            "rounded-xl border px-4 py-3",
            complete ? "border-accent/30 bg-accentSoft" : "border-line bg-canvas",
          )}
        >
          <p className="text-micro font-semibold uppercase tracking-wide text-accent">
            From your own report
          </p>
          <p className="mt-1 text-caption text-ink">
            {r1.hydrated
              ? HANDOVER.triageTally(measurement, architecture, r1.triageCompleteCount, r1.totalSignals)
              : HANDOVER.triageTally(0, 0, 0, r1.totalSignals)}
          </p>
          <p className="mt-1.5 text-caption text-ink">
            {r1.hydrated
              ? HANDOVER.escalationTally(escalatedNames, analysedShort, analysedStructural, r1.analysisCompleteCount)
              : HANDOVER.escalationTally([], 0, 0, 0)}
          </p>

          <SplitBars measurement={measurement} architecture={architecture} short={analysedShort} structural={analysedStructural} />
        </div>

        <p className="max-w-prose text-body text-ash">{HANDOVER.body}</p>

        <button
          type="button"
          onClick={() => scrollToAndFlash(domId.partTwo, "ref")}
          className="btn-accent inline-flex items-center gap-2"
        >
          {HANDOVER.cta}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}

/** Two stacked bars: the triage root-cause split (all six) and the horizon split (the escalated two). */
function SplitBars({
  measurement,
  architecture,
  short,
  structural,
}: {
  measurement: number;
  architecture: number;
  short: number;
  structural: number;
}) {
  const rows = [
    {
      label: "Root cause (triage)",
      left: { value: measurement, label: "Measurement gap", className: "fill-ash" },
      right: { value: architecture, label: "Architecture decision", className: "fill-ink" },
    },
    {
      label: "Horizon (escalated)",
      left: { value: short, label: "Short-term visible", className: "fill-accent/50" },
      right: { value: structural, label: "Structural", className: "fill-accent" },
    },
  ];

  return (
    <div className="mt-3 space-y-2.5">
      {rows.map((r) => {
        const total = r.left.value + r.right.value;
        const w = 320;
        const leftW = total === 0 ? 0 : (r.left.value / total) * w;
        return (
          <div key={r.label}>
            <p className="text-micro uppercase tracking-wide text-ash">{r.label}</p>
            <svg
              viewBox={`0 0 ${w} 16`}
              preserveAspectRatio="none"
              role="img"
              aria-label={`${r.label}: ${r.left.value} ${r.left.label}, ${r.right.value} ${r.right.label}`}
              className="mt-1 h-4 w-full"
            >
              <rect x={0} y={0} width={w} height={16} rx={8} className="fill-line" />
              {total > 0 && (
                <>
                  <rect
                    x={0}
                    y={0}
                    width={Math.max(leftW, 0)}
                    height={16}
                    rx={8}
                    className={r.left.className}
                    style={{ transition: "width 400ms ease" }}
                  />
                  <rect
                    x={Math.max(leftW, 0)}
                    y={0}
                    width={Math.max(w - leftW, 0)}
                    height={16}
                    rx={8}
                    className={r.right.className}
                    style={{ transition: "all 400ms ease" }}
                  />
                </>
              )}
            </svg>
            <p className="mt-0.5 flex flex-wrap justify-between gap-x-3 text-micro text-ash">
              <span>
                {r.left.label}: <span className="font-semibold text-ink tabular-nums">{r.left.value}</span>
              </span>
              <span>
                {r.right.label}: <span className="font-semibold text-ink tabular-nums">{r.right.value}</span>
              </span>
            </p>
          </div>
        );
      })}
    </div>
  );
}
