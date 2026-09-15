"use client";

import clsx from "clsx";
import { useProgress } from "@/lib/store";
import { MaterialRefs } from "@/components/ui/MaterialRefs";
import { AnswerKey } from "@/components/ui/AnswerKey";
import { R1, materialRefs } from "@/lib/route1";
import { domId, type MeasureState } from "./useRoute1";

/**
 * One measure's summary and situational question, shown alongside the other
 * two rather than behind a tab — three quick reads in one scroll instead of
 * three separate tab visits. What the measure tests is still specific to it;
 * only the container changed.
 */
export function SituationalBlock({ state }: { state: MeasureState }) {
  const { measure } = state;
  const choose = useProgress((s) => s.choose);

  return (
    <div id={domId.situational(measure.id)} className="scroll-mt-24 rounded-2xl border border-line bg-paper p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-ink text-micro font-bold text-paper">
          {measure.id}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-caption font-semibold text-ink">{measure.name}</p>
          <p className="mt-0.5 text-micro text-ash">{measure.summary}</p>
        </div>
      </div>

      <ul className="mt-2 space-y-1 pl-10">
        {measure.detail.map((d) => (
          <li key={d} className="flex gap-2 text-micro text-ash">
            <span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-ash" />
            <span>{d}</span>
          </li>
        ))}
      </ul>

      <MaterialRefs refs={materialRefs(measure.material)} />

      <div className="mt-3 border-t border-line pt-3">
        <p className="text-caption font-semibold text-ink">{measure.situational.question}</p>
        <p className="mt-0.5 text-micro text-ash">{measure.situational.instruction}</p>
        <ul className="mt-2 space-y-2">
          {measure.situational.options.map((o) => {
            const on = state.situational === o.id;
            return (
              <li key={o.id}>
                <button
                  type="button"
                  onClick={() => choose(R1.situational(measure.id), o.id)}
                  aria-pressed={on}
                  className={clsx(
                    "w-full rounded-xl border p-3 text-left transition-colors duration-150",
                    on ? "border-accent bg-accentSoft" : "border-line bg-canvas hover:border-ash",
                  )}
                >
                  <span className={clsx("text-caption", on ? "font-semibold text-ink" : "text-ink")}>
                    {o.text}
                  </span>
                  {on && <span className="reveal-in mt-1.5 block text-caption text-ash">{o.feedback}</span>}
                </button>
              </li>
            );
          })}
        </ul>
        <AnswerKey block={measure.situational.answerKey} />
      </div>
    </div>
  );
}
