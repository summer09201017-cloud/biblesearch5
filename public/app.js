const TRANSLATIONS = [
  { id: "unv", label: "和合本", fullLabel: "和合本" },
  { id: "esv", label: "ESV", fullLabel: "English Standard Version" },
  { id: "niv", label: "NIV", fullLabel: "New International Version" },
  { id: "lcc", label: "呂振中", fullLabel: "呂振中譯本" },
  { id: "ncv", label: "新譯本", fullLabel: "新譯本" },
  { id: "asv", label: "ASV", fullLabel: "American Standard Version" },
  { id: "kjv", label: "KJV", fullLabel: "King James Version" }
];

const BOOKS = [
  { engs: "Gen", zh: "創", chapters: 50 },
  { engs: "Exod", zh: "出", chapters: 40 },
  { engs: "Lev", zh: "利", chapters: 27 },
  { engs: "Num", zh: "民", chapters: 36 },
  { engs: "Deut", zh: "申", chapters: 34 },
  { engs: "Josh", zh: "書", chapters: 24 },
  { engs: "Judg", zh: "士", chapters: 21 },
  { engs: "Ruth", zh: "得", chapters: 4 },
  { engs: "1Sam", zh: "撒上", chapters: 31 },
  { engs: "2Sam", zh: "撒下", chapters: 24 },
  { engs: "1Kgs", zh: "王上", chapters: 22 },
  { engs: "2Kgs", zh: "王下", chapters: 25 },
  { engs: "1Chr", zh: "代上", chapters: 29 },
  { engs: "2Chr", zh: "代下", chapters: 36 },
  { engs: "Ezra", zh: "拉", chapters: 10 },
  { engs: "Neh", zh: "尼", chapters: 13 },
  { engs: "Esth", zh: "斯", chapters: 10 },
  { engs: "Job", zh: "伯", chapters: 42 },
  { engs: "Ps", zh: "詩", chapters: 150 },
  { engs: "Prov", zh: "箴", chapters: 31 },
  { engs: "Eccl", zh: "傳", chapters: 12 },
  { engs: "Song", zh: "歌", chapters: 8 },
  { engs: "Isa", zh: "賽", chapters: 66 },
  { engs: "Jer", zh: "耶", chapters: 52 },
  { engs: "Lam", zh: "哀", chapters: 5 },
  { engs: "Ezek", zh: "結", chapters: 48 },
  { engs: "Dan", zh: "但", chapters: 12 },
  { engs: "Hos", zh: "何", chapters: 14 },
  { engs: "Joel", zh: "珥", chapters: 3 },
  { engs: "Amos", zh: "摩", chapters: 9 },
  { engs: "Obad", zh: "俄", chapters: 1 },
  { engs: "Jonah", zh: "拿", chapters: 4 },
  { engs: "Mic", zh: "彌", chapters: 7 },
  { engs: "Nah", zh: "鴻", chapters: 3 },
  { engs: "Hab", zh: "哈", chapters: 3 },
  { engs: "Zeph", zh: "番", chapters: 3 },
  { engs: "Hag", zh: "該", chapters: 2 },
  { engs: "Zech", zh: "亞", chapters: 14 },
  { engs: "Mal", zh: "瑪", chapters: 4 },
  { engs: "Matt", zh: "太", chapters: 28 },
  { engs: "Mark", zh: "可", chapters: 16 },
  { engs: "Luke", zh: "路", chapters: 24 },
  { engs: "John", zh: "約", chapters: 21 },
  { engs: "Acts", zh: "徒", chapters: 28 },
  { engs: "Rom", zh: "羅", chapters: 16 },
  { engs: "1Cor", zh: "林前", chapters: 16 },
  { engs: "2Cor", zh: "林後", chapters: 13 },
  { engs: "Gal", zh: "加", chapters: 6 },
  { engs: "Eph", zh: "弗", chapters: 6 },
  { engs: "Phil", zh: "腓", chapters: 4 },
  { engs: "Col", zh: "西", chapters: 4 },
  { engs: "1Thess", zh: "帖前", chapters: 5 },
  { engs: "2Thess", zh: "帖後", chapters: 3 },
  { engs: "1Tim", zh: "提前", chapters: 6 },
  { engs: "2Tim", zh: "提後", chapters: 4 },
  { engs: "Titus", zh: "多", chapters: 3 },
  { engs: "Phlm", zh: "門", chapters: 1 },
  { engs: "Heb", zh: "來", chapters: 13 },
  { engs: "Jas", zh: "雅", chapters: 5 },
  { engs: "1Pet", zh: "彼前", chapters: 5 },
  { engs: "2Pet", zh: "彼後", chapters: 3 },
  { engs: "1John", zh: "約一", chapters: 5 },
  { engs: "2John", zh: "約二", chapters: 1 },
  { engs: "3John", zh: "約三", chapters: 1 },
  { engs: "Jude", zh: "猶", chapters: 1 },
  { engs: "Rev", zh: "啟", chapters: 22 }
];

