// SPEC: spec-aabc69
// The article page shows "N min read" beside the date, from readingTimeMinutes.
import { test } from "node:test";
import assert from "node:assert/strict";
import { formatReadingTime } from "../../src/common/format.js";

test("shows N min read from readingTimeMinutes", () => {
  assert.equal(formatReadingTime(1), "1 min read");
  assert.equal(formatReadingTime(2), "2 min read");
});

test("shows nothing when the article has no readingTimeMinutes", () => {
  assert.equal(formatReadingTime(undefined), "");
  assert.equal(formatReadingTime(null), "");
});
