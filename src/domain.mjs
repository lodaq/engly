import { questionBank } from "./content.mjs";
export const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];
export const emptyProfile = () => ({
  assessed: false,
  level: null,
  scores: {},
  weaknesses: [],
  strengths: [],
  report: null,
  activities: [],
});
export const dayKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export const wordCount = (text) =>
  text.trim().split(/\s+/).filter(Boolean).length;
export function makePlacement(previous = []) {
  const selected = [];
  for (const level of levels.slice(0, 5))
    for (const skill of ["grammar", "vocabulary"]) {
      const pool = questionBank.filter(
        (q) => q.level === level && q.skill === skill,
      );
      const fresh = pool.filter((q) => !previous.includes(q.prompt));
      selected.push(
        (fresh.length ? fresh : pool)[
          Math.floor(Math.random() * (fresh.length || pool.length))
        ],
      );
    }
  for (const level of ["B1", "B2"]) {
    const pool = questionBank.filter(
      (q) => q.level === level && q.skill === "reading",
    );
    const fresh = pool.filter((q) => !previous.includes(q.prompt));
    selected.push(
      (fresh.length ? fresh : pool)[
        Math.floor(Math.random() * (fresh.length || pool.length))
      ],
    );
  }
  return selected;
}
export function scorePlacement(questions, answers) {
  const scores = {};
  for (const skill of ["grammar", "vocabulary", "reading"]) {
    const entries = questions
      .map((q, i) => ({ q, i }))
      .filter(({ q }) => q.skill === skill);
    scores[skill] = entries.length
      ? Math.round(
          (entries.filter(({ q, i }) => q.answer === answers[i]).length /
            entries.length) *
            100,
        )
      : 0;
  }
  const total =
    questions.filter((q, i) => q.answer === answers[i]).length /
    questions.length;
  const level =
    total < 0.25
      ? "A1"
      : total < 0.45
        ? "A2"
        : total < 0.65
          ? "B1"
          : total < 0.85
            ? "B2"
            : "C1";
  const weaknesses = Object.entries(scores)
    .filter(([, n]) => n < 65)
    .map(([s]) => s);
  const strengths = Object.entries(scores)
    .filter(([, n]) => n >= 65)
    .map(([s]) => s);
  return {
    level,
    scores,
    weaknesses,
    strengths,
    summary: `Your provisional level is ${level}, based on ${questions.filter((q, i) => q.answer === answers[i]).length} of ${questions.length} correct answers. Focus on ${weaknesses.join(", ") || "using your English in longer, real-world tasks"}. This short test is a starting point, not a CEFR certification.`,
    arabic: `مستواك المبدئي هو ${level}. هذه نتيجة تقديرية مبنية على أسئلة القواعد والمفردات والقراءة، وليست شهادة رسمية. ${weaknesses.length ? "راجع الإجابات غير الصحيحة لفهم النقاط التي تحتاج إلى تدريب." : "إجاباتك جيدة؛ جرّب مهام أطول لتطوير مهاراتك."} الكتابة تحتاج إلى تقييم بالذكاء الاصطناعي، والاستماع والتحدث يحتاجان إلى ممارسة منفصلة.`,
  };
}
export function validProfile(p) {
  const strings = (a) =>
    Array.isArray(a) &&
    a.length <= 50 &&
    a.every((s) => typeof s === "string" && s.length <= 2000);
  return (
    !!p &&
    typeof p.assessed === "boolean" &&
    (!p.assessed || levels.includes(p.level)) &&
    p.scores &&
    typeof p.scores === "object" &&
    !Array.isArray(p.scores) &&
    Object.entries(p.scores).every(
      ([skill, n]) =>
        [
          "reading",
          "writing",
          "listening",
          "speaking",
          "grammar",
          "vocabulary",
        ].includes(skill) &&
        Number.isFinite(n) &&
        n >= 0 &&
        n <= 100,
    ) &&
    strings(p.weaknesses) &&
    strings(p.strengths) &&
    (p.report === null ||
      (typeof p.report?.summary === "string" &&
        typeof p.report?.arabic === "string")) &&
    Array.isArray(p.activities) &&
    p.activities.length <= 1000 &&
    p.activities.every(
      (a) =>
        a &&
        typeof a.id === "string" &&
        a.id.length > 0 &&
        ["reading", "writing", "listening", "speaking"].includes(a.skill) &&
        /^\d{4}-\d{2}-\d{2}$/.test(a.date) &&
        typeof a.title === "string" &&
        Number.isFinite(a.minutes) &&
        a.minutes >= 0 &&
        (a.score == null ||
          (Number.isFinite(a.score) && a.score >= 0 && a.score <= 100)),
    )
  );
}
export function addActivity(profile, activity) {
  if (profile.activities.some((a) => a.id === activity.id)) return profile;
  const scores = { ...profile.scores };
  if (Number.isFinite(activity.score))
    scores[activity.skill] =
      scores[activity.skill] == null
        ? activity.score
        : Math.round((scores[activity.skill] + activity.score) / 2);
  return {
    ...profile,
    scores,
    activities: [...profile.activities, activity].slice(-1000),
  };
}
export function streak(activities, now = new Date()) {
  const dates = new Set(activities.map((a) => a.date));
  const cursor = new Date(now);
  cursor.setHours(12, 0, 0, 0);
  if (!dates.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let count = 0;
  while (dates.has(dayKey(cursor))) {
    count++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}
export function practiceFeedback(text) {
  const corrections = [];
  const rules = [
    [
      /\bi am agree\b/gi,
      "I agree",
      "“Agree” is a verb; it does not need “am.”",
    ],
    [/\bhe go\b/gi, "he goes", "Use “goes” with he in the present simple."],
    [/\bshe go\b/gi, "she goes", "Use “goes” with she in the present simple."],
    [
      /\bi have went\b/gi,
      "I have gone",
      "Use the past participle “gone” after “have.”",
    ],
    [
      /\bdiscuss about\b/gi,
      "discuss",
      "“Discuss” takes a direct object without “about.”",
    ],
  ];
  let improved = text;
  for (const [pattern, replacement, reason] of rules) {
    const match = improved.match(pattern);
    if (match) {
      corrections.push({ original: match[0], replacement, reason });
      improved = improved.replace(pattern, replacement);
    }
  }
  return {
    score: null,
    summary: `You wrote ${wordCount(text)} words. ${corrections.length ? "The checks below found some common usage patterns." : "The basic checks found no matching common errors. This does not mean the response is error-free."} Detailed assessment and task-specific feedback require AI mode.`,
    arabic:
      "هذا فحص أساسي لبعض الأخطاء الشائعة، وليس تقييمًا شاملًا. راجع هل أجبت عن المطلوب بوضوح، واستخدمت أمثلة، وربطت أفكارك. التقييم التفصيلي يحتاج إلى تفعيل الذكاء الاصطناعي.",
    corrections,
    improved,
    strengths: [],
    nextSteps: [
      "Check that you answered every part of the prompt.",
      "Read your sentences aloud and check verb tenses.",
      "Add one specific example to support your main idea.",
    ],
    weaknesses: [],
  };
}
