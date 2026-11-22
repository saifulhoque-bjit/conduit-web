import { test } from "node:test";
import assert from "node:assert/strict";
import { pageOffset, pageNumbers } from "./paging.js";

// Page numbers are 1-based, as in ?page and the page links.
test("page 1 starts at the first article", () => {
  assert.equal(pageOffset(1, 10), 0);
});

test("each later page starts after the pages before it", () => {
  assert.equal(pageOffset(2, 10), 10);
  assert.equal(pageOffset(3, 10), 20);
  assert.equal(pageOffset(3, 5), 10);
});

test("a page number below 1 is read as page 1", () => {
  assert.equal(pageOffset(0, 10), 0);
  assert.equal(pageOffset(-4, 10), 0);
});

test("page links run from 1 to the last page", () => {
  assert.deepEqual(pageNumbers(25, 10), [1, 2, 3]);
  assert.deepEqual(pageNumbers(20, 10), [1, 2]);
  assert.deepEqual(pageNumbers(10, 10), []);
  assert.deepEqual(pageNumbers(0, 10), []);
});
