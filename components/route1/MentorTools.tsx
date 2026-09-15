"use client";

import { useProgress } from "@/lib/store";
import { MentorFillButton } from "@/components/ui/MentorFillButton";
import { AnswerKeyButton } from "@/components/ui/AnswerKeyButton";
import {
  BUCKETS,
  COMMIT,
  DIMENSIONS,
  ESCALATE,
  MEASURES,
  R1,
  SIGNALS,
  bucketFor,
} from "@/lib/route1";

/**
 * The route's mentor bar: one demo auto-fill for the whole engagement plus the
 * answer keys, both behind the shared passcode. Deliberately visually minor and
 * out of the way — a convenience gate against accidental clicks, not a security
 * boundary.
 *
 * One fill, everything (CLAUDE.md #12): triage all six with the correct tag and
 * its decisive phrase, escalate the two recommended in the mentor key, run the
 * deep dive on those two, then fill Part 2. It calls the store's raw actions
 * for every persisted field the route writes, so it exercises exactly the code
 * path a learner does.
 */
export function MentorTools() {
  const setNote = useProgress((s) => s.setNote);
  const choose = useProgress((s) => s.choose);
  const toggleCheck = useProgress((s) => s.toggleCheck);

  const fill = () => {
    setNote(R1.name, "Muchson");

    // -- Step 1: triage all six with the correct tag and its decisive phrase --
    for (const s of SIGNALS) {
      choose(R1.triageTag(s.id), s.rootCause);
      const decisiveIndex = s.segments.findIndex((seg) => typeof seg !== "string" && seg.decisive);
      choose(R1.triageEvidence(s.id), String(decisiveIndex));
    }

    // -- Step 2: escalate the two the mentor key recommends most strongly ----
    const escalate = ["s3", "s4"].slice(0, ESCALATE.limit);
    setNote(R1.escalate, escalate.join("|"));
    setNote(
      R1.escalateWhy,
      "Both are structural rather than short-term, and Signal 4 explains why findings like Signal 3 keep recurring in new services — together they argue from leverage rather than from what's easiest to fix.",
    );

    // -- Step 3: the deep dive on those two -----------------------------------
    for (const id of escalate) {
      const s = SIGNALS.find((sig) => sig.id === id)!;
      choose(R1.area(id), s.area);
      choose(R1.horizon(id), s.horizon);
      setNote(R1.approach(id), s.sampleApproach);
    }

    // -- Part 2: the three measures --------------------------------------------
    // One dimension per measure is deliberately mispredicted (shifted one
    // bucket) rather than every cell matching exactly: the point of Reveal is
    // the predicted-vs-real gap, and a fill with zero misses would leave a
    // mentor demonstrating a feature that never shows the warn-coloured cells.
    const deliberateMiss: Record<string, string> = { A: "risk", B: "feasibility", C: "longterm" };
    const bucketIds = BUCKETS.map((b) => b.id);

    for (const m of MEASURES) {
      const correct = m.situational.options.find((o) => o.correct) ?? m.situational.options[0];
      choose(R1.situational(m.id), correct.id);
      for (const d of DIMENSIONS) {
        const actual = bucketFor(m.profile[d.key]);
        if (d.key === deliberateMiss[m.id]) {
          const wrong = bucketIds.find((b) => b !== actual)!;
          choose(R1.predict(m.id, d.key), wrong);
        } else {
          choose(R1.predict(m.id, d.key), actual);
        }
      }
    }
    toggleCheck(R1.revealed, true);

    choose(R1.pick, "A");
    setNote(R1.rationale, COMMIT.rationale.sample);
    setNote(R1.feasibility, COMMIT.feasibility.sample);
    setNote(R1.followUp(1), COMMIT.followUp.samples[0]);
    setNote(R1.followUp(2), COMMIT.followUp.samples[1]);
    setNote(R1.risk(1), COMMIT.risk.samples[0]);
    setNote(R1.risk(2), COMMIT.risk.samples[1]);
  };

  return (
    <div className="flex flex-wrap items-center justify-end gap-2 print:hidden">
      <MentorFillButton onFill={fill} />
      <AnswerKeyButton />
    </div>
  );
}
