/* global URL, setTimeout */
// Global Feed paging: page N asks the API for offset (N - 1) * itemsPerPage,
// and a total of 25 articles at 10 per page shows page links 1, 2 and 3.
//
// Run with: node --test tests/article-list-paging.test.mjs
// The component is loaded through Vite (aliases, SFC compile) and mounted with
// a no-op renderer so onMounted runs; fetch is the only stubbed layer.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import { createRenderer, createSSRApp, nextTick, ssrContextKey } from "vue";
import { renderToString } from "vue/server-renderer";
import { createPinia } from "pinia";
import { createRouter, createMemoryHistory } from "vue-router";

const TOTAL = 25;
const PER_PAGE = 10;
// slug-1 is the newest article, slug-25 the oldest.
const allArticles = Array.from({ length: TOTAL }, (_, i) => ({
  slug: `slug-${i + 1}`,
  title: `Article ${i + 1}`,
  description: "d",
  body: "b",
  tagList: [],
  createdAt: new Date(Date.UTC(2026, 0, 1, 0, TOTAL - i)).toISOString(),
  updatedAt: new Date(Date.UTC(2026, 0, 1, 0, TOTAL - i)).toISOString(),
  favorited: false,
  favoritesCount: 0,
  author: { username: "author", bio: null, image: null, following: false }
}));

let vite;
let ArticleList;
const requests = [];

const noopRenderer = createRenderer({
  createElement: () => ({}),
  createText: () => ({}),
  createComment: () => ({}),
  setText: () => {},
  setElementText: () => {},
  insert: () => {},
  remove: () => {},
  patchProp: () => {},
  parentNode: () => null,
  nextSibling: () => null
});

before(async () => {
  const store = new Map();
  globalThis.window = globalThis;
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k)
  };
  globalThis.fetch = async (url) => {
    const parsed = new URL(url);
    requests.push(parsed);
    const offset = Number(parsed.searchParams.get("offset") || 0);
    const limit = Number(parsed.searchParams.get("limit") || 20);
    const body = {
      articles: allArticles.slice(offset, offset + limit),
      articlesCount: TOTAL
    };
    return { ok: true, status: 200, json: async () => body };
  };

  vite = await createServer({
    root: fileURLToPath(new URL("..", import.meta.url)),
    configFile: fileURLToPath(new URL("../vite.config.js", import.meta.url)),
    server: { middlewareMode: true, hmr: false, ws: false },
    appType: "custom",
    logLevel: "silent"
  });
  ({ default: ArticleList } = await vite.ssrLoadModule(
    "/src/components/ArticleList.vue"
  ));
});

after(async () => {
  await vite?.close();
});

const flush = async () => {
  for (let i = 0; i < 5; i++) {
    await new Promise((r) => setTimeout(r, 0));
    await nextTick();
  }
};

// Mounts the Global Feed list for one page and returns the request it made
// and the HTML it shows once the articles arrived.
async function showPage(currentPage) {
  requests.length = 0;
  const pinia = createPinia();
  const props = { type: "all", currentPage, itemsPerPage: PER_PAGE };

  const app = noopRenderer.createApp(
    { ...ArticleList, render: () => null, ssrRender: undefined },
    props
  );
  app.use(pinia);
  // The SSR-compiled component registers itself on the SSR context in setup.
  app.provide(ssrContextKey, { modules: new Set() });
  app.config.warnHandler = () => {};
  app.mount({});
  await flush();
  app.unmount();

  const Empty = { render: () => null };
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { name: "home", path: "/", component: Empty },
      { name: "profile", path: "/profile/:username", component: Empty },
      { name: "article", path: "/article/:slug", component: Empty }
    ]
  });
  await router.push(currentPage > 1 ? `/?page=${currentPage}` : "/");
  const ssr = createSSRApp(ArticleList, props);
  ssr.use(pinia);
  ssr.use(router);
  ssr.config.warnHandler = () => {};
  const html = await renderToString(ssr);

  assert.equal(requests.length, 1, "one article list request");
  return { request: requests[0], html };
}

// Slugs of the article previews shown, in page order.
const slugsIn = (html) =>
  [...html.matchAll(/href="\/article\/([^"]+)"/g)].map((m) => m[1]);

const pageLinks = (html) =>
  [...html.matchAll(/data-test="page-link-(\d+)"/g)].map((m) => Number(m[1]));

test("page 1 requests offset 0 and shows the 10 newest articles with links 1-3", async () => {
  const { request, html } = await showPage(1);
  assert.equal(request.searchParams.get("offset"), "0");
  assert.equal(request.searchParams.get("limit"), String(PER_PAGE));
  assert.deepEqual(
    slugsIn(html),
    allArticles.slice(0, 10).map((a) => a.slug)
  );
  assert.deepEqual(pageLinks(html), [1, 2, 3]);
});

test("page 2 requests offset 10 and shows articles 11-20 with links 1-3", async () => {
  const { request, html } = await showPage(2);
  assert.equal(request.searchParams.get("offset"), "10");
  assert.deepEqual(
    slugsIn(html),
    allArticles.slice(10, 20).map((a) => a.slug)
  );
  assert.deepEqual(pageLinks(html), [1, 2, 3]);
});

test("page 3 requests offset 20 and shows the 5 oldest articles", async () => {
  const { request, html } = await showPage(3);
  assert.equal(request.searchParams.get("offset"), "20");
  assert.deepEqual(
    slugsIn(html),
    allArticles.slice(20).map((a) => a.slug)
  );
});