const BOOK_BY_ENGS = new Map(BOOKS.map((book) => [book.engs, book]));
const CHINESE_SEARCH_VERSION_IDS = ["unv", "lcc", "ncv"];
const BIBLE_BOOK_ORDER = new Map(BOOKS.map((book, index) => [book.engs, index]));
const FHL_COMMENTARY_BASE = "https://bible.fhl.net/new/com.php";

const MODE_COPY = {
  passage: {
    placeholder: "例如：約 3:16-18",
    helper: "可直接輸入章節範圍，或用下拉選單選擇書卷、章、節；也可在結果上方切換上一章與下一章。",
    examples: ["約 3:16-18", "John 1", "詩 23", "創 1:1-5"]
  },
  keyword: {
    placeholder: "例如：愛、恩典、love、faith",
    helper: "輸入到第 2 個字後會自動搜尋。中文關鍵字會聯合搜尋和合本、呂振中、新譯本；英文關鍵字會優先用 ESV，也可手動切換到 NIV，再把同一節的多個譯本一起列出。",
    examples: ["愛", "恩典", "love", "\"eternal life\""]
  }
};

const KEYWORD_DEFAULT_LIMIT = 20;
const KEYWORD_MULTI_VERSION_FETCH_MULTIPLIER = 2;
const KEYWORD_MULTI_VERSION_FETCH_CAP = 240;
const KEYWORD_MAX_EXPANDED_RESULTS = 20;
const KEYWORD_AUTO_SEARCH_MIN_LENGTH = 2;
const KEYWORD_AUTO_SEARCH_DELAY_MS = 120;
const REQUEST_TIMEOUT_MS = 15000;
const BACKGROUND_FULL_LOAD_DELAY_MS = 400;
const DEFAULT_VERSE_FONT_SIZE = 16;
const MIN_VERSE_FONT_SIZE = 8;
const MAX_VERSE_FONT_SIZE = 40;
const VERSE_FONT_SIZE_STORAGE_KEY = "bible-verse-font-size";

const state = {
  mode: "passage",
  query: "",
  results: [],
  isLoading: false,
  error: "",
  lastMeta: null,
  passageSelection: {
    bookEn: BOOKS[0].engs,
    chapter: 1,
    verse: ""
  },
  selectedResultKeys: new Set(),
  visibleTranslations: new Set(TRANSLATIONS.map((translation) => translation.id)),
  pendingFocusResultKey: ""
};

let activeKeywordSearchToken = 0;
let keywordAutoSearchTimer = 0;
let isComposingKeywordInput = false;

const passageCache = new Map();
const decoder = document.createElement("textarea");

