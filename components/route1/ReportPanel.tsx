"use client";

import clsx from "clsx";
import { useHydrated } from "@/lib/store";
import { scrollToAndFlash } from "@/lib/scrollToAndFlash";
import { ENGAGEMENT, EXPORT, HORIZONS, R1, ROOT_CAUSES, areaById } from "@/lib/route1";
import { useRoute1, domId } from "./useRoute1";

const rootLabel = (id: string | null) =>
  ROOT_CAUSES.find((r) => r.id === id)?.label ?? "— not tagged";
const horizonLabel = (id: string | null) =>
  HORIZONS.find((h) => h.id === id)?.label ?? "— not tagged";

/** The date line. Client-only, so the static export stays stable. */
export function useReportDate() {
  const hydrated = useHydrated();
  return hydrated
    ? new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : "";
}

/**
 * Part 1 of the Engagement Report: the triage table for all six signals, then
 * the two escalated ones with their full deep-dive workup. Every escalated row
 * has an Edit button that scrolls to and flashes that signal's deep-dive card
 * (CLAUDE.md #5) — the report is a view of the learner's answers, never a
 * second copy of them.
 */
export function ReportPanel() {
  const r1 = useRoute1();
  const date = useReportDate();

  return (
    <div className="rounded-2xl border border-line bg-paper p-5">
      <p className="text-micro font-semibold uppercase tracking-wide text-accent">
        {EXPORT.docHeading}
      </p>
      <p className="text-caption font-semibold text-ink">{EXPORT.partOne}</p>
      <p className="mt-1 text-caption text-ash">
        <span className="font-semibold text-ink">{r1.name.trim() || "[your name]"}</span>
        {date ? ` · ${date}` : ""} · Case: {ENGAGEMENT.company}
      </p>

      {/* Triage table */}
      <div className="mt-4">
        <p className="text-micro font-semibold uppercase tracking-wide text-ash">
          Triage — {r1.triageCompleteCount} of {r1.totalSignals}
        </p>
        <ul className="mt-2 space-y-1.5">
          {r1.triage.map((t) => (
            <li key={t.signal.id} className="flex items-start gap-2 text-micro">
              <span
                className={clsx(
                  "mt-0.5 shrink-0 rounded-full px-1.5 py-0.5 font-semibold",
                  t.complete ? "bg-accentSoft text-accent" : "border border-line text-ash",
                )}
              >
                S{t.signal.n}
              </span>
              <span className="min-w-0 text-ash">
                <span className="text-ink">{t.signal.title}</span> — {rootLabel(t.tag)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Escalated deep dives */}
      <div className="mt-4 border-t border-line pt-4">
        <p className="text-micro font-semibold uppercase tracking-wide text-ash">
          Escalated &amp; analysed — {r1.analysisCompleteCount} of {r1.escalated.length || 2}
        </p>
        {r1.analyses.length === 0 ? (
          <p className="mt-2 rounded-xl border border-dashed border-line bg-canvas p-3 text-caption text-ash">
            Choose two signals in Step 2 and their analysis appears here.
          </p>
        ) : (
          <ul className="mt-2 space-y-2">
            {r1.analyses.map((a) => (
              <li key={a.signal.id} className="rounded-xl border border-line bg-canvas p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-caption font-semibold text-ink">
                    {a.signal.n}. {a.signal.title}
                  </p>
                  <span
                    className={clsx(
                      "shrink-0 rounded-full px-2 py-0.5 text-micro font-semibold",
                      a.complete ? "bg-accentSoft text-accent" : "border border-line text-ash",
                    )}
                  >
                    {a.complete ? "filed" : "in progress"}
                  </span>
                </div>
                <dl className="mt-1.5 space-y-1 text-micro">
                  <Row label="Area" value={a.area ? areaById(a.area).name : "— not assigned"} />
                  <Row label="Horizon" value={horizonLabel(a.horizon)} />
                  {a.approach && (
                    <div className="pt-0.5">
                      <dt className="text-ash">First step</dt>
                      <dd className="mt-0.5 italic text-ink">&ldquo;{a.approach}&rdquo;</dd>
                    </div>
                  )}
                </dl>
                <button
                  type="button"
                  onClick={() => scrollToAndFlash(domId.analysis(a.signal.id), "ref")}
                  className="mt-2 text-micro font-semibold text-accent underline decoration-dotted underline-offset-2 hover:text-accentHi"
                >
                  Edit this analysis
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="w-20 shrink-0 text-ash">{label}</dt>
      <dd className="min-w-0 flex-1 text-ink">{value}</dd>
    </div>
  );
}
