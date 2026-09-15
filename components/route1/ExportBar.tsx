"use client";

import { useState } from "react";
import clsx from "clsx";
import { useProgress } from "@/lib/store";
import { markRouteExported } from "@/lib/routeGating";
import { exportFilename, downloadTextFile } from "@/lib/downloadFile";
import { scrollToAndFlash } from "@/lib/scrollToAndFlash";
import { MissingList } from "@/components/ui/MissingList";
import { ChevronDown } from "@/components/icons/LineIcons";
import { EXPORT } from "@/lib/route1";
import { useRoute1, domId } from "./useRoute1";
import { buildEngagementJson, buildEngagementHtml } from "./exportDocuments";

/**
 * The route's one sticky export bar, covering both parts (CLAUDE.md #12).
 *
 * Never disabled (CLAUDE.md #3): clicking while incomplete opens the itemized
 * missing list and jumps to the first gap — which may be several screens up in
 * Part 1's triage table, the escalation picker, or a deep-dive card. Only the
 * Part 2 measure tabs are ever collapsed, so only those entries carry a
 * `before` callback to open the right tab first.
 */
export function ExportBar() {
  const r1 = useRoute1();
  const toggleCheck = useProgress((s) => s.toggleCheck);
  const [showMissing, setShowMissing] = useState(false);

  const handleExport = () => {
    if (!r1.allComplete) {
      setShowMissing(true);
      const first = r1.missing[0];
      if (first) {
        first.before?.();
        window.setTimeout(() => scrollToAndFlash(first.id), first.before ? 40 : 0);
      }
      return;
    }
    const filename = exportFilename(r1.name, EXPORT.filenameLevels, EXPORT.filenameTask);
    downloadTextFile(`${filename}.json`, buildEngagementJson(r1, filename), "application/json");
    downloadTextFile(`${filename}.html`, buildEngagementHtml(r1), "text/html");
    markRouteExported(toggleCheck, 1);
    setShowMissing(false);
  };

  return (
    <div
      id={domId.export}
      className="sticky bottom-0 z-20 -mx-4 border-t border-line bg-paper/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6 print:hidden"
    >
      {showMissing && r1.missing.length > 0 && (
        <div className="mb-2 max-h-52 overflow-y-auto rounded-xl border border-line bg-canvas p-3">
          <MissingList items={r1.missing} lead="Still needed before export:" />
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setShowMissing((v) => !v)}
          className="flex flex-wrap items-center gap-x-1.5 text-caption text-ash hover:text-ink"
        >
          <span>
            <span className="tabular-nums font-semibold text-ink">{r1.triageCompleteCount}</span> /{" "}
            {r1.totalSignals} triaged
          </span>
          <span className="text-ash">·</span>
          <span>
            <span className="tabular-nums font-semibold text-ink">{r1.analysisCompleteCount}</span> /{" "}
            {r1.escalated.length || 2} analysed
          </span>
          <span className="text-ash">·</span>
          <span>
            <span className="tabular-nums font-semibold text-ink">{r1.revealedCount}</span> /{" "}
            {r1.totalMeasures} measures compared
          </span>
          {r1.missing.length > 0 && (
            <>
              <span className="text-ash">
                · {r1.missing.length} item{r1.missing.length === 1 ? "" : "s"} still needed
              </span>
              <ChevronDown
                className={clsx(
                  "h-3.5 w-3.5 transition-transform duration-150",
                  showMissing && "rotate-180",
                )}
              />
            </>
          )}
        </button>
        <button type="button" onClick={handleExport} className="btn-accent">
          {EXPORT.buttonLabel}
        </button>
      </div>
    </div>
  );
}
