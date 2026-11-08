import test from "node:test";
import assert from "node:assert/strict";
process.env.NODE_ENV = "test";
const { tutorRequest } = await import("../server.mjs");
const { validateRequest, validateResult } =
  await import("../src/api-contract.mjs");
const request = {
  action: "writing",
  profile: { level: "B1", weaknesses: [] },
  input: "Create an exercise.",
};
test("API rejects invalid actions and unbounded input before contacting the model", async () => {
  assert.equal(validateRequest({ ...request, action: "toString" }), false);
  assert.equal(
    validateRequest({ ...request, input: "x".repeat(16001) }),
    false,
  );
  assert.equal(
    (await tutorRequest({ ...request, profile: { level: "Z9" } }, "key"))
      .status,
    400,
  );
});
test("missing credentials produces an explicit configuration error", async () => {
  assert.equal((await tutorRequest(request, "")).status, 503);
});
test("AI calls send the key only as a server-side header and validate the structured response", async () => {
  const result = {
    title: "An email",
    prompt: "Write a polite request.",
    tip: "Be clear.",
  };
  const response = await tutorRequest(
    request,
    "private-test-key",
    async (url, options) => {
      assert.ok(!url.includes("private-test-key"));
      assert.equal(options.headers["x-goog-api-key"], "private-test-key");
      const body = JSON.parse(options.body);
      assert.equal(body.generationConfig.responseMimeType, "application/json");
      assert.match(body.systemInstruction.parts[0].text, /B1/);
      return new Response(
        JSON.stringify({
          candidates: [
            { content: { parts: [{ text: JSON.stringify(result) }] } },
          ],
        }),
      );
    },
  );
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, result);
});
test("incomplete responses, invalid scores, and out-of-range quiz answers are rejected", async () => {
  const response = await tutorRequest(
    request,
    "key",
    async () =>
      new Response(
        JSON.stringify({
          candidates: [
            { content: { parts: [{ text: '{"title":"Missing fields"}' }] } },
          ],
        }),
      ),
  );
  assert.equal(response.status, 502);
  assert.equal(
    validateResult("reading", {
      title: "x",
      text: "x",
      words: [],
      questions: [],
    }),
    false,
  );
  assert.equal(
    validateResult("feedback", {
      score: 101,
      summary: "x",
      arabic: "x",
      corrections: [],
      improved: "x",
      strengths: [],
      nextSteps: [],
      weaknesses: [],
    }),
    false,
  );
});
test("upstream errors are recoverable and do not expose provider details", async () => {
  const result = await tutorRequest(
    request,
    "secret",
    async () => new Response("sensitive detail", { status: 429 }),
  );
  assert.equal(result.status, 502);
  assert.match(result.body.error, /busy/);
  assert.ok(!result.body.error.includes("sensitive"));
});