const dom = {
  copyrightYear: document.getElementById("copyright-year"),
  copyVersesButton: document.getElementById("copy-verses-button"),
  exampleChips: document.getElementById("example-chips"),
  fontSizeRange: document.getElementById("font-size-range"),
  fontSizeValue: document.getElementById("font-size-value"),
  keywordControls: document.getElementById("keyword-controls"),
  keywordVersion: document.getElementById("keyword-version"),
  lineShareButton: document.getElementById("line-share-button"),
  modeButtons: Array.from(document.querySelectorAll("[data-mode]")),
  modeDescription: document.getElementById("mode-description"),
  passageBook: document.getElementById("passage-book"),
  passageChapter: document.getElementById("passage-chapter"),
  passageControls: document.getElementById("passage-controls"),
  passageVerse: document.getElementById("passage-verse"),
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

function clampVerseFontSize(value) {
  const numeric = Math.trunc(Number(value));
  if (!Number.isFinite(numeric)) {
    return DEFAULT_VERSE_FONT_SIZE;
  }

  return Math.min(MAX_VERSE_FONT_SIZE, Math.max(MIN_VERSE_FONT_SIZE, numeric));
}

function updateVerseFontSizeDisplay(size) {
  if (dom.fontSizeRange) {
    dom.fontSizeRange.value = String(size);
  }

  if (dom.fontSizeValue) {
    dom.fontSizeValue.textContent = `${Math.round((size / DEFAULT_VERSE_FONT_SIZE) * 100)}%`;
  }
}

function applyVerseFontSize(value, options = {}) {
  const size = clampVerseFontSize(value);
  document.documentElement.style.setProperty("--verse-font-size", `${size}px`);
  updateVerseFontSizeDisplay(size);

  if (options.persist === false) {
    return;
  }

  try {
    window.localStorage.setItem(VERSE_FONT_SIZE_STORAGE_KEY, String(size));
  } catch {
    // Ignore storage failures so reading controls still work in private modes.
  }
}

function hydrateVerseFontSizePreference() {
  let size = DEFAULT_VERSE_FONT_SIZE;

  try {
    const stored = window.localStorage.getItem(VERSE_FONT_SIZE_STORAGE_KEY);
    if (stored !== null) {
      size = Number(stored);
    }
  } catch {
    size = DEFAULT_VERSE_FONT_SIZE;
  }

  applyVerseFontSize(size, { persist: false });
}

function getPassageSelectionBook(bookEn = state.passageSelection.bookEn) {
  return BOOK_BY_ENGS.get(bookEn) || BOOKS[0];
}

function normalizePassageVerse(verse) {
  if (verse === "" || verse === null || verse === undefined) {
    return "";
  }

  const numeric = Math.trunc(Number(verse));
  return Number.isFinite(numeric) && numeric > 0 ? String(numeric) : "";
}

function buildPassageQueryFromSelection(selection = state.passageSelection) {
  const book = getPassageSelectionBook(selection.bookEn);
  return selection.verse
    ? `${book.zh} ${selection.chapter}:${selection.verse}`
    : `${book.zh} ${selection.chapter}`;
}

function renderPassageBookOptions(selectedBookEn = state.passageSelection.bookEn) {
  dom.passageBook.innerHTML = BOOKS
    .map((book) => `<option value="${book.engs}" ${book.engs === selectedBookEn ? "selected" : ""}>${escapeHtml(book.zh)}</option>`)
    .join("");
}

function renderPassageChapterOptions(bookEn = state.passageSelection.bookEn, selectedChapter = state.passageSelection.chapter) {
  const book = getPassageSelectionBook(bookEn);
  dom.passageChapter.innerHTML = Array.from({ length: book.chapters }, (_, index) => {
    const chapter = index + 1;
    return `<option value="${chapter}" ${chapter === selectedChapter ? "selected" : ""}>${chapter}</option>`;
  }).join("");
}

function renderPassageVerseOptions(verseNumbers = [], selectedVerse = state.passageSelection.verse) {
  const normalizedSelectedVerse = normalizePassageVerse(selectedVerse);
  const hasSelectedVerse = normalizedSelectedVerse && verseNumbers.includes(Number(normalizedSelectedVerse));

  dom.passageVerse.innerHTML = [
    `<option value="" ${hasSelectedVerse ? "" : "selected"}>整章</option>`,
    ...verseNumbers.map((verse) => `<option value="${verse}" ${String(verse) === normalizedSelectedVerse ? "selected" : ""}>${verse}</option>`)
  ].join("");
}

function syncPassageQueryInput() {
  if (state.mode !== "passage") {
    return;
  }

  dom.queryInput.value = buildPassageQueryFromSelection();
}

async function syncPassageControls(selection = {}, options = {}) {
  const book = getPassageSelectionBook(selection.bookEn ?? state.passageSelection.bookEn);
  const chapterValue = Math.trunc(Number(selection.chapter ?? state.passageSelection.chapter ?? 1));
  const chapter = Math.min(book.chapters, Math.max(1, Number.isFinite(chapterValue) ? chapterValue : 1));
  const preferredVerse = normalizePassageVerse(selection.verse ?? state.passageSelection.verse);

  state.passageSelection = {
    bookEn: book.engs,
    chapter,
    verse: preferredVerse
  };

  renderPassageBookOptions(book.engs);
  renderPassageChapterOptions(book.engs, chapter);
  renderPassageVerseOptions([], "");

  let verseNumbers = [];
  try {
    const chapterQuery = `${book.zh} ${chapter}`;
    const records = await fetchPassageRecords("unv", chapterQuery);
    verseNumbers = records
      .map((row) => row.verse)
      .filter((verse, index, values) => Number.isFinite(verse) && values.indexOf(verse) === index);
  } catch {
    verseNumbers = [];
  }

  const resolvedVerse = preferredVerse && verseNumbers.includes(Number(preferredVerse))
    ? preferredVerse
    : "";

  state.passageSelection = {
    bookEn: book.engs,
    chapter,
    verse: resolvedVerse
  };

  renderPassageVerseOptions(verseNumbers, resolvedVerse);

  if (options.syncInput !== false) {
    syncPassageQueryInput();
  }

  if (options.triggerSearch) {
    void handleSearch();
  }
}

function clearKeywordAutoSearchTimer() {
  if (!keywordAutoSearchTimer) {
    return;
  }

  window.clearTimeout(keywordAutoSearchTimer);
  keywordAutoSearchTimer = 0;
}

function getSearchableQueryLength(query) {
  return Array.from(String(query || "").trim()).length;
}

function resetKeywordAutoSearchState(query) {
  activeKeywordSearchToken += 1;
  state.query = query;
  state.results = [];
  state.error = "";
  state.lastMeta = null;
  state.selectedResultKeys = new Set();
  state.pendingFocusResultKey = "";
  setLoading(false);
  showEmptyState();
  updateActionButtons();
  syncUrl();
}

function scheduleKeywordAutoSearch(options = {}) {
  if (state.mode !== "keyword") {
    return;
  }

  clearKeywordAutoSearchTimer();
  const query = dom.queryInput.value.trim();
  const queryLength = getSearchableQueryLength(query);

  if (queryLength < KEYWORD_AUTO_SEARCH_MIN_LENGTH) {
    resetKeywordAutoSearchState(query);
    setStatus(
      query
        ? `關鍵字輸入到 ${KEYWORD_AUTO_SEARCH_MIN_LENGTH} 個字後會自動查詢。`
        : "請先輸入關鍵字。"
    );
    return;
  }

  const runSearch = () => {
    keywordAutoSearchTimer = 0;
    void handleSearch();
  };

  if (options.immediate || queryLength === KEYWORD_AUTO_SEARCH_MIN_LENGTH) {
    runSearch();
    return;
  }

  keywordAutoSearchTimer = window.setTimeout(runSearch, KEYWORD_AUTO_SEARCH_DELAY_MS);
}

function updateMode(mode, options = {}) {
  clearKeywordAutoSearchTimer();
  state.mode = mode;
  const copy = MODE_COPY[mode];
  dom.queryInput.placeholder = copy.placeholder;
  dom.modeDescription.textContent = copy.helper;
  dom.keywordControls.hidden = mode !== "keyword";
  dom.passageControls.hidden = mode !== "passage";

  for (const button of dom.modeButtons) {
    const active = button.dataset.mode === mode;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
  }

  renderExampleChips(copy.examples);

  if (!options.keepInput) {
    if (mode === "passage") {
      syncPassageQueryInput();
    } else {
      dom.queryInput.value = "";
    }
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
      <p>經文閱讀適合直接查章節，關鍵字搜尋適合先找命中的節，再對照多個譯本。</p>
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

function formatVerseReference(result) {
  return `${result.bookZh} ${result.chapter}:${result.verse}`;
}

function formatChapterReference(bookZh, chapter) {
  return `${bookZh} ${chapter}`;
}

function buildPassageHref(reference) {
  const params = new URLSearchParams();
  params.set("mode", "passage");
  params.set("q", reference);
  params.set("shown", [...state.visibleTranslations].join(","));
  return `${window.location.pathname}?${params.toString()}`;
}

function buildFhlCommentaryHref(result) {
  const url = new URL(FHL_COMMENTARY_BASE);
  url.searchParams.set("book", "3");
  url.searchParams.set("engs", result.bookEn || "");
  url.searchParams.set("chap", String(result.chapter));
  url.searchParams.set("sec", String(result.verse));
  url.searchParams.set("m", "0");
  return url.toString();
}

function getBookNavigation(bookEn, chapter, fallbackBookZh = "") {
  const currentIndex = BIBLE_BOOK_ORDER.get(bookEn);
  const currentBook = BOOK_BY_ENGS.get(bookEn);

  if (currentIndex === undefined || !currentBook) {
    return null;
  }

  const current = {
    bookEn,
    bookZh: fallbackBookZh || currentBook.zh,
    chapter
  };

  let previous = null;
  if (chapter > 1) {
    previous = {
      bookEn,
      bookZh: current.bookZh,
      chapter: chapter - 1
    };
  } else if (currentIndex > 0) {
    const previousBook = BOOKS[currentIndex - 1];
    previous = {
      bookEn: previousBook.engs,
      bookZh: previousBook.zh,
      chapter: previousBook.chapters
    };
  }

  let next = null;
  if (chapter < currentBook.chapters) {
    next = {
      bookEn,
      bookZh: current.bookZh,
      chapter: chapter + 1
    };
  } else if (currentIndex < BOOKS.length - 1) {
    const nextBook = BOOKS[currentIndex + 1];
    next = {
      bookEn: nextBook.engs,
      bookZh: nextBook.zh,
      chapter: 1
    };
  }

  return { current, previous, next };
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
  const hasVisibleTranslations = getVisibleTranslations().length > 0;
  const canCopyKeywordResults =
    state.mode === "keyword" &&
    state.selectedResultKeys.size > 0 &&
    hasVisibleTranslations;
  const canCopyPassageResults =
    state.mode === "passage" &&
    state.selectedResultKeys.size > 0 &&
    hasVisibleTranslations;

  dom.copyVersesButton.disabled = !canCopyKeywordResults && !canCopyPassageResults;
  syncResultsFooterState();
}

function getResultsFooterCopyState(visibleTranslations = getVisibleTranslations()) {
  const hasVisibleTranslations = visibleTranslations.length > 0;
  const selectedCount = state.selectedResultKeys.size;

  if (state.mode === "passage") {
    return {
      note: !hasVisibleTranslations
        ? "請先勾選至少一個要顯示的譯本。"
        : selectedCount
          ? `已勾選 ${selectedCount} 節，可複製目前勾選的經節。`
          : "請先勾選要複製的經節，再按下複製經文。",
      disabled: !hasVisibleTranslations || selectedCount === 0
    };
  }

  return {
    note: !hasVisibleTranslations
      ? "請先勾選至少一個要顯示的譯本。"
      : selectedCount
        ? `已勾選 ${selectedCount} 節，可複製目前勾選的結果。`
        : "請先勾選要複製的經文，再按下複製經文。",
    disabled: !hasVisibleTranslations || selectedCount === 0
  };
}

function syncResultsFooterState() {
  const footerNote = dom.results.querySelector("[data-results-copy-note]");
  const footerButton = dom.results.querySelector('[data-results-action="copy-verses"]');

  if (!footerNote || !footerButton) {
    return;
  }

  const footerState = getResultsFooterCopyState();
  footerNote.textContent = footerState.note;
  footerButton.disabled = footerState.disabled;
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
    state.lastMeta.mode === "passage" ? "經文閱讀" : "關鍵字搜尋",
    `顯示 ${state.results.length} 筆結果`
  ];

  if (state.lastMeta.mode === "keyword") {
    pills.push(`來源 ${state.lastMeta.sourceLabel}`);
  }

  if (Number.isFinite(state.lastMeta.elapsedMs)) {
    pills.push(`耗時 ${state.lastMeta.elapsedMs} ms`);
  }

  setStatus(state.lastMeta.summary, pills);
}

function renderResultsTopNavigation() {
  if (!state.lastMeta || !state.results.length || state.lastMeta.mode !== "passage") {
    return "";
  }

  const navigation = getBookNavigation(
    state.results[0].bookEn,
    state.results[0].chapter,
    state.results[0].bookZh
  );

  const previousReference = navigation?.previous
    ? formatChapterReference(navigation.previous.bookZh, navigation.previous.chapter)
    : "";
  const nextReference = navigation?.next
    ? formatChapterReference(navigation.next.bookZh, navigation.next.chapter)
    : "";

  return `
    <section class="results-top-navigation">
      <div class="chapter-navigation">
        <button
          class="secondary-button"
          type="button"
          data-results-action="navigate-chapter"
          data-chapter-reference="${escapeHtml(previousReference)}"
          ${previousReference ? "" : "disabled"}
        >
          上一章
        </button>
        <div class="chapter-navigation-meta">
          <p class="results-footer-label">經文閱讀導覽</p>
          <strong>${escapeHtml(`${state.results[0].bookZh} ${state.results[0].chapter} 章`)}</strong>
        </div>
        <button
          class="secondary-button"
          type="button"
          data-results-action="navigate-chapter"
          data-chapter-reference="${escapeHtml(nextReference)}"
          ${nextReference ? "" : "disabled"}
        >
          下一章
        </button>
      </div>
    </section>
  `;
}

function renderResultsFooter(visibleTranslations) {
  if (!state.lastMeta || !state.results.length) {
    return "";
  }

  if (state.lastMeta.mode === "passage") {
    const navigation = getBookNavigation(
      state.results[0].bookEn,
      state.results[0].chapter,
      state.results[0].bookZh
    );
    const footerCopyState = getResultsFooterCopyState(visibleTranslations);
    const previousReference = navigation?.previous
      ? formatChapterReference(navigation.previous.bookZh, navigation.previous.chapter)
      : "";
    const nextReference = navigation?.next
      ? formatChapterReference(navigation.next.bookZh, navigation.next.chapter)
      : "";

    return `
      <section class="results-footer">
        <div class="chapter-navigation">
          <button
            class="secondary-button"
            type="button"
            data-results-action="navigate-chapter"
            data-chapter-reference="${escapeHtml(previousReference)}"
            ${previousReference ? "" : "disabled"}
          >
            上一章
          </button>
          <div class="chapter-navigation-meta">
            <p class="results-footer-label">經文閱讀導覽</p>
            <strong>${escapeHtml(`${state.results[0].bookZh} ${state.results[0].chapter} 章`)}</strong>
          </div>
          <button
            class="secondary-button"
            type="button"
            data-results-action="navigate-chapter"
            data-chapter-reference="${escapeHtml(nextReference)}"
            ${nextReference ? "" : "disabled"}
          >
            下一章
          </button>
        </div>
        <div class="results-footer-actions">
          <p class="results-footer-note" data-results-copy-note>
            ${escapeHtml(footerCopyState.note)}
          </p>
          <button
            class="secondary-button"
            type="button"
            data-results-action="copy-verses"
            ${footerCopyState.disabled ? "disabled" : ""}
          >
            複製經文
          </button>
        </div>
      </section>
    `;
  }

  const footerCopyState = getResultsFooterCopyState(visibleTranslations);

  return `
    <section class="results-footer">
      <div class="results-footer-actions">
        <p class="results-footer-label">關鍵字結果操作</p>
        <p class="results-footer-note" data-results-copy-note>${escapeHtml(footerCopyState.note)}</p>
      </div>
      <div class="results-footer-actions">
        <button
          class="secondary-button"
          type="button"
          data-results-action="copy-verses"
          ${footerCopyState.disabled ? "disabled" : ""}
        >
          複製經文
        </button>
      </div>
    </section>
  `;
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
  const resultCards = state.results
    .map((result) => {
      const verseReference = formatVerseReference(result);
      const chapterReference = formatChapterReference(result.bookZh, result.chapter);
      const passageHref = buildPassageHref(chapterReference);
      const commentaryHref = buildFhlCommentaryHref(result);
      const titleMarkup =
        state.lastMeta?.mode === "keyword"
          ? `
            <h3>
              <a
                class="result-reference-link"
                href="${escapeHtml(passageHref)}"
                data-chapter-reference="${escapeHtml(chapterReference)}"
                data-result-key="${escapeHtml(result.key)}"
              >
                ${escapeHtml(verseReference)}
              </a>
            </h3>
          `
          : `<h3>${escapeHtml(verseReference)}</h3>`;

      const translationPanels = visibleTranslations.map((translation) => {
        const text = result.texts[translation.id] || "此譯本在目前資料來源中沒有對應節次。";
        const verseContent = renderVerseText(text, highlightQuery);
        const verseTextMarkup =
          state.lastMeta?.mode === "keyword"
            ? `
              <a
                class="verse-text-link result-reference-link"
                href="${escapeHtml(passageHref)}"
                data-chapter-reference="${escapeHtml(chapterReference)}"
                data-result-key="${escapeHtml(result.key)}"
              >
                <span class="verse-text">${verseContent}</span>
              </a>
            `
            : `<p class="verse-text">${verseContent}</p>`;

        return `
          <article class="translation-panel">
            <div class="translation-top">
              <span class="version-badge ${translation.id}">${escapeHtml(translation.label)}</span>
              <span class="translation-meta">${escapeHtml(translation.fullLabel)}</span>
            </div>
            ${verseTextMarkup}
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
          : `
            <label class="result-selector result-selector-inline">
              <input
                class="result-selector-input"
                type="checkbox"
                data-result-key="${escapeHtml(result.key)}"
                ${state.selectedResultKeys.has(result.key) ? "checked" : ""}
              />
              <span>勾選複製</span>
            </label>
          `;

      const translationContent = translationPanels || `
        <div class="translation-empty">
          請先勾選至少一個要顯示的聖經譯本。
        </div>
      `;

      return `
        <article
          class="result-card${state.pendingFocusResultKey === result.key ? " is-focus-target" : ""}"
          data-verse-key="${escapeHtml(result.key)}"
        >
          <header class="result-header">
            <div class="result-header-top">
              <div class="result-title">
                ${titleMarkup}
                ${state.lastMeta?.mode === "passage" ? selectionControl : ""}
                <span class="pill">${escapeHtml(result.bookEn)}</span>
              </div>
              <div class="result-header-actions">
                <a
                  class="external-reference-link"
                  href="${escapeHtml(commentaryHref)}"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  信望愛註釋
                </a>
                ${state.lastMeta?.mode === "keyword" ? selectionControl : ""}
              </div>
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

  const topNavigation = renderResultsTopNavigation();
  dom.results.innerHTML = `${topNavigation}${resultCards}${renderResultsFooter(visibleTranslations)}`;
  updateActionButtons();
  focusPendingResult();
}

function focusPendingResult() {
  if (!state.pendingFocusResultKey) {
    return;
  }

  const targetKey = state.pendingFocusResultKey;
  state.pendingFocusResultKey = "";

  window.requestAnimationFrame(() => {
    const target = dom.results.querySelector(`[data-verse-key="${targetKey}"]`);
    if (!target) {
      return;
    }

    target.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => {
      target.classList.remove("is-focus-target");
    }, 2200);
  });
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
  const startTime = performance.now();

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
      elapsedMs: Math.max(1, Math.round(performance.now() - startTime)),
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
  clearKeywordAutoSearchTimer();
  const query = dom.queryInput.value.trim();
  if (!query) {
    return;
  }

  const startTime = performance.now();
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
        elapsedMs: Math.max(1, Math.round(performance.now() - startTime)),
        summary: `已完成經文閱讀：${query}`
      };

      if (state.results.length) {
        void syncPassageControls(
          {
            bookEn: state.results[0].bookEn,
            chapter: state.results[0].chapter,
            verse: state.results.length === 1 ? state.results[0].verse : ""
          },
          { syncInput: false }
        );
      }
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
        elapsedMs: Math.max(1, Math.round(performance.now() - startTime)),
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
    state.pendingFocusResultKey = "";
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

async function openPassageChapter(reference, options = {}) {
  if (!reference) {
    return;
  }

  updateMode("passage", { keepInput: true });
  dom.queryInput.value = reference;
  state.pendingFocusResultKey = options.focusResultKey || "";
  await handleSearch();
}

function buildPassageCopyPayload() {
  if (state.mode !== "passage" || !state.results.length) {
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
      const lines = [formatVerseReference(result)];

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
    visibleVersions: visibleTranslations.map((translation) => translation.id),
    statusLabel: "已複製勾選的經節。"
  };
}

function buildKeywordCopyPayload() {
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
    visibleVersions: visibleTranslations.map((translation) => translation.id),
    statusLabel: "已複製勾選的經文。"
  };
}

function buildCopyPayload() {
  return state.mode === "passage"
    ? buildPassageCopyPayload()
    : buildKeywordCopyPayload();
}

async function copySelectedVerses() {
  const payload = buildCopyPayload();

  if (!payload) {
    setStatus(
      state.mode === "keyword"
        ? "請先在關鍵字搜尋結果勾選要複製的經文。"
        : "請先在經文閱讀結果勾選要複製的經節。"
    );
    return;
  }

  try {
    await navigator.clipboard.writeText(payload.text);
    setStatus(payload.statusLabel, [
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

  dom.queryInput.addEventListener("compositionstart", () => {
    isComposingKeywordInput = true;
    clearKeywordAutoSearchTimer();
  });

  dom.queryInput.addEventListener("compositionend", () => {
    isComposingKeywordInput = false;
    scheduleKeywordAutoSearch();
  });

  dom.queryInput.addEventListener("input", (event) => {
    if (state.mode !== "keyword" || isComposingKeywordInput || event.isComposing) {
      return;
    }

    scheduleKeywordAutoSearch();
  });

  dom.keywordVersion.addEventListener("change", () => {
    if (state.mode !== "keyword") {
      return;
    }

    scheduleKeywordAutoSearch({ immediate: true });
  });

  dom.resultLimit.addEventListener("change", () => {
    if (state.mode !== "keyword") {
      return;
    }

    scheduleKeywordAutoSearch({ immediate: true });
  });

  dom.passageBook.addEventListener("change", () => {
    void syncPassageControls(
      {
        bookEn: dom.passageBook.value,
        chapter: 1,
        verse: ""
      },
      { triggerSearch: true }
    );
  });

  dom.passageChapter.addEventListener("change", () => {
    void syncPassageControls(
      {
        chapter: Number(dom.passageChapter.value),
        verse: ""
      },
      { triggerSearch: true }
    );
  });

  dom.passageVerse.addEventListener("change", () => {
    state.passageSelection = {
      ...state.passageSelection,
      verse: normalizePassageVerse(dom.passageVerse.value)
    };
    syncPassageQueryInput();
    void handleSearch();
  });

  dom.modeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      updateMode(button.dataset.mode);
      activeKeywordSearchToken += 1;
      state.query = "";
      state.results = [];
      state.lastMeta = null;
      state.selectedResultKeys = new Set();
      state.pendingFocusResultKey = "";
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
  dom.fontSizeRange?.addEventListener("input", () => {
    applyVerseFontSize(dom.fontSizeRange.value);
  });

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

  dom.results.addEventListener("click", (event) => {
    const chapterLink = event.target.closest(".result-reference-link");
    if (chapterLink) {
      event.preventDefault();
      void openPassageChapter(chapterLink.dataset.chapterReference || "", {
        focusResultKey: chapterLink.dataset.resultKey || ""
      });
      return;
    }

    const actionButton = event.target.closest("[data-results-action]");
    if (!actionButton) {
      return;
    }

    event.preventDefault();

    if (actionButton.dataset.resultsAction === "copy-verses") {
      void copySelectedVerses();
      return;
    }

    if (actionButton.dataset.resultsAction === "navigate-chapter") {
      void openPassageChapter(actionButton.dataset.chapterReference || "");
    }
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
  hydrateVerseFontSizePreference();
  renderTranslationToggles();
  void syncPassageControls(state.passageSelection, { syncInput: false });
  bindEvents();
  hydrateFromUrl();
  updateActionButtons();
}

init();
