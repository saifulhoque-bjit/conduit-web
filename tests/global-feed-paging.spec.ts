import { test, expect } from '@playwright/test';

// SPEC: spec-572c28
// 25 articles, 10 per page: page N asks for offset (N-1)*10 and links 1..3 show.
const TOTAL = 25;
const articles = Array.from({ length: TOTAL }, (_, i) => {
  const n = TOTAL - i; // newest first
  return {
    slug: `article-${n}`,
    title: `Article ${n}`,
    description: 'd',
    body: 'b',
    tagList: [],
    createdAt: new Date(Date.UTC(2026, 0, n)).toISOString(),
    updatedAt: new Date(Date.UTC(2026, 0, n)).toISOString(),
    favorited: false,
    favoritesCount: 0,
    author: { username: 'author', bio: null, image: null, following: false },
  };
});

const offsets: number[] = [];

test.beforeEach(async ({ page }) => {
  offsets.length = 0;
  await page.route(/\/api\/tags/, (route) => route.fulfill({ json: { tags: [] } }));
  await page.route(/\/api\/articles\?/, (route) => {
    const url = new URL(route.request().url());
    const offset = Number(url.searchParams.get('offset') ?? 0);
    const limit = Number(url.searchParams.get('limit') ?? 20);
    offsets.push(offset);
    route.fulfill({
      json: { articles: articles.slice(offset, offset + limit), articlesCount: TOTAL },
    });
  });
});

for (const [path, pageNo] of [['/', 1], ['/?page=2', 2], ['/?page=3', 3]] as const) {
  test(`Global Feed ${path} asks for page ${pageNo} and shows links 1-3`, async ({ page }) => {
    await page.goto(path);
    const expectedOffset = (pageNo - 1) * 10;
    await expect(page.getByText(`Article ${TOTAL - expectedOffset}`, { exact: true })).toBeVisible();
    expect(offsets).toContain(expectedOffset);
    expect(offsets.every((o) => o === expectedOffset)).toBe(true);
    for (const n of [1, 2, 3]) {
      await expect(page.locator(`[data-test="page-link-${n}"]`)).toBeVisible();
    }
    await expect(page.locator('[data-test="page-link-4"]')).toHaveCount(0);
  });
}
