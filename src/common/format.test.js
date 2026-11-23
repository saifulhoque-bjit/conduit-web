import { test } from "node:test";
import assert from "node:assert/strict";
import { formatWordCount } from "./format.js";

test("formatWordCount shows the article's word count", () => {
  assert.equal(formatWordCount(0), "0 words");
  assert.equal(formatWordCount(1), "1 words");
  assert.equal(formatWordCount(4), "4 words");
});

test("formatWordCount shows nothing without a count", () => {
  assert.equal(formatWordCount(undefined), "");
  assert.equal(formatWordCount(-1), "");
  assert.equal(formatWordCount(2.5), "");
});
