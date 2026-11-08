import test, { after, before } from "node:test";
import assert from "node:assert/strict";
process.env.NODE_ENV = "test";
const { server } = await import("../server.mjs");
let base;
before(async () => {
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => new Promise((resolve) => server.close(resolve)));
test("server responds to status and blocks hidden files and filesystem escapes", async () => {
  const status = await fetch(`${base}/api/status`);
  assert.equal(status.status, 200);
  assert.equal(typeof (await status.json()).ai, "boolean");
  const secret = await fetch(`${base}/.env`);
  assert.equal(secret.status, 404);
  const traversal = await fetch(`${base}/..%2f..%2fpackage.json`);
  assert.equal(traversal.status, 404);
  const badEncoding = await fetch(`${base}/%ZZ`);
  assert.equal(badEncoding.status, 404);
});
test("API enforces method, origin, content type, and request validation", async () => {
  assert.equal((await fetch(`${base}/api/tutor`)).status, 405);
  assert.equal(
    (
      await fetch(`${base}/api/tutor`, {
        method: "POST",
        headers: {
          origin: "https://untrusted.example",
          "content-type": "application/json",
        },
        body: "{}",
      })
    ).status,
    403,
  );
  assert.equal(
    (await fetch(`${base}/api/tutor`, { method: "POST", body: "{}" })).status,
    415,
  );
  assert.equal(
    (
      await fetch(`${base}/api/tutor`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{}",
      })
    ).status,
    400,
  );
  const large = await fetch(`${base}/api/tutor`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ input: "x".repeat(25000) }),
  });
  assert.equal(large.status, 413);
});
