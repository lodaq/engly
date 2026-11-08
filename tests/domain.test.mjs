import test from "node:test";
import assert from "node:assert/strict";
import {
  addActivity,
  dayKey,
  emptyProfile,
  makePlacement,
  practiceFeedback,
  scorePlacement,
  streak,
  validProfile,
} from "../src/domain.mjs";
import { levels } from "../src/domain.mjs";
import { localLesson } from "../src/content.mjs";
test("placement covers every level and tested skill, and retakes avoid previous questions", () => {
  const first = makePlacement();
  const second = makePlacement(first.map((q) => q.prompt));
  assert.equal(first.length, 12);
  assert.equal(new Set(first.map((q) => q.prompt)).size, 12);
  assert.deepEqual(
    new Set(first.map((q) => q.skill)),
    new Set(["grammar", "vocabulary", "reading"]),
  );
  for (const level of levels.slice(0, 5))
    assert.ok(first.some((q) => q.level === level));
  for (const q of second)
    assert.ok(!first.some((previous) => previous.prompt === q.prompt));
});
test("placement awards correct answers and does not invent listening or speaking scores", () => {
  const questions = makePlacement();
  const perfect = scorePlacement(
    questions,
    questions.map((q) => q.answer),
  );
  assert.equal(perfect.level, "C1");
  assert.equal(perfect.scores.grammar, 100);
  assert.equal(perfect.scores.vocabulary, 100);
  assert.equal(perfect.scores.reading, 100);
  assert.equal(perfect.scores.speaking, undefined);
  assert.equal(perfect.scores.writing, undefined);
  const wrong = scorePlacement(
    questions,
    questions.map((q) => (q.answer + 1) % q.options.length),
  );
  assert.equal(wrong.level, "A1");
  assert.equal(wrong.scores.reading, 0);
});
test("completion is idempotent and scores update only with measured feedback", () => {
  const profile = { ...emptyProfile(), assessed: true, level: "B1" };
  const activity = {
    id: "first",
    skill: "writing",
    title: "Email",
    date: "2026-11-08",
    minutes: 2,
    score: null,
  };
  const next = addActivity(profile, activity);
  assert.equal(next.activities.length, 1);
  assert.equal(next.scores.writing, undefined);
  assert.equal(addActivity(next, activity), next);
  const assessed = addActivity(next, { ...activity, id: "second", score: 80 });
  assert.equal(assessed.scores.writing, 80);
  assert.equal(
    addActivity(assessed, { ...activity, id: "third", score: 60 }).scores
      .writing,
    70,
  );
});
test("streak respects calendar dates, yesterday grace, gaps, and month boundaries", () => {
  const history = ["2026-10-31", "2026-11-01", "2026-11-02"].map((date) => ({
    date,
  }));
  assert.equal(streak(history, new Date(2026, 10, 2, 12)), 3);
  assert.equal(streak(history, new Date(2026, 10, 3, 12)), 3);
  assert.equal(streak(history, new Date(2026, 10, 4, 12)), 0);
  assert.equal(dayKey(new Date(2026, 0, 2, 12)), "2026-01-02");
});
test("invalid saved or imported progress cannot unlock the app", () => {
  const profile = emptyProfile();
  assert.ok(validProfile(profile));
  assert.ok(!validProfile({ ...profile, assessed: true, level: "Z9" }));
  assert.ok(!validProfile({ ...profile, scores: { reading: 101 } }));
  assert.ok(!validProfile({ ...profile, activities: [{ date: "bad" }] }));
  assert.ok(!validProfile(null));
});
test("basic feedback corrects known patterns without claiming a comprehensive AI assessment", () => {
  const result = practiceFeedback(
    "I am agree that she go to work. We discuss about the plan.",
  );
  assert.equal(result.score, null);
  assert.equal(result.corrections.length, 3);
  assert.match(result.improved, /I agree/);
  assert.match(result.improved, /she goes/);
  assert.match(result.summary, /basic|checks/);
});
test("every level has complete practice content and reading answers are valid", () => {
  for (const level of levels)
    for (const skill of ["reading", "writing", "listening", "speaking"]) {
      const lesson = localLesson(skill, level);
      assert.ok(lesson.title);
      assert.ok(lesson.prompt || lesson.text);
      if (skill === "reading")
        for (const q of lesson.questions)
          assert.ok(q.answer >= 0 && q.answer < q.options.length);
    }
});
