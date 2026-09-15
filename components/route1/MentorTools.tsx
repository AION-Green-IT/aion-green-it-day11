"use client";

import { useProgress } from "@/lib/store";
import { MentorFillButton } from "@/components/ui/MentorFillButton";
import { AnswerKeyButton } from "@/components/ui/AnswerKeyButton";
import {
  COMMIT,
  DIMENSIONS,
  ESCALATE,
  MEASURES,
  PREDICT_MAX,
  R1,
  SIGNALS,
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
  const markSeen = useProgress((s) => s.markSeen);

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
    // Predictions are deliberately *offset* from ground truth rather than equal
    // to it: the point of the reveal is the ghost-versus-real gap, and a fill
    // that matched perfectly would leave a mentor demonstrating a feature that
    // renders as a single polygon.
    const offsets: Record<string, number> = { A: 2, B: -3, C: 3 };

    for (const m of MEASURES) {
      const correct = m.situational.options.find((o) => o.correct) ?? m.situational.options[0];
      choose(R1.situational(m.id), correct.id);
      const shift = offsets[m.id] ?? 2;
      DIMENSIONS.forEach((d, i) => {
        // Alternate the direction so the ghost polygon crosses the real one.
        const delta = i % 2 === 0 ? shift : -shift;
        const guess = Math.max(1, Math.min(PREDICT_MAX, m.profile[d.key] + delta));
        choose(R1.predict(m.id, d.key), String(guess));
      });
      markSeen(R1.revealed, m.id);
    }

    choose(R1.tab, "A");
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
