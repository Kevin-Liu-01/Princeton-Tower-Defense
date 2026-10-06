const assert = require("node:assert/strict");
const { test } = require("node:test");
require("./register-typescript.cjs");
const {
  getVisibleTutorialTarget,
  getTutorialPanelPosition,
} = require("../src/app/components/ui/tutorialLayout.ts");
const { TUTORIAL_STEPS } = require("../src/app/constants/tutorial.ts");

test("hidden desktop toolbar cannot anchor the mobile tutorial offscreen", () => {
  const hidden = {
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 0, height: 0 }),
  };
  const mobile = {
    getBoundingClientRect: () => ({
      left: 170,
      top: 620,
      width: 72,
      height: 56,
    }),
  };
  assert.equal(getVisibleTutorialTarget([hidden, mobile]), mobile);
  assert.equal(getVisibleTutorialTarget([hidden]), null);
  assert.equal(getVisibleTutorialTarget([mobile, hidden]), mobile);
});

test("all tutorial cards fit portrait, landscape and changing Safari visible bounds", () => {
  for (const viewport of [
    { left: 0, top: 0, width: 390, height: 660 },
    { left: 0, top: 0, width: 320, height: 480 },
    { left: 0, top: 0, width: 844, height: 290 },
    { left: 0, top: 74, width: 390, height: 520 },
  ]) {
    for (const step of TUTORIAL_STEPS) {
      for (const highlight of [
        null,
        { left: 0, top: -8, width: 16, height: 16 },
        {
          left: 12,
          top: viewport.top + viewport.height - 80,
          width: 72,
          height: 56,
        },
      ]) {
        const panel = {
          width: Math.min(512, viewport.width * 0.92),
          height: 620,
        };
        const actual = getTutorialPanelPosition(
          step.position,
          highlight,
          panel,
          viewport
        );
        assert.ok(actual.left >= viewport.left);
        assert.ok(actual.left + panel.width <= viewport.left + viewport.width);
        assert.ok(actual.top >= viewport.top);
        assert.ok(
          actual.top + Math.min(panel.height, actual.maxHeight) <=
            viewport.top + viewport.height
        );
      }
    }
  }
});
