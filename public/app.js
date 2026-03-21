const TRANSLATIONS = [
  { id: "unv", label: "和合本", fullLabel: "FHL 和合本" },
  { id: "esv", label: "ESV", fullLabel: "English Standard Version" },
  { id: "ncv", label: "新譯本", fullLabel: "新譯本" },
  { id: "asv", label: "ASV", fullLabel: "American Standard Version" },
  { id: "kjv", label: "KJV", fullLabel: "King James Version" }
];

const MODE_COPY = {
  passage: {
    placeholder: "例如：約 3:16-18",
    helper: "輸入章節範圍，例如 `約 3:16-18`、`John 1`、`創 1:1-5`。",
    examples: ["約 3:16-18", "John 1", "詩 23", "創 1:1-5"]
  },
  keyword: {
    placeholder: "例如：愛、恩典、love、faith",
    helper: "先用指定譯本搜尋全本聖經（含舊約），再把同一節的五個譯本一起列出。",
    examples: ["愛", "恩典", "love", "\"eternal life\""]
  }
};

const state = {
  mode: "passage",
  query: "",
  results: [],
  isLoading: false,
  error: "",
  lastMeta: null
};

const passageCache = new Map();
const decoder = document.createElement("textarea");

const dom = {
  copyrightYear: document.getElementById("copyright-year"),
  exampleChips: document.getElementById("example-chips"),
  keywordControls: document.getElementById("keyword-controls"),
  keywordVersion: document.getElementById("keyword-version"),
  modeButtons: Array.from(document.querySelectorAll("[data-mode]")),
  modeDescription: document.getElementById("mode-description"),
  queryInput: document.getElementById("query-input"),
  resultLimit: document.getElementById("result-limit"),
  results: document.getElementById("results"),
  searchForm: document.getElementById("search-form"),
  shareButton: document.getElementById("share-button"),
  statusPills: document.getElementById("status-pills"),
  statusText: document.getElementById("status-text"),
  submitButton: document.getElementById("submit-button")
};

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
      <p>正在向信望愛查詢經文，並補齊五個譯本的內容。</p>
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
      <p>經文定位適合直接查章節，關鍵字搜尋適合先找命中的節，再對照五個譯本。</p>
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
  text = text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  return text;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getHighlightTerms(query) {
  if (!query) {
    return [];
  }

  const matches = query.match(/"[^"]+"|'[^']+'|[\p{Script=Han}\p{Letter}\p{Number}]+/gu) || [];

  return [...new Set(matches
    .map((term) => term.trim().replace(/^["']|["']$/g, ""))
    .filter(Boolean)
    .sort((left, right) => right.length - left.length))];
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

  const response = await fetch(url);
  const json = await response.json();

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

async function fetchKeywordHits(version, query, limit) {
  const json = await requestJson("/api/search", {
    version,
    q: query,
    limit,
    offset: 0
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

function resolveKeywordVersion(query, selectedVersion) {
  if (selectedVersion && selectedVersion !== "auto") {
    return selectedVersion;
  }

  return /[\p{Script=Han}]/u.test(query) ? "unv" : "esv";
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
    throw new Error("目前無法向信望愛取得經文資料。");
  }

  return mergePassageResults(recordsByVersion);
}

async function searchKeyword(query) {
  const selectedVersion = dom.keywordVersion.value;
  const resolvedVersion = resolveKeywordVersion(query, selectedVersion);
  const limit = dom.resultLimit.value;
  const hits = await fetchKeywordHits(resolvedVersion, query, limit);

  if (!hits.length) {
    return {
      results: [],
      resolvedVersion
    };
  }

  const chapterRequests = new Map();

  for (const hit of hits) {
    const reference = `${hit.bookZh} ${hit.chapter}`;
    for (const translation of TRANSLATIONS) {
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

  const results = hits.map((hit) => {
    const reference = `${hit.bookZh} ${hit.chapter}`;
    const texts = {};

    for (const translation of TRANSLATIONS) {
      texts[translation.id] =
        chapterData.get(`${translation.id}|${reference}`)?.get(hit.verse) || "";
    }

    if (!texts[resolvedVersion]) {
      texts[resolvedVersion] = hit.excerpt;
    }

    return {
      bookEn: hit.bookEn,
      bookZh: hit.bookZh,
      chapter: hit.chapter,
      verse: hit.verse,
      texts
    };
  });

  return {
    results,
    resolvedVersion
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
    pills.push(`搜尋依據：${getTranslationLabel(state.lastMeta.sourceVersion)}`);
  }

  setStatus(state.lastMeta.summary, pills);
}

function renderResults() {
  if (!state.results.length) {
    dom.results.innerHTML = `
      <section class="empty-state">
        <h2>沒有找到結果</h2>
        <p>可以試試別的卷名寫法、縮小章節範圍，或換一個關鍵字來源譯本。</p>
      </section>
    `;
    return;
  }

  const highlightQuery = state.lastMeta?.mode === "keyword" ? state.query : "";

  dom.results.innerHTML = state.results
    .map((result) => {
      const translationPanels = TRANSLATIONS.map((translation) => {
        const text = result.texts[translation.id] || "此節在該譯本沒有回傳內容。";
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
          ? `<p class="result-mode">此節是依 ${escapeHtml(getTranslationLabel(state.lastMeta.sourceVersion))} 的關鍵字結果展開。</p>`
          : `<p class="result-mode">五個譯本同步呈現。</p>`;

      return `
        <article class="result-card">
          <header class="result-header">
            <div class="result-title">
              <h3>${escapeHtml(`${result.bookZh} ${result.chapter}:${result.verse}`)}</h3>
              <span class="pill">${escapeHtml(result.bookEn)}</span>
            </div>
            ${keywordMeta}
          </header>
          <div class="translation-grid">
            ${translationPanels}
          </div>
        </article>
      `;
    })
    .join("");
}

function syncUrl() {
  const params = new URLSearchParams();
  params.set("mode", state.mode);
  params.set("q", state.query);

  if (state.mode === "keyword") {
    params.set("version", dom.keywordVersion.value);
    params.set("limit", dom.resultLimit.value);
  }

  const nextUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({}, "", nextUrl);
}

async function handleSearch(event) {
  event?.preventDefault();
  const query = dom.queryInput.value.trim();
  if (!query) {
    return;
  }

  state.query = query;
  state.error = "";
  setLoading(true);
  showLoadingCard();
  setStatus("查詢中，正在整理五個譯本的內容...");

  try {
    if (state.mode === "passage") {
      state.results = await searchPassage(query);
      state.lastMeta = {
        mode: "passage",
        summary: `已完成經文定位：${query}`
      };
    } else {
      const { results, resolvedVersion } = await searchKeyword(query);
      state.results = results;
      state.lastMeta = {
        mode: "keyword",
        sourceVersion: resolvedVersion,
        summary: `已完成關鍵字搜尋：${query}`
      };
    }

    renderStatusFromMeta();
    renderResults();
    syncUrl();
    dom.shareButton.hidden = false;
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
  try {
    await navigator.clipboard.writeText(window.location.href);
    setStatus("已複製目前查詢網址。", ["可直接貼給別人打開"]);
  } catch {
    setStatus("無法直接寫入剪貼簿，網址已保留在瀏覽器列。");
  }
}

function hydrateFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const mode = params.get("mode");
  const query = params.get("q") || "";
  const version = params.get("version");
  const limit = params.get("limit");

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
      showEmptyState();
      setStatus("等待輸入查詢條件。");
      dom.shareButton.hidden = true;
      state.results = [];
      state.lastMeta = null;
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
}

function init() {
  dom.copyrightYear.textContent = `© ${new Date().getFullYear()} 多譯本聖經查詢介面`;
  bindEvents();
  hydrateFromUrl();
}

init();
