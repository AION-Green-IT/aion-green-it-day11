"use client";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { LivePanel } from "@/components/ui/LivePanel";
import { EXPORT, PART_ONE } from "@/lib/route1";
import { TriageBlock } from "./TriageBlock";
import { EscalatePicker } from "./EscalatePicker";
import { DeepDiveCard } from "./DeepDiveCard";
import { ReportPanel } from "./ReportPanel";
import { useRoute1, domId } from "./useRoute1";

/**
 * Part 1 — Diagnose (level 1). Three steps in one column: triage all six
 * signals, escalate two, then the full workup on just those two. The report
 * assembles on the right throughout, and Part 2 below is reachable regardless
 * of how far Part 1 has got (CLAUDE.md #6).
 */
export function PartOne() {
  const r1 = useRoute1();

  return (
    <section id={domId.partOne} className="scroll-mt-24 space-y-6">
      <SectionHeading
        kicker={`${PART_ONE.tag} · about ${PART_ONE.minutes} minutes`}
        title={PART_ONE.title}
        intro={PART_ONE.framing}
      />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-8">
          <TriageBlock />
          <EscalatePicker />

          {r1.analyses.length > 0 && (
            <div className="space-y-4">
              <p className="text-micro font-semibold uppercase tracking-wide text-ash">
                Step 3 · {r1.analyses.length} signal{r1.analyses.length === 1 ? "" : "s"} escalated
              </p>
              <div className="space-y-4">
                {r1.analyses.map((a, i) => (
                  <DeepDiveCard key={a.signal.id} analysis={a} position={i + 1} />
                ))}
              </div>
            </div>
          )}
        </div>

        <LivePanel
          title={`${EXPORT.docHeading} · ${EXPORT.partOne}`}
          summary={`${r1.triageCompleteCount} of ${r1.totalSignals} triaged · ${r1.analysisCompleteCount} of ${r1.escalated.length || 2} analysed`}
        >
          <ReportPanel />
        </LivePanel>
      </div>
    </section>
  );
}
