"use client";

import clsx from "clsx";
import { useProgress } from "@/lib/store";
import { AnswerKey } from "@/components/ui/AnswerKey";
import { MaterialRefs } from "@/components/ui/MaterialRefs";
import { COMMIT, DIMENSIONS, MEASURES, R1, materialRefs } from "@/lib/route1";
import { useRoute1, domId } from "./useRoute1";

/**
 * The commit step: one recommendation, defended.
 *
 * Reachable regardless of how much of Part 2 above is finished (CLAUDE.md #6) —
 * the missing list is what tells a learner they have not compared all three,
 * not a lock on this panel.
 */
export function CommitPanel() {
  const r1 = useRoute1();
  const choose = useProgress((s) => s.choose);
  const setNote = useProgress((s) => s.setNote);

  return (
    <div id={domId.commit} className="scroll-mt-24 space-y-5 rounded-2xl border border-line bg-paper p-5">
      <div>
        <h3 className="text-h3 text-ink">Commit and defend</h3>
        <p className="mt-1 max-w-prose text-caption text-ash">
          One measure gets funded. Write the argument you would put in front of the people who approve
          it — including what you are giving up.
        </p>
        <MaterialRefs refs={materialRefs(["tradeoff", "coupling"])} />
      </div>

      {/* The choice */}
      <div id={domId.pick} className="scroll-mt-24">
        <p className="text-caption font-semibold text-ink">{COMMIT.pick.label}</p>
        <p className="mt-0.5 text-micro text-ash">{COMMIT.pick.instruction}</p>
        {!r1.revealedAll && (
          <p className="mt-1.5 rounded-lg bg-warn/10 px-2.5 py-1.5 text-micro text-warn">
            Reveal the profiles above before committing — a pick made blind isn't a decision yet.
          </p>
        )}
        <div className="mt-2 grid gap-2 md:grid-cols-3">
          {MEASURES.map((m) => {
            const on = r1.pick === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => choose(R1.pick, m.id)}
                aria-pressed={on}
                className={clsx(
                  "rounded-xl border p-3 text-left transition-colors duration-150",
                  on ? "border-accent bg-accentSoft" : "border-line bg-canvas hover:border-ash",
                )}
              >
                <span className={clsx("text-caption font-semibold", on ? "text-accent" : "text-ink")}>
                  Measure {m.id}
                </span>
                <span className="mt-1 block text-caption text-ink">{m.shortName}</span>
              </button>
            );
          })}
        </div>
      </div>

      <Field
        anchorId={domId.rationale}
        id="r1-rationale-field"
        label={COMMIT.rationale.label}
        instruction={COMMIT.rationale.instruction}
        placeholder={COMMIT.rationale.placeholder}
        value={r1.rationale}
        onChange={(v) => setNote(R1.rationale, v)}
        rows={4}
      />

      <Field
        anchorId={domId.feasibility}
        id="r1-feasibility-field"
        label={COMMIT.feasibility.label}
        instruction={COMMIT.feasibility.instruction}
        placeholder={COMMIT.feasibility.placeholder}
        value={r1.feasibility}
        onChange={(v) => setNote(R1.feasibility, v)}
        rows={3}
      />

      <div className="grid gap-4 md:grid-cols-2">
        {([1, 2] as const).map((n) => (
          <Field
            key={`fu-${n}`}
            anchorId={domId.followUp(n)}
            id={`r1-followup-${n}`}
            label={COMMIT.followUp.label(n)}
            instruction={COMMIT.followUp.instruction}
            placeholder={COMMIT.followUp.placeholder}
            value={r1.followUp[n - 1]}
            onChange={(v) => setNote(R1.followUp(n), v)}
            rows={2}
          />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {([1, 2] as const).map((n) => (
          <Field
            key={`risk-${n}`}
            anchorId={domId.risk(n)}
            id={`r1-risk-${n}`}
            label={COMMIT.risk.label(n)}
            instruction={COMMIT.risk.instruction}
            placeholder={COMMIT.risk.placeholder}
            value={r1.risks[n - 1]}
            onChange={(v) => setNote(R1.risk(n), v)}
            rows={2}
          />
        ))}
      </div>

      {/* A quiet reference so the argument can cite a score without scrolling back up */}
      <details className="rounded-xl border border-line bg-canvas p-3">
        <summary className="cursor-pointer text-caption font-semibold text-ink">
          The three real profiles, side by side
        </summary>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[360px] text-micro">
            <thead>
              <tr className="border-b border-line text-ash">
                <th className="py-1 text-left font-semibold">Dimension</th>
                {MEASURES.map((m) => (
                  <th key={m.id} className="w-10 py-1 text-center font-semibold">
                    {m.id}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DIMENSIONS.map((d) => (
                <tr key={d.key} className="border-b border-line/60">
                  <td className="py-1 pr-2 text-ash">
                    {d.name}
                    {d.inverted && <span className="ml-1 text-warn">▲</span>}
                  </td>
                  {MEASURES.map((m) => (
                    <td
                      key={m.id}
                      className={clsx(
                        "py-1 text-center tabular-nums",
                        r1.pick === m.id ? "font-semibold text-accent" : "text-ink",
                      )}
                    >
                      {r1.revealedAll ? m.profile[d.key] : "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-1.5 text-micro text-ash">
          <span className="text-warn">▲</span> Higher is worse. A dash means you have not revealed the
          profiles yet.
        </p>
      </details>

      <AnswerKey block={COMMIT.answerKey} />
    </div>
  );
}

function Field({
  anchorId,
  id,
  label,
  instruction,
  placeholder,
  value,
  onChange,
  rows,
}: {
  anchorId: string;
  id: string;
  label: string;
  instruction: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  rows: number;
}) {
  return (
    <div id={anchorId} className="scroll-mt-24">
      <label htmlFor={id} className="block text-caption font-semibold text-ink">
        {label}
      </label>
      <p className="mt-0.5 text-micro text-ash">{instruction}</p>
      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-caption text-ink"
      />
    </div>
  );
}
