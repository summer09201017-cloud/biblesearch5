const TRANSLATIONS = [
  { id: "unv", label: "和合本", fullLabel: "和合本" },
  { id: "esv", label: "ESV", fullLabel: "English Standard Version" },
  { id: "lcc", label: "呂振中", fullLabel: "呂振中譯本" },
  { id: "ncv", label: "新譯本", fullLabel: "新譯本" },
  { id: "asv", label: "ASV", fullLabel: "American Standard Version" },
  { id: "kjv", label: "KJV", fullLabel: "King James Version" }
];

const CHINESE_SEARCH_VERSION_IDS = ["unv", "lcc", "ncv"];
const BIBLE_BOOK_ORDER = new Map([
  "Gen", "Exod", "Lev", "Num", "Deut", "Josh", "Judg", "Ruth",
  "1Sam", "2Sam", "1Kgs", "2Kgs", "1Chr", "2Chr", "Ezra", "Neh", "Esth",
  "Job", "Ps", "Prov", "Eccl", "Song", "Isa", "Jer", "Lam", "Ezek", "Dan",
  "Hos", "Joel", "Amos", "Obad", "Jonah", "Mic", "Nah", "Hab", "Zeph",
  "Hag", "Zech", "Mal", "Matt", "Mark", "Luke", "John", "Acts", "Rom",
  "1Cor", "2Cor", "Gal", "Eph", "Phil", "Col", "1Thess", "2Thess",
  "1Tim", "2Tim", "Titus", "Phlm", "Heb", "Jas", "1Pet", "2Pet",
  "1John", "2John", "3John", "Jude", "Rev"
].map((engs, index) => [engs, index]));

const MODE_COPY = {
  passage: {
    placeholder: "例如：約 3:16-18",
    helper: "輸入章節範圍，例如 `約 3:16-18`、`John 1`、`創 1:1-5`。",
    examples: ["約 3:16-18", "John 1", "詩 23", "創 1:1-5"]
  },
  keyword: {
    placeholder: "例如：愛、恩典、love、faith",
    helper: "中文關鍵字會聯合搜尋和合本、呂振中、新譯本；英文關鍵字會優先用 ESV，再把同一節的多個譯本一起列出。",
    examples: ["愛", "恩典", "love", "\"eternal life\""]
  }
};

const KEYWORD_DEFAULT_LIMIT = 20;
const KEYWORD_MULTI_VERSION_FETCH_MULTIPLIER = 2;
const KEYWORD_MULTI_VERSION_FETCH_CAP = 240;
const KEYWORD_MAX_EXPANDED_RESULTS = 20;
const REQUEST_TIMEOUT_MS = 15000;
const BACKGROUND_FULL_LOAD_DELAY_MS = 400;

const state = {
  mode: "passage",
  query: "",
  results: [],
  isLoading: false,
  error: "",
  lastMeta: null,
  selectedResultKeys: new Set(),
  visibleTranslations: new Set(TRANSLATIONS.map((translation) => translation.id))
};

let activeKeywordSearchToken = 0;

const passageCache = new Map();
const decoder = document.createElement("textarea");

const dom = {
  copyrightYear: document.getElementById("copyright-year"),
  copyVersesButton: document.getElementById("copy-verses-button"),
  exampleChips: document.getElementById("example-chips"),
  keywordControls: document.getElementById("keyword-controls"),
  keywordVersion: document.getElementById("keyword-version"),
  lineShareButton: document.getElementById("line-share-button"),
  modeButtons: Array.from(document.querySelectorAll("[data-mode]")),
  modeDescription: document.getElementById("mode-description"),
  queryInput: document.getElementById("query-input"),
  resultLimit: document.getElementById("result-limit"),
  results: document.getElementById("results"),
  searchForm: document.getElementById("search-form"),
  shareButton: document.getElementById("share-button"),
  statusPills: document.getElementById("status-pills"),
  statusText: document.getElementById("status-text"),
  submitButton: document.getElementById("submit-button"),
  translationToggles: document.getElementById("translation-toggles")
};

function parseKeywordLimit(value) {
  if (value === "all") {
    return KEYWORD_DEFAULT_LIMIT;
  }

  const numeric = Math.trunc(Number(value));
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return KEYWORD_DEFAULT_LIMIT;
  }

  return numeric;
}

