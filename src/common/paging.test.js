import { test } from "node:test";
import assert from "node:assert/strict";
import { pageOffset, pageNumbers } from "./paging.js";

// ArticleList passes the page the reader picked (1, 2, ...) to pageOffset.
test("pageOffset starts the first page at offset 0", () => {
  assert.equal(pageOffset(1, 10), 0);
  assert.equal(pageOffset(2, 10), 10);
  assert.equal(pageOffset(3, 10), 20);
});

test("pageNumbers lists one number per page", () => {
  assert.deepEqual(pageNumbers(10, 10), []);
  assert.deepEqual(pageNumbers(21, 10), [1, 2, 3]);
});
