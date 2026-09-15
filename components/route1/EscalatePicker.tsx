"use client";

import { useState } from "react";
import clsx from "clsx";
import { useProgress } from "@/lib/store";
import { scrollToAndFlash } from "@/lib/scrollToAndFlash";
import { MaterialRefs } from "@/components/ui/MaterialRefs";
import { AnswerKey } from "@/components/ui/AnswerKey";
import { ESCALATE, ESCALATION_ANSWER_KEY, R1, ROOT_CAUSES, materialRefs } from "@/lib/route1";
import { useRoute1, domId } from "./useRoute1";

/**
 * Step 2 — choose the two signals to take apart.
 *
 * Exactly two. Deselecting a signal never clears the analysis already written
 * for it (CLAUDE.md #5): the answers stay in the store and come back if the
 * signal is chosen again.
 */
export function EscalatePicker() {
  const r1 = useRoute1();
  const setNote = useProgress((s) => s.setNote);
  const notes = useProgress((s) => s.notes);
  const [full, setFull] = useState(false);

  const toggle = (id: string) => {
    if (r1.escalated.includes(id)) {
      setNote(R1.escalate, r1.escalated.filter((x) => x !== id).join("|"));
      setFull(false);
      return;
    }
    if (r1.escalated.length >= ESCALATE.limit) {
      setFull(true);
      scrollToAndFlash(domId.escalate);
      return;
    }
    setNote(R1.escalate, [...r1.escalated, id].join("|"));
    setFull(false);
  };

  return (
    <section id={domId.escalate} className="scroll-mt-24 space-y-3">
      <div>
        <p className="text-micro font-semibold uppercase tracking-wide text-accent">
          {ESCALATE.step} · about {ESCALATE.minutes} minute{ESCALATE.minutes === 1 ? "" : "s"}
        </p>
        <h3 className="mt-1 text-h3 text-ink">{ESCALATE.title}</h3>
        <p className="mt-1 max-w-prose text-caption text-ash">{ESCALATE.intro}</p>
        <MaterialRefs refs={materialRefs(ESCALATE.material)} />
      </div>

      <ul className="grid gap-2 sm:grid-cols-2">
        {r1.triage.map((t) => {
          const pos = r1.escalated.indexOf(t.signal.id);
          const on = pos >= 0;
          const tagLabel = t.tag ? ROOT_CAUSES.find((r) => r.id === t.tag)?.label : null;
          return (
            <li key={t.signal.id}>
              <button
                type="button"
                onClick={() => toggle(t.signal.id)}
                aria-pressed={on}
                className={clsx(
                  "flex h-full w-full items-start gap-2 rounded-xl border p-3 text-left transition-colors duration-150",
                  on ? "border-accent bg-accentSoft" : "border-line bg-paper hover:border-ash",
                )}
              >
                <span
                  className={clsx(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-micro font-bold",
                    on ? "bg-accent text-paper" : "bg-mist text-ash",
                  )}
                >
                  {on ? `#${pos + 1}` : t.signal.n}
                </span>
                <span className="min-w-0">
                  <span className={clsx("block text-caption font-semibold", on ? "text-accent" : "text-ink")}>
                    {t.signal.title}
                  </span>
                  <span className="mt-0.5 block text-micro text-ash">
                    {tagLabel ? `Your triage: ${tagLabel}` : "Not triaged yet"}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {full && (
        <p className="reveal-in rounded-lg bg-warn/10 px-2.5 py-1.5 text-micro text-warn">{ESCALATE.fullNote}</p>
      )}

      <div id={domId.escalateWhy} className="scroll-mt-24">
        <label htmlFor="r1-escalate-why-field" className="block text-caption font-semibold text-ink">
          {ESCALATE.whyField.label}
        </label>
        <p className="mt-0.5 text-micro text-ash">{ESCALATE.whyField.instruction}</p>
        <textarea
          id="r1-escalate-why-field"
          rows={2}
          value={r1.hydrated ? (notes[R1.escalateWhy] ?? "") : ""}
          onChange={(e) => setNote(R1.escalateWhy, e.target.value)}
          placeholder={ESCALATE.whyField.placeholder}
          className="mt-2 w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-caption text-ink"
        />
      </div>

      <AnswerKey block={ESCALATION_ANSWER_KEY} />
    </section>
  );
}