function updateMode(mode, options = {}) {
  state.mode = mode;
  const copy = MODE_COPY[mode];
  dom.queryInput.placeholder = copy.placeholder;
  dom.modeDescription.textContent = copy.helper;
  dom.keywordControls.hidden = mode !== "keyword";

  for (const button of dom.modeButtons) {
    const active = button.dataset.mode === mode;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
  }

  renderExampleChips(copy.examples);

  if (!options.keepInput) {
    dom.queryInput.value = "";
  }
}

function renderExampleChips(examples) {
  dom.exampleChips.innerHTML = examples
    .map(
      (item) =>
        `<button type="button" class="chip" data-example="${escapeHtml(item)}">${escapeHtml(item)}</button>`
    )
    .join("");
}

function setLoading(isLoading) {
  state.isLoading = isLoading;
  dom.submitButton.disabled = isLoading;
  dom.submitButton.textContent = isLoading ? "查詢中..." : "立即查詢";
}

function setStatus(text, pills = []) {
  dom.statusText.textContent = text;
  dom.statusPills.innerHTML = pills
    .map((pill) => `<span class="pill">${escapeHtml(pill)}</span>`)
    .join("");
}

function showLoadingCard() {
  dom.results.innerHTML = `
    <article class="feedback-card loading">
      <h2>正在載入資料</h2>
      <p>正在整理經文結果，並補齊顯示中的譯本內容。</p>
    </article>
  `;
}

function showErrorCard(message) {
  dom.results.innerHTML = `
    <article class="feedback-card error">
      <h2>查詢失敗</h2>
      <p>${escapeHtml(message)}</p>
    </article>
  `;
}

