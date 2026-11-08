import { test, expect } from "@playwright/test";
import { questionBank } from "../../src/content.mjs";
const longResponse =
  "I am agree that she go to work from home tomorrow. We discuss about the plan and the team can contact me by email. I will complete the report before the end of the day and attend our morning meeting online.";
test("placement gates lessons, assesses every answer, and survives a reload", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.getByRole("button", { name: /Reading A new perspective/ }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page
    .getByRole("button", { name: "Find my level", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Start placement test", exact: true })
    .click();
  for (let i = 0; i < 12; i++) {
    const prompt = await page.locator(".test-card h2").innerText();
    const question = questionBank.find((q) => q.prompt === prompt);
    expect(question).toBeTruthy();
    await page.getByRole("radio").nth(question.answer).check();
    await page.getByRole("button", { name: "Continue", exact: true }).click();
  }
  await expect(
    page.getByRole("button", { name: "See my results" }),
  ).toBeDisabled();
  await page.getByLabel("Your writing response").fill(longResponse);
  await page.getByRole("button", { name: "See my results" }).click();
  await expect(page.locator(".result-level")).toHaveText("C1");
  await expect(page.getByText("All skills unlocked")).toBeVisible();
  await page.reload();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "My progress" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Every small step counts." }),
  ).toBeVisible();
  await expect(page.locator(".progress-stats")).toContainText("C1");
  expect(errors).toEqual([]);
});
test("reading checks comprehension, dictionary works, demo progress is isolated", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Explore demo" }).click();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Reading lab" })
    .click();
  await page
    .getByRole("button", { name: "belonging", exact: true })
    .first()
    .click();
  await expect(page.locator(".dictionary-heading h3")).toHaveText("belonging");
  await page.getByRole("radio").nth(1).check();
  await page.getByRole("radio").nth(5).check();
  await page
    .getByLabel("Make a word your own")
    .fill("A consistent habit helps me learn every day.");
  await page.getByRole("button", { name: "Check my understanding" }).click();
  await expect(
    page.getByText("2 of 2 correct. A small step forward."),
  ).toBeVisible();
  await page.screenshot({
    path: ".playwright/reading-desktop.png",
    fullPage: true,
  });
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "My progress" })
    .click();
  await expect(page.locator(".activity-row")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Exit demo", exact: true })
    .first()
    .click();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "My progress" })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.reload();
  await expect(page.locator(".level-orbit")).toContainText("?");
});
test("writing preserves drafts and honest basic feedback without assigning a score", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Explore demo" }).click();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Writing studio" })
    .click();
  await page.getByLabel("Your draft").fill(longResponse);
  await page.getByRole("button", { name: "Complete practice" }).click();
  await expect(
    page.getByRole("heading", { name: "Your practice check-in." }),
  ).toBeVisible();
  await expect(page.locator(".correction")).toHaveCount(3);
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "My progress" })
    .click();
  await expect(page.locator(".activity-row")).toHaveCount(1);
  await expect(page.locator(".activity-row")).toContainText("Completed");
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Writing studio" })
    .click();
  await expect(page.getByLabel("Your draft")).toHaveValue(longResponse);
});
test("listening transcript, speaking fallback, and focus timer are usable", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Explore demo" }).click();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Listening hub" })
    .click();
  await expect(page.locator(".transcript")).toHaveCount(0);
  await page.getByRole("button", { name: "Reveal transcript" }).click();
  await expect(page.locator(".transcript")).toContainText("one thirty");
  await page.getByLabel("Playback speed").selectOption("0.75");
  await page
    .getByLabel("Your listening summary")
    .fill(
      "The team lunch changed to one thirty because the meeting is running longer. Sam should bring project notes.",
    );
  await page.getByRole("button", { name: "Complete practice" }).click();
  await expect(
    page.getByRole("heading", { name: "Your practice check-in." }),
  ).toBeVisible();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Speaking coach" })
    .click();
  await page
    .getByLabel("Your unedited transcript")
    .fill(
      "Hello, could I have the bill please? I would also like a receipt for my expenses.",
    );
  await page.getByRole("button", { name: "Complete practice" }).click();
  await expect(
    page.getByRole("heading", { name: "Your practice check-in." }),
  ).toBeVisible();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Today’s mission" })
    .click();
  await page.getByRole("button", { name: "Start focus timer" }).click();
  await expect(
    page.getByRole("button", { name: "Pause", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.getByRole("button", { name: "Reset timer" }).click();
  await expect(page.locator(".timer-digits")).toHaveText("25:00");
});
test("AI feedback errors retain text and retry successfully", async ({
  page,
}) => {
  await page.route("**/api/status", (r) => r.fulfill({ json: { ai: true } }));
  let attempts = 0;
  await page.route("**/api/tutor", (r) => {
    attempts++;
    return attempts === 1
      ? r.fulfill({
          status: 502,
          json: { error: "The AI response timed out. Please retry." },
        })
      : r.fulfill({
          json: {
            score: 82,
            summary: "Your request is clear. Check agreement.",
            arabic: "طلبك واضح. راجع توافق الفعل والفاعل.",
            corrections: [
              {
                original: "she go",
                replacement: "she goes",
                reason: "Third-person agreement.",
              },
            ],
            improved: "I agree that she goes to work from home.",
            strengths: ["Clear purpose"],
            weaknesses: ["Verb agreement"],
            nextSteps: ["Check third-person verbs."],
          },
        });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Explore demo" }).click();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Writing studio" })
    .click();
  await page.getByLabel("Your draft").fill(longResponse);
  await page.getByRole("button", { name: "Get my feedback" }).click();
  await expect(page.getByRole("alert")).toContainText("timed out");
  await expect(page.getByLabel("Your draft")).toHaveValue(longResponse);
  await page.getByRole("button", { name: "Get my feedback" }).click();
  await expect(page.locator(".feedback-score")).toHaveText("82/100");
});
test("mobile layout has no horizontal overflow and navigation/settings remain accessible", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.screenshot({
    path: ".playwright/overview-mobile.png",
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(
    page.getByRole("button", { name: "Open navigation", includeHidden: true }),
  ).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("navigation")).toBeHidden();
  await expect(
    page.getByRole("button", { name: "Open navigation" }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Placement test" })
    .click();
  await page.getByRole("button", { name: "Start placement test" }).click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  await page.getByRole("button", { name: "Open profile settings" }).click();
  await page.getByLabel("What should we call you?").fill("Nour");
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Welcome back, Nour." }),
  ).toBeVisible();
});
test("desktop overview renders without browser exceptions", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: ".playwright/overview-desktop.png",
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  expect(errors).toEqual([]);
});

test("AI-generated lessons replace built-in content and validate the reading flow", async ({
  page,
}) => {
  await page.route("**/api/status", (r) => r.fulfill({ json: { ai: true } }));
  await page.route("**/api/tutor", (r) =>
    r.fulfill({
      json: {
        title: "A fresh beginning",
        text: "A curious learner visits a new library. She asks a question and discovers a weekly reading club.",
        words: [
          {
            word: "curious",
            definition: "Interested in learning something.",
            arabic: "فضولي",
            example: "A curious person asks questions.",
          },
        ],
        questions: [
          {
            prompt: "Where does she go?",
            options: ["A library", "A station"],
            answer: 0,
            explanation: "She visits a new library.",
          },
        ],
      },
    }),
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Explore demo" }).click();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Reading lab" })
    .click();
  await page.getByRole("button", { name: "New AI lesson" }).click();
  await expect(
    page.getByRole("heading", { name: "A fresh beginning" }),
  ).toBeVisible();
  await page.getByRole("radio").first().check();
  await page
    .getByLabel("Make a word your own")
    .fill("I am curious about the new library.");
  await page.getByRole("button", { name: "Check my understanding" }).click();
  await expect(
    page.getByText("1 of 1 correct. A small step forward."),
  ).toBeVisible();
});

