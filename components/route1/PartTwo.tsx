"use client";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { MaterialRefs } from "@/components/ui/MaterialRefs";
import { CONSTRAINTS, MEASURES, PART_TWO, materialRefs } from "@/lib/route1";
import { SituationalBlock } from "./SituationalBlock";
import { PredictionGrid } from "./PredictionGrid";
import { CommitPanel } from "./CommitPanel";
import { useRoute1, domId } from "./useRoute1";

/**
 * Part 2 — Decide (level 2). One continuous pass, not three tab-gated ones:
 * the constraint set once, all three situational questions together, one
 * shared prediction grid, one Reveal, then the commit panel.
 */
export function PartTwo() {
  const r1 = useRoute1();

  return (
    <section id={domId.partTwo} className="scroll-mt-24 space-y-6">
      <SectionHeading
        kicker={`${PART_TWO.tag} · about ${PART_TWO.minutes} minutes`}
        title={PART_TWO.title}
        intro={PART_TWO.framing}
      />

      <MaterialRefs refs={materialRefs(["tradeoff", "architecture", "coupling"])} lead="This part draws on" />

      {/* The constraint set — stated once */}
      <div className="rounded-2xl border border-line bg-mist p-5">
        <p className="text-micro font-semibold uppercase tracking-wide text-ash">
          What constrains this decision
        </p>
        <ul className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {CONSTRAINTS.map((c) => (
            <li key={c.n} className="rounded-xl border border-line bg-paper p-3">
              <div className="flex items-start gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-ink text-micro font-bold tabular-nums text-paper">
                  {c.n}
                </span>
                <div>
                  <p className="text-caption font-semibold text-ink">{c.label}</p>
                  <p className="mt-0.5 text-micro text-ash">{c.text}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* All three, together */}
      <div>
        <p className="text-caption font-semibold text-ink">{PART_TWO.situationalHeading}</p>
        <p className="mt-0.5 text-micro text-ash">{PART_TWO.situationalIntro}</p>
        <div className="mt-3 space-y-3">
          {MEASURES.map((m) => (
            <SituationalBlock key={m.id} state={r1.measureStateById(m.id)} />
          ))}
        </div>
      </div>

      <PredictionGrid />

      <CommitPanel />
    </section>
  );
}