function showEmptyState() {
  dom.results.innerHTML = `
    <section class="empty-state">
      <h2>輸入經文或關鍵字開始查詢</h2>
      <p>經文定位適合直接查章節，關鍵字搜尋適合先找命中的節，再對照多個譯本。</p>
    </section>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function cleanVerseText(rawText) {
  let text = String(rawText || "");
  text = text.replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, "【$1】 ");
  text = text.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/<\/p>\s*<p>/gi, "\n");
  text = text.replace(/<[^>]+>/g, "");
  decoder.innerHTML = text;
  text = decoder.value;
  return text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getHighlightTerms(query) {
  if (!query) {
    return [];
  }

  const matches = query.match(/"[^"]+"|'[^']+'|[\p{Script=Han}\p{Letter}\p{Number}]+/gu) || [];

  return [...new Set(
    matches
      .map((term) => term.trim().replace(/^["']|["']$/g, ""))
      .filter(Boolean)
      .sort((left, right) => right.length - left.length)
  )];
}

function renderVerseText(text, highlightQuery) {
  const normalized = cleanVerseText(text);

  if (!highlightQuery) {
    return escapeHtml(normalized).replaceAll("\n", "<br>");
  }

  const terms = getHighlightTerms(highlightQuery);
  if (!terms.length) {
    return escapeHtml(normalized).replaceAll("\n", "<br>");
  }

  const matcher = new RegExp(`(${terms.map(escapeRegExp).join("|")})`, "giu");
  const parts = normalized.split(matcher);

  return parts
    .map((part) => {
      if (terms.some((term) => term.toLocaleLowerCase() === part.toLocaleLowerCase())) {
        return `<mark>${escapeHtml(part)}</mark>`;
      }

      return escapeHtml(part);
    })
    .join("")
    .replaceAll("\n", "<br>");
}

async function requestJson(pathname, params) {
  const url = new URL(pathname, window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response;
  let json;

  try {
    response = await fetch(url, { signal: controller.signal });
    json = await response.json();
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("查詢逾時，請縮小條件或稍後再試。");
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok || json.status === "error") {
    throw new Error(json.message || "查詢服務暫時無法使用。");
  }

  return json;
}

async function fetchPassageRecords(version, qstr) {
  const cacheKey = `${version}|${qstr}`;
  if (passageCache.has(cacheKey)) {
    return passageCache.get(cacheKey);
  }

  const request = requestJson("/api/passage", { version, qstr })
    .then((json) =>
      (json.record || []).map((item) => ({
        bookEn: item.engs || "",
        bookZh: item.chineses || "",
        chapter: Number(item.chap),
        verse: Number(item.sec),
        text: cleanVerseText(item.bible_text),
        key: `${item.engs || item.chineses}-${item.chap}-${item.sec}`
      }))
    )
    .catch((error) => {
      passageCache.delete(cacheKey);
      throw error;
    });

  passageCache.set(cacheKey, request);
  return request;
}

async function fetchKeywordHits(version, query, limit, offset = 0) {
  const json = await requestJson("/api/search", {
    version,
    q: query,
    limit,
    offset
  });

  return (json.record || []).map((item) => ({
    bookEn: item.engs || "",
    bookZh: item.chineses || "",
    chapter: Number(item.chap),
    verse: Number(item.sec),
    excerpt: cleanVerseText(item.bible_text)
  }));
}

async function runWithConcurrency(items, limit, mapper) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const current = nextIndex;
      nextIndex += 1;
      results[current] = await mapper(items[current], current);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, worker);
  await Promise.all(workers);
  return results;
}

function getTranslationLabel(versionId) {
  return TRANSLATIONS.find((item) => item.id === versionId)?.label || versionId;
}

function getTranslationFullLabel(versionId) {
  return TRANSLATIONS.find((item) => item.id === versionId)?.fullLabel || versionId;
}

function makeResultKey(bookEn, chapter, verse) {
  return `${bookEn}-${chapter}-${verse}`;
}

function formatTranslationLabels(versionIds) {
  return versionIds.map((versionId) => getTranslationLabel(versionId)).join(" / ");
}

function getVisibleTranslations() {
  return TRANSLATIONS.filter((translation) => state.visibleTranslations.has(translation.id));
}

function renderTranslationToggles() {
  dom.translationToggles.innerHTML = TRANSLATIONS
    .map(
      (translation) => `
        <label class="translation-toggle">
          <input
            class="translation-toggle-input"
            type="checkbox"
            value="${translation.id}"
            ${state.visibleTranslations.has(translation.id) ? "checked" : ""}
          />
          <span class="translation-toggle-label">${escapeHtml(translation.label)}</span>
        </label>
      `
    )
    .join("");
}

function updateActionButtons() {
  dom.copyVersesButton.disabled =
    state.mode !== "keyword" ||
    state.selectedResultKeys.size === 0 ||
    !getVisibleTranslations().length;
}

function compareBibleReference(left, right) {
  const leftOrder = BIBLE_BOOK_ORDER.get(left.bookEn) ?? Number.MAX_SAFE_INTEGER;
  const rightOrder = BIBLE_BOOK_ORDER.get(right.bookEn) ?? Number.MAX_SAFE_INTEGER;

  if (leftOrder !== rightOrder) {
    return leftOrder - rightOrder;
  }

  if (left.chapter !== right.chapter) {
    return left.chapter - right.chapter;
  }

  if (left.verse !== right.verse) {
    return left.verse - right.verse;
  }

  return 0;
}

function resolveKeywordSearchPlan(query, selectedVersion) {
  const hasHan = /[\p{Script=Han}]/u.test(query);
  const hasLatin = /[A-Za-z]/.test(query);

  if (hasHan) {
    return {
      versions: [...CHINESE_SEARCH_VERSION_IDS],
      sourceLabel: formatTranslationLabels(CHINESE_SEARCH_VERSION_IDS)
    };
  }

  let resolvedVersion;

  if (hasLatin && !hasHan && (!selectedVersion || selectedVersion === "auto" || selectedVersion === "unv")) {
    resolvedVersion = "esv";
  } else if (selectedVersion && selectedVersion !== "auto") {
    resolvedVersion = selectedVersion;
  } else {
    resolvedVersion = "esv";
  }

  return {
    versions: [resolvedVersion],
    sourceLabel: getTranslationLabel(resolvedVersion)
  };
}

function mergePassageResults(recordsByVersion) {
  const order = [];
  const verseMap = new Map();

  for (const translation of TRANSLATIONS) {
    const rows = recordsByVersion[translation.id] || [];
    for (const row of rows) {
      if (!verseMap.has(row.key)) {
        order.push(row.key);
        verseMap.set(row.key, {
          key: row.key,
          bookEn: row.bookEn,
          bookZh: row.bookZh,
          chapter: row.chapter,
          verse: row.verse,
          texts: {}
        });
      }

      verseMap.get(row.key).texts[translation.id] = row.text;
    }
  }

  return order.map((key) => verseMap.get(key));
}

async function searchPassage(query) {
  const recordsByVersion = {};
  const settled = await Promise.allSettled(
    TRANSLATIONS.map(async (translation) => {
      recordsByVersion[translation.id] = await fetchPassageRecords(translation.id, query);
    })
  );

  if (settled.every((item) => item.status === "rejected")) {
    throw new Error("目前無法取得經文資料。");
  }

  return mergePassageResults(recordsByVersion);
}

async function searchKeyword(query, options = {}) {
  const forceAll = Boolean(options.forceAll);
  const selectedVersion = dom.keywordVersion.value;
  const searchPlan = resolveKeywordSearchPlan(query, selectedVersion);
  const limitValue = dom.resultLimit.value;
  const requestedAll = forceAll || limitValue === "all";
  const visibleLimit = requestedAll
    ? (forceAll ? Number.POSITIVE_INFINITY : KEYWORD_DEFAULT_LIMIT)
    : parseKeywordLimit(limitValue);
  const perVersionFetchLimit = requestedAll
    ? forceAll
      ? "all"
      : Math.max(visibleLimit, visibleLimit * KEYWORD_MULTI_VERSION_FETCH_MULTIPLIER)
    : searchPlan.versions.length > 1
      ? Math.min(
          KEYWORD_MULTI_VERSION_FETCH_CAP,
          Math.max(visibleLimit, visibleLimit * KEYWORD_MULTI_VERSION_FETCH_MULTIPLIER)
        )
      : visibleLimit;
  const hitsByVersion = new Map();

  await Promise.all(
    searchPlan.versions.map(async (version) => {
      hitsByVersion.set(version, await fetchKeywordHits(version, query, perVersionFetchLimit));
    })
  );

  const mergedHits = [];
  const hitMap = new Map();

  for (const version of searchPlan.versions) {
    const hits = hitsByVersion.get(version) || [];

    for (const hit of hits) {
      const key = `${hit.bookEn || hit.bookZh}-${hit.chapter}-${hit.verse}`;

      if (!hitMap.has(key)) {
        hitMap.set(key, {
          bookEn: hit.bookEn,
          bookZh: hit.bookZh,
          chapter: hit.chapter,
          verse: hit.verse,
          matchedVersions: [],
          excerpts: {}
        });
        mergedHits.push(hitMap.get(key));
      }

      const entry = hitMap.get(key);

      if (!entry.matchedVersions.includes(version)) {
        entry.matchedVersions.push(version);
      }

      entry.excerpts[version] = hit.excerpt;
    }
  }

  mergedHits.sort(compareBibleReference);

  const visibleHits =
    requestedAll && forceAll
      ? mergedHits
      : mergedHits.slice(0, visibleLimit);

  if (!visibleHits.length) {
    return {
      results: [],
      searchPlan,
      meta: {
        visibleLimit,
        wasCapped: false,
        pendingFullLoad: false
      }
    };
  }

  const chapterRequests = new Map();
  const visibleTranslations = getVisibleTranslations();
  const hitsForExpansion = visibleHits.slice(0, KEYWORD_MAX_EXPANDED_RESULTS);

  for (const hit of hitsForExpansion) {
    const reference = `${hit.bookZh} ${hit.chapter}`;
    for (const translation of visibleTranslations) {
      const key = `${translation.id}|${reference}`;
      if (!chapterRequests.has(key)) {
        chapterRequests.set(key, {
          version: translation.id,
          qstr: reference,
          reference
        });
      }
    }
  }

  const chapterData = new Map();

  await runWithConcurrency([...chapterRequests.values()], 8, async (request) => {
    try {
      const records = await fetchPassageRecords(request.version, request.qstr);
      const verseMap = new Map(records.map((row) => [row.verse, row.text]));
      chapterData.set(`${request.version}|${request.reference}`, verseMap);
    } catch {
      chapterData.set(`${request.version}|${request.reference}`, new Map());
    }
  });

  const results = visibleHits.map((hit) => {
    const reference = `${hit.bookZh} ${hit.chapter}`;
    const texts = {};

    for (const translation of visibleTranslations) {
      texts[translation.id] =
        chapterData.get(`${translation.id}|${reference}`)?.get(hit.verse) || "";
    }

    for (const matchedVersion of hit.matchedVersions) {
      if (!texts[matchedVersion] && hit.excerpts[matchedVersion]) {
        texts[matchedVersion] = hit.excerpts[matchedVersion];
      }
    }

    return {
      key: makeResultKey(hit.bookEn, hit.chapter, hit.verse),
      bookEn: hit.bookEn,
      bookZh: hit.bookZh,
      chapter: hit.chapter,
      verse: hit.verse,
      matchedVersions: hit.matchedVersions,
      texts
    };
  });

  return {
    results,
    searchPlan,
    meta: {
      visibleLimit,
      wasCapped: mergedHits.length > visibleLimit,
      pendingFullLoad: (limitValue === "all" || limitValue === "20") && mergedHits.length > visibleLimit
    }
  };
}

function renderStatusFromMeta() {
  if (!state.lastMeta) {
    setStatus("等待輸入查詢條件。");
    return;
  }

  const pills = [
    state.lastMeta.mode === "passage" ? "經文定位" : "關鍵字搜尋",
    `顯示 ${state.results.length} 筆結果`
  ];

  if (state.lastMeta.mode === "keyword") {
    pills.push(`來源 ${state.lastMeta.sourceLabel}`);
  }

  setStatus(state.lastMeta.summary, pills);
}

function renderResults() {
  if (!state.results.length) {
    dom.results.innerHTML = `
      <section class="empty-state">
        <h2>目前沒有符合結果</h2>
        <p>可以試試別的卷名寫法、縮小章節範圍，或換一個關鍵字來源譯本。</p>
      </section>
    `;
    updateActionButtons();
    return;
  }

  const highlightQuery = state.lastMeta?.mode === "keyword" ? state.query : "";
  const visibleTranslations = getVisibleTranslations();

  dom.results.innerHTML = state.results
    .map((result) => {
      const translationPanels = visibleTranslations.map((translation) => {
        const text = result.texts[translation.id] || "此譯本在目前資料來源中沒有對應節次。";
        return `
          <article class="translation-panel">
            <div class="translation-top">
              <span class="version-badge ${translation.id}">${escapeHtml(translation.label)}</span>
              <span class="translation-meta">${escapeHtml(translation.fullLabel)}</span>
            </div>
            <p class="verse-text">${renderVerseText(text, highlightQuery)}</p>
          </article>
        `;
      }).join("");

      const keywordMeta =
        state.lastMeta?.mode === "keyword"
          ? `<p class="result-mode">此節由 ${escapeHtml(formatTranslationLabels(result.matchedVersions || state.lastMeta.sourceVersions || []))} 命中。</p>`
          : `<p class="result-mode">依你勾選的譯本同步呈現。</p>`;

      const selectionControl =
        state.lastMeta?.mode === "keyword"
          ? `
            <label class="result-selector">
              <input
                class="result-selector-input"
                type="checkbox"
                data-result-key="${escapeHtml(result.key)}"
                ${state.selectedResultKeys.has(result.key) ? "checked" : ""}
              />
              <span>選取複製</span>
            </label>
          `
          : "";

      const translationContent = translationPanels || `
        <div class="translation-empty">
          請先勾選至少一個要顯示的聖經譯本。
        </div>
      `;

      return `
        <article class="result-card">
          <header class="result-header">
            <div class="result-header-top">
              <div class="result-title">
                <h3>${escapeHtml(`${result.bookZh} ${result.chapter}:${result.verse}`)}</h3>
                <span class="pill">${escapeHtml(result.bookEn)}</span>
              </div>
              ${selectionControl}
            </div>
            ${keywordMeta}
          </header>
          <div class="translation-grid">
            ${translationContent}
          </div>
        </article>
      `;
    })
    .join("");

  updateActionButtons();
}

function syncUrl() {
  const params = new URLSearchParams();
  params.set("mode", state.mode);
  params.set("q", state.query);
  params.set("shown", [...state.visibleTranslations].join(","));

  if (state.mode === "keyword") {
    params.set("version", dom.keywordVersion.value);
    params.set("limit", dom.resultLimit.value);
  }

  const nextUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({}, "", nextUrl);
}

function scheduleBackgroundKeywordLoad(query, searchToken) {
  const runner = () => {
    if (searchToken !== activeKeywordSearchToken || state.mode !== "keyword" || state.query !== query) {
      return;
    }

    void loadKeywordResultsInBackground(query, searchToken);
  };

  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(runner, { timeout: BACKGROUND_FULL_LOAD_DELAY_MS });
    return;
  }

  window.setTimeout(runner, BACKGROUND_FULL_LOAD_DELAY_MS);
}

async function loadKeywordResultsInBackground(query, searchToken) {
  try {
    const { results, searchPlan } = await searchKeyword(query, { forceAll: true });
    if (
      searchToken !== activeKeywordSearchToken ||
      state.mode !== "keyword" ||
      state.query !== query ||
      !["all", "20"].includes(dom.resultLimit.value)
    ) {
      return;
    }

    state.results = results;
    state.lastMeta = {
      mode: "keyword",
      sourceLabel: searchPlan.sourceLabel,
      sourceVersions: searchPlan.versions,
      summary:
        searchPlan.versions.length > 1
          ? `已完成中文三譯本聯合搜尋：${query}（已載入全部 ${results.length} 筆）`
          : `已完成關鍵字搜尋：${query}（已載入全部 ${results.length} 筆）`
    };

    renderStatusFromMeta();
    renderResults();
    syncUrl();
  } catch (error) {
    if (
      searchToken !== activeKeywordSearchToken ||
      state.mode !== "keyword" ||
      state.query !== query ||
      !["all", "20"].includes(dom.resultLimit.value)
    ) {
      return;
    }

    const message = error instanceof Error ? error.message : String(error);
    setStatus(`已先顯示前 ${KEYWORD_DEFAULT_LIMIT} 筆；完整載入失敗：${message}`, ["可先縮小關鍵字範圍"]);
  }
}

async function handleSearch(event) {
  event?.preventDefault();
  const query = dom.queryInput.value.trim();
  if (!query) {
    return;
  }

  const searchToken = ++activeKeywordSearchToken;
  let shouldAutoLoadAll = false;

  state.query = query;
  state.error = "";
  state.selectedResultKeys = new Set();
  setLoading(true);
  showLoadingCard();
  updateActionButtons();
  setStatus("查詢中，正在整理多個譯本的內容...");

  try {
    if (state.mode === "passage") {
      state.results = await searchPassage(query);
      if (searchToken !== activeKeywordSearchToken) {
        return;
      }

      state.lastMeta = {
        mode: "passage",
        summary: `已完成經文定位：${query}`
      };
    } else {
      const { results, searchPlan, meta } = await searchKeyword(query);
      if (searchToken !== activeKeywordSearchToken) {
        return;
      }

      shouldAutoLoadAll = meta.pendingFullLoad;

      const pendingNote = shouldAutoLoadAll
        ? `（先顯示前 ${meta.visibleLimit} 筆，背景載入全部中）`
        : "";
      const speedNote = !shouldAutoLoadAll && meta.wasCapped
        ? `（為了速度先顯示前 ${meta.visibleLimit} 筆）`
        : "";

      state.results = results;
      state.lastMeta = {
        mode: "keyword",
        sourceLabel: searchPlan.sourceLabel,
        sourceVersions: searchPlan.versions,
        summary:
          searchPlan.versions.length > 1
            ? `已完成中文三譯本聯合搜尋：${query}${pendingNote}${speedNote}`
            : `已完成關鍵字搜尋：${query}${pendingNote}${speedNote}`
      };
    }

    if (searchToken !== activeKeywordSearchToken) {
      return;
    }

    renderStatusFromMeta();
    renderResults();
    syncUrl();
    dom.shareButton.hidden = false;

    if (shouldAutoLoadAll) {
      scheduleBackgroundKeywordLoad(query, searchToken);
    }
  } catch (error) {
    state.results = [];
    state.error = error instanceof Error ? error.message : String(error);
    state.lastMeta = null;
    setStatus("查詢失敗，請稍後再試。");
    showErrorCard(state.error);
  } finally {
    setLoading(false);
  }
}

async function copyShareLink() {
  const shareData = {
    title: "多譯本聖經查詢",
    text: state.query ? `分享查詢：${state.query}` : "分享多譯本聖經查詢網站",
    url: window.location.href
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
      setStatus("已開啟分享面板。", ["可直接傳給其他人"]);
      return;
    }

    await navigator.clipboard.writeText(window.location.href);
    setStatus("已複製目前查詢網址。", ["可直接貼給別人打開"]);
  } catch {
    setStatus("無法直接分享，網址已保留在瀏覽器列。");
  }
}

function shareToLine() {
  const shareText = state.query ? `多譯本聖經查詢：${state.query}` : "多譯本聖經查詢";
  const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(`${shareText}\n${window.location.href}`)}`;
  const opened = window.open(lineUrl, "_blank", "noopener,noreferrer");

  if (!opened) {
    window.location.href = lineUrl;
  }

  setStatus("已開啟 Line 分享。", ["可直接傳送目前查詢"]);
}