test("backup restore, export, and confirmed reset protect learner data", async ({
  page,
}) => {
  const profile = {
    assessed: true,
    level: "A2",
    scores: { grammar: 60 },
    strengths: [],
    weaknesses: ["vocabulary"],
    report: null,
    activities: [],
  };
  await page.goto("/");
  await page.getByRole("button", { name: "Open profile settings" }).click();
  await page.getByLabel("Import progress backup").setInputFiles({
    name: "backup.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify({ version: 1, name: "Nour", profile })),
  });
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Welcome back, Nour." }),
  ).toBeVisible();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "My progress" })
    .click();
  await expect(page.locator(".progress-stats")).toContainText("A2");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export progress" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^engly-progress-.*\.json$/);
  await page.getByRole("button", { name: "Open profile settings" }).click();
  await page.getByLabel("Import progress backup").setInputFiles({
    name: "bad.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"profile":{"assessed":true,"level":"Z9"}}'),
  });
  await expect(page.getByRole("status")).toContainText("not a valid");
  await page
    .getByRole("button", { name: "Reset my learning progress" })
    .click();
  await page.getByRole("button", { name: "Keep my progress" }).click();
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await expect(page.locator(".progress-stats")).toContainText("A2");
  await page.getByRole("button", { name: "Open profile settings" }).click();
  await page
    .getByRole("button", { name: "Reset my learning progress" })
    .click();
  await page
    .getByRole("button", { name: "Reset progress", exact: true })
    .click();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "My progress" })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "First, let’s find your starting point.",
    }),
  ).toBeVisible();
});
