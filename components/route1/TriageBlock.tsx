"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { useProgress } from "@/lib/store";
import { scrollToAndFlash } from "@/lib/scrollToAndFlash";
import { MaterialRefs } from "@/components/ui/MaterialRefs";
import { AnswerKey } from "@/components/ui/AnswerKey";
import { Help } from "@/components/icons/LineIcons";
import { R1, SIGNALS, TRIAGE, TRIAGE_ANSWER_KEY, materialRefs } from "@/lib/route1";
import { TriageRow } from "./TriageRow";
import { useRoute1, domId } from "./useRoute1";

/**
 * Step 1 — triage all six signals.
 *
 * The check is set-level on purpose: the tag is a two-way choice, so saying
 * which row is wrong would simply be the answer (CLAUDE.md #4, #12). It counts
 * how many rows hold — right tag *and* the deciding phrase — and nothing more.
 * The clue marks the deciding phrase in every row, so it still does not say
 * which rows are wrong. After two genuine checks the learner may ask for the
 * reasoning; that is recorded in the export so a grader can see it.
 */
export function TriageBlock() {
  const r1 = useRoute1();
  const setNote = useProgress((s) => s.setNote);
  const toggleCheck = useProgress((s) => s.toggleCheck);
  const [error, setError] = useState<string | null>(null);

  // An edit makes an earlier "fill these in first" message stale.
  useEffect(() => setError(null), [r1.triageSignature]);

  const runCheck = () => {
    const incomplete = r1.triage.filter((t) => !t.complete);
    if (incomplete.length > 0) {
      setError(
        TRIAGE.incomplete(
          incomplete.map(
            (t) =>
              `Signal ${t.signal.n} needs ${
                !t.tag && t.evidence === null ? "a tag and a phrase" : !t.tag ? "a tag" : "a phrase"
              }`,
          ),
        ),
      );
      const first = incomplete[0];
      scrollToAndFlash(!first.tag ? domId.triageTag(first.signal.id) : domId.triageEvidence(first.signal.id));
      return;
    }
    setError(null);
    setNote(R1.triageChecks, String(r1.triageChecks + 1));
    setNote(R1.triageLastSig, r1.triageSignature);
    setNote(R1.triageLastOk, String(r1.triage.filter((t) => t.holds).length));
  };

  const reveal = () => {
    toggleCheck(R1.triageReveal, true);
    setNote(R1.triageRevealAt, String(r1.triageChecks));
  };

  const showClueButton = r1.triageFresh && !r1.triageAllHold && !r1.triageClue;
  const showReveal = r1.triageChecks >= TRIAGE.revealAfter && !r1.triageAllHold && !r1.triageRevealed;

  return (
    <section id={domId.triage} className="scroll-mt-24 space-y-4">
      <div>
        <p className="text-micro font-semibold uppercase tracking-wide text-accent">
          {TRIAGE.step} · about {TRIAGE.minutes} minutes
        </p>
        <h3 className="mt-1 text-h3 text-ink">{TRIAGE.title}</h3>
        <p className="mt-1 max-w-prose text-caption text-ash">{TRIAGE.intro}</p>
        <MaterialRefs refs={materialRefs(TRIAGE.material)} />
      </div>

      {/* The anchor: the rule, stated where the decision is made */}
      <div className="rounded-xl border-y border-r border-l-4 border-y-accent/25 border-r-accent/25 border-l-accent bg-accentSoft/50 px-4 py-3">
        <p className="text-micro font-semibold uppercase tracking-wide text-accent">{TRIAGE.rule.label}</p>
        <p className="mt-1 text-caption text-ink">{TRIAGE.rule.text}</p>
      </div>

      <ul className="space-y-3">
        {r1.triage.map((row) => (
          <TriageRow
            key={row.signal.id}
            row={row}
            highlightDecisive={r1.triageClue}
            showWhy={r1.triageReasoningVisible}
          />
        ))}
      </ul>

      <div id={domId.triageCheck} className="scroll-mt-24 space-y-2 rounded-xl border border-line bg-canvas p-3">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={runCheck} className="btn-ghost">
            {r1.triageChecks > 0 ? TRIAGE.recheckLabel : TRIAGE.checkLabel}
          </button>
          {showClueButton && (
            <button
              type="button"
              onClick={() => toggleCheck(R1.triageClue, true)}
              className="inline-flex items-center gap-1 text-micro font-semibold text-accent hover:text-accentHi"
            >
              <Help className="h-3.5 w-3.5" />
              {TRIAGE.clueLabel}
            </button>
          )}
          {showReveal && (
            <button
              type="button"
              onClick={reveal}
              className="text-micro font-semibold text-warn underline decoration-dotted underline-offset-2"
            >
              {TRIAGE.revealLabel}
            </button>
          )}
          <span className="text-micro text-ash">
            {r1.triageCompleteCount} of {SIGNALS.length} ready to check
          </span>
        </div>

        {error && <p className="reveal-in text-caption text-danger">{error}</p>}

        {!error && r1.triageFresh && (
          <p className={clsx("reveal-in text-caption", r1.triageAllHold ? "font-semibold text-accent" : "text-ink")}>
            {TRIAGE.result(r1.triageLastOk, SIGNALS.length)}
          </p>
        )}

        {!error && r1.triageChecks > 0 && !r1.triageFresh && (
          <p className="text-caption text-ash">{TRIAGE.stale}</p>
        )}

        {r1.triageClue && (
          <p className="reveal-in rounded-lg border border-accent/25 bg-accentSoft px-2.5 py-1.5 text-caption text-ink">
            {TRIAGE.clueText}
          </p>
        )}

        {r1.triageRevealed && <p className="text-micro text-warn">{TRIAGE.revealNote(r1.triageRevealAt)}</p>}
      </div>

      <AnswerKey block={TRIAGE_ANSWER_KEY} />
    </section>
  );
}