function buildCopyVersesPayload() {
  if (state.mode !== "keyword") {
    return null;
  }

  const selectedResults = state.results.filter((result) => state.selectedResultKeys.has(result.key));
  if (!selectedResults.length) {
    return null;
  }

  const visibleTranslations = getVisibleTranslations();
  if (!visibleTranslations.length) {
    return null;
  }

  const text = selectedResults
    .map((result) => {
      const lines = [`${result.bookZh} ${result.chapter}:${result.verse}`];

      for (const translation of visibleTranslations) {
        lines.push(getTranslationFullLabel(translation.id));
        lines.push(result.texts[translation.id] || "此譯本在目前資料來源中沒有對應節次。");
      }

      return lines.join("\n");
    })
    .join("\n\n");

  return {
    count: selectedResults.length,
    text,
    visibleVersions: visibleTranslations.map((translation) => translation.id)
  };
}

async function copySelectedVerses() {
  const payload = buildCopyVersesPayload();

  if (!payload) {
    setStatus("請先在關鍵字搜尋結果勾選要複製的經文。");
    return;
  }

  try {
    await navigator.clipboard.writeText(payload.text);
    setStatus("已複製勾選的經文。", [
      `共 ${payload.count} 節`,
      `譯本 ${formatTranslationLabels(payload.visibleVersions)}`
    ]);
  } catch {
    setStatus("無法直接複製，請確認瀏覽器允許剪貼簿權限。");
  }
}

function hydrateFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const mode = params.get("mode");
  const query = params.get("q") || "";
  const version = params.get("version");
  const limit = params.get("limit");
  const shown = params.get("shown");

  if (mode === "keyword" || mode === "passage") {
    updateMode(mode, { keepInput: true });
  } else {
    updateMode("passage", { keepInput: true });
  }

  if (version) {
    dom.keywordVersion.value = version;
  }

  if (limit) {
    dom.resultLimit.value = limit;
  }

  if (shown) {
    const visibleTranslations = shown
      .split(",")
      .map((value) => value.trim())
      .filter((value) => TRANSLATIONS.some((translation) => translation.id === value));

    if (visibleTranslations.length) {
      state.visibleTranslations = new Set(visibleTranslations);
    }
  }

  renderTranslationToggles();

  if (query) {
    dom.queryInput.value = query;
    handleSearch();
  } else {
    showEmptyState();
  }
}

function bindEvents() {
  dom.searchForm.addEventListener("submit", handleSearch);

  dom.modeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      updateMode(button.dataset.mode);
      activeKeywordSearchToken += 1;
      state.query = "";
      state.results = [];
      state.lastMeta = null;
      state.selectedResultKeys = new Set();
      showEmptyState();
      setStatus("等待輸入查詢條件。");
      updateActionButtons();
      syncUrl();
    });
  });

  dom.exampleChips.addEventListener("click", (event) => {
    const button = event.target.closest("[data-example]");
    if (!button) {
      return;
    }

    dom.queryInput.value = button.dataset.example || "";
    handleSearch();
  });

  dom.shareButton.addEventListener("click", copyShareLink);
  dom.lineShareButton.addEventListener("click", shareToLine);
  dom.copyVersesButton.addEventListener("click", copySelectedVerses);

  dom.translationToggles.addEventListener("change", (event) => {
    const input = event.target.closest(".translation-toggle-input");
    if (!input) {
      return;
    }

    const checkedIds = Array.from(
      dom.translationToggles.querySelectorAll(".translation-toggle-input:checked"),
      (checkbox) => checkbox.value
    );

    if (!checkedIds.length) {
      input.checked = true;
      setStatus("至少要勾選一個聖經譯本。");
      return;
    }

    state.visibleTranslations = new Set(checkedIds);
    renderResults();
    syncUrl();
  });

  dom.results.addEventListener("change", (event) => {
    const input = event.target.closest(".result-selector-input");
    if (!input) {
      return;
    }

    const resultKey = input.dataset.resultKey || "";
    if (!resultKey) {
      return;
    }

    if (input.checked) {
      state.selectedResultKeys.add(resultKey);
    } else {
      state.selectedResultKeys.delete(resultKey);
    }

    updateActionButtons();
  });
}

function init() {
  dom.copyrightYear.textContent = `© ${new Date().getFullYear()} 多譯本聖經查詢介面`;
  dom.shareButton.hidden = false;
  renderTranslationToggles();
  bindEvents();
  hydrateFromUrl();
  updateActionButtons();
}

init();
