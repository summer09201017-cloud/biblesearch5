import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const moduleFilename = fileURLToPath(import.meta.url);
const moduleDir = path.dirname(moduleFilename);
const publicDir = path.join(moduleDir, "public");
const dataDir = path.join(moduleDir, "data");
const localBiblePath = path.join(dataDir, "bible_data.json");
const port = Number(process.env.PORT || 4173);

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8"
};

const VERSION_WHITELIST = new Set(["asv", "kjv", "unv", "ncv", "esv", "lcc"]);
const LOCAL_VERSION_IDS = new Set(["asv", "kjv", "unv", "ncv", "esv", "lcc"]);
const VERSION_NAMES = {
  asv: "ASV",
  kjv: "KJV",
  unv: "和合本",
  esv: "ESV",
  lcc: "呂振中譯本",
  ncv: "新譯本"
};

const FHL_BASE = "https://bible.fhl.net/json";

const BOOKS = [
  { engs: "Gen", full: "Genesis", zhShort: "創", zhFull: "創世記", aliases: ["Gen", "Genesis", "創", "創世記"] },
  { engs: "Exod", full: "Exodus", zhShort: "出", zhFull: "出埃及記", aliases: ["Exod", "Exodus", "出", "出埃及記"] },
  { engs: "Lev", full: "Leviticus", zhShort: "利", zhFull: "利未記", aliases: ["Lev", "Leviticus", "利", "利未記"] },
  { engs: "Num", full: "Numbers", zhShort: "民", zhFull: "民數記", aliases: ["Num", "Numbers", "民", "民數記"] },
  { engs: "Deut", full: "Deuteronomy", zhShort: "申", zhFull: "申命記", aliases: ["Deut", "Deuteronomy", "申", "申命記"] },
  { engs: "Josh", full: "Joshua", zhShort: "書", zhFull: "約書亞記", aliases: ["Josh", "Joshua", "書", "約書亞記"] },
  { engs: "Judg", full: "Judges", zhShort: "士", zhFull: "士師記", aliases: ["Judg", "Judges", "士", "士師記"] },
  { engs: "Ruth", full: "Ruth", zhShort: "得", zhFull: "路得記", aliases: ["Ruth", "得", "路得記"] },
  { engs: "1Sam", full: "1 Samuel", zhShort: "撒上", zhFull: "撒母耳記上", aliases: ["1Sam", "1Samuel", "撒上", "撒母耳記上"] },
  { engs: "2Sam", full: "2 Samuel", zhShort: "撒下", zhFull: "撒母耳記下", aliases: ["2Sam", "2Samuel", "撒下", "撒母耳記下"] },
  { engs: "1Kgs", full: "1 Kings", zhShort: "王上", zhFull: "列王紀上", aliases: ["1Kgs", "1Kings", "王上", "列王紀上"] },
  { engs: "2Kgs", full: "2 Kings", zhShort: "王下", zhFull: "列王紀下", aliases: ["2Kgs", "2Kings", "王下", "列王紀下"] },
  { engs: "1Chr", full: "1 Chronicles", zhShort: "代上", zhFull: "歷代志上", aliases: ["1Chr", "1Chronicles", "代上", "歷代志上"] },
  { engs: "2Chr", full: "2 Chronicles", zhShort: "代下", zhFull: "歷代志下", aliases: ["2Chr", "2Chronicles", "代下", "歷代志下"] },
  { engs: "Ezra", full: "Ezra", zhShort: "拉", zhFull: "以斯拉記", aliases: ["Ezra", "拉", "以斯拉記"] },
  { engs: "Neh", full: "Nehemiah", zhShort: "尼", zhFull: "尼希米記", aliases: ["Neh", "Nehemiah", "尼", "尼希米記"] },
  { engs: "Esth", full: "Esther", zhShort: "斯", zhFull: "以斯帖記", aliases: ["Esth", "Esther", "斯", "以斯帖記"] },
  { engs: "Job", full: "Job", zhShort: "伯", zhFull: "約伯記", aliases: ["Job", "伯", "約伯記"] },
  { engs: "Ps", full: "Psalms", zhShort: "詩", zhFull: "詩篇", aliases: ["Ps", "Psalm", "Psalms", "詩", "詩篇"] },
  { engs: "Prov", full: "Proverbs", zhShort: "箴", zhFull: "箴言", aliases: ["Prov", "Proverbs", "箴", "箴言"] },
  { engs: "Eccl", full: "Ecclesiastes", zhShort: "傳", zhFull: "傳道書", aliases: ["Eccl", "Ecclesiastes", "傳", "傳道書"] },
  { engs: "Song", full: "Song of Solomon", zhShort: "歌", zhFull: "雅歌", aliases: ["Song", "SongofSolomon", "SongofSongs", "歌", "雅歌"] },
  { engs: "Isa", full: "Isaiah", zhShort: "賽", zhFull: "以賽亞書", aliases: ["Isa", "Isaiah", "賽", "以賽亞書"] },
  { engs: "Jer", full: "Jeremiah", zhShort: "耶", zhFull: "耶利米書", aliases: ["Jer", "Jeremiah", "耶", "耶利米書"] },
  { engs: "Lam", full: "Lamentations", zhShort: "哀", zhFull: "耶利米哀歌", aliases: ["Lam", "Lamentations", "哀", "耶利米哀歌"] },
  { engs: "Ezek", full: "Ezekiel", zhShort: "結", zhFull: "以西結書", aliases: ["Ezek", "Ezekiel", "結", "以西結書"] },
  { engs: "Dan", full: "Daniel", zhShort: "但", zhFull: "但以理書", aliases: ["Dan", "Daniel", "但", "但以理書"] },
  { engs: "Hos", full: "Hosea", zhShort: "何", zhFull: "何西阿書", aliases: ["Hos", "Hosea", "何", "何西阿書"] },
  { engs: "Joel", full: "Joel", zhShort: "珥", zhFull: "約珥書", aliases: ["Joel", "珥", "約珥書"] },
  { engs: "Amos", full: "Amos", zhShort: "摩", zhFull: "阿摩司書", aliases: ["Amos", "摩", "阿摩司書"] },
  { engs: "Obad", full: "Obadiah", zhShort: "俄", zhFull: "俄巴底亞書", aliases: ["Obad", "Obadiah", "俄", "俄巴底亞書"] },
  { engs: "Jonah", full: "Jonah", zhShort: "拿", zhFull: "約拿書", aliases: ["Jonah", "拿", "約拿書"] },
  { engs: "Mic", full: "Micah", zhShort: "彌", zhFull: "彌迦書", aliases: ["Mic", "Micah", "彌", "彌迦書"] },
  { engs: "Nah", full: "Nahum", zhShort: "鴻", zhFull: "那鴻書", aliases: ["Nah", "Nahum", "鴻", "那鴻書"] },
  { engs: "Hab", full: "Habakkuk", zhShort: "哈", zhFull: "哈巴谷書", aliases: ["Hab", "Habakkuk", "哈", "哈巴谷書"] },
  { engs: "Zeph", full: "Zephaniah", zhShort: "番", zhFull: "西番雅書", aliases: ["Zeph", "Zephaniah", "番", "西番雅書"] },
  { engs: "Hag", full: "Haggai", zhShort: "該", zhFull: "哈該書", aliases: ["Hag", "Haggai", "該", "哈該書"] },
  { engs: "Zech", full: "Zechariah", zhShort: "亞", zhFull: "撒迦利亞書", aliases: ["Zech", "Zechariah", "亞", "撒迦利亞書"] },
  { engs: "Mal", full: "Malachi", zhShort: "瑪", zhFull: "瑪拉基書", aliases: ["Mal", "Malachi", "瑪", "瑪拉基書"] },
  { engs: "Matt", full: "Matthew", zhShort: "太", zhFull: "馬太福音", aliases: ["Matt", "Matthew", "太", "馬太福音"] },
  { engs: "Mark", full: "Mark", zhShort: "可", zhFull: "馬可福音", aliases: ["Mark", "Mrk", "Mar", "可", "馬可福音"] },
  { engs: "Luke", full: "Luke", zhShort: "路", zhFull: "路加福音", aliases: ["Luke", "Luk", "路", "路加福音"] },
  { engs: "John", full: "John", zhShort: "約", zhFull: "約翰福音", aliases: ["John", "Jhn", "約", "約翰福音"] },
  { engs: "Acts", full: "Acts", zhShort: "徒", zhFull: "使徒行傳", aliases: ["Acts", "徒", "使徒行傳"] },
  { engs: "Rom", full: "Romans", zhShort: "羅", zhFull: "羅馬書", aliases: ["Rom", "Romans", "羅", "羅馬書"] },
  { engs: "1Cor", full: "1 Corinthians", zhShort: "林前", zhFull: "哥林多前書", aliases: ["1Cor", "1Corinthians", "林前", "哥林多前書"] },
  { engs: "2Cor", full: "2 Corinthians", zhShort: "林後", zhFull: "哥林多後書", aliases: ["2Cor", "2Corinthians", "林後", "哥林多後書"] },
  { engs: "Gal", full: "Galatians", zhShort: "加", zhFull: "加拉太書", aliases: ["Gal", "Galatians", "加", "加拉太書"] },
  { engs: "Eph", full: "Ephesians", zhShort: "弗", zhFull: "以弗所書", aliases: ["Eph", "Ephesians", "弗", "以弗所書"] },
  { engs: "Phil", full: "Philippians", zhShort: "腓", zhFull: "腓立比書", aliases: ["Phil", "Philippians", "腓", "腓立比書"] },
  { engs: "Col", full: "Colossians", zhShort: "西", zhFull: "歌羅西書", aliases: ["Col", "Colossians", "西", "歌羅西書"] },
  { engs: "1Thess", full: "1 Thessalonians", zhShort: "帖前", zhFull: "帖撒羅尼迦前書", aliases: ["1Thess", "1Thessalonians", "帖前", "帖撒羅尼迦前書"] },
  { engs: "2Thess", full: "2 Thessalonians", zhShort: "帖後", zhFull: "帖撒羅尼迦後書", aliases: ["2Thess", "2Thessalonians", "帖後", "帖撒羅尼迦後書"] },
  { engs: "1Tim", full: "1 Timothy", zhShort: "提前", zhFull: "提摩太前書", aliases: ["1Tim", "1Timothy", "提前", "提摩太前書"] },
  { engs: "2Tim", full: "2 Timothy", zhShort: "提後", zhFull: "提摩太後書", aliases: ["2Tim", "2Timothy", "提後", "提摩太後書"] },
  { engs: "Titus", full: "Titus", zhShort: "多", zhFull: "提多書", aliases: ["Titus", "多", "提多書"] },
  { engs: "Phlm", full: "Philemon", zhShort: "門", zhFull: "腓利門書", aliases: ["Phlm", "Philemon", "門", "腓利門書"] },
  { engs: "Heb", full: "Hebrews", zhShort: "來", zhFull: "希伯來書", aliases: ["Heb", "Hebrews", "來", "希伯來書"] },
  { engs: "Jas", full: "James", zhShort: "雅", zhFull: "雅各書", aliases: ["Jas", "James", "雅", "雅各書"] },
  { engs: "1Pet", full: "1 Peter", zhShort: "彼前", zhFull: "彼得前書", aliases: ["1Pet", "1Peter", "彼前", "彼得前書"] },
  { engs: "2Pet", full: "2 Peter", zhShort: "彼後", zhFull: "彼得後書", aliases: ["2Pet", "2Peter", "彼後", "彼得後書"] },
  { engs: "1John", full: "1 John", zhShort: "約一", zhFull: "約翰一書", aliases: ["1John", "1Jn", "約一", "約壹", "約翰一書"] },
  { engs: "2John", full: "2 John", zhShort: "約二", zhFull: "約翰二書", aliases: ["2John", "2Jn", "約二", "約貳", "約翰二書"] },
  { engs: "3John", full: "3 John", zhShort: "約三", zhFull: "約翰三書", aliases: ["3John", "3Jn", "約三", "約參", "約翰三書"] },
  { engs: "Jude", full: "Jude", zhShort: "猶", zhFull: "猶大書", aliases: ["Jude", "猶", "猶大書"] },
  { engs: "Rev", full: "Revelation", zhShort: "啟", zhFull: "啟示錄", aliases: ["Rev", "Revelation", "啟", "啟示錄"] }
];

const BOOK_BY_FULL = new Map(BOOKS.map((book) => [book.full, book]));
const BOOK_BY_ENGS = new Map(BOOKS.map((book) => [book.engs, book]));
const BOOK_BY_ALIAS = new Map(
  BOOKS.flatMap((book) =>
    book.aliases.map((alias) => [normalizeAlias(alias), book])
  )
);

let localBibleStorePromise;

function normalizeAlias(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[.\s]+/g, "");
}

function normalizeSearchText(value) {
  return String(value || "")
    .replace(/\u3000/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function extractSearchTerms(query) {
  const matches =
    String(query || "").match(/"[^"]+"|'[^']+'|[\p{Script=Han}\p{Letter}\p{Number}]+/gu) || [];

  return [...new Set(matches
    .map((term) => normalizeSearchText(term.replace(/^["']|["']$/g, "")))
    .filter(Boolean)
    .sort((left, right) => right.length - left.length))];
}

function makeRefKey(bookEngs, chapter, verse) {
  return `${bookEngs}-${chapter}-${verse}`;
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(payload));
}

async function fetchFhlJson(url, errorLabel) {
  const remoteResponse = await fetch(url, {
    headers: {
      "User-Agent": "Codex-FHL-Bible-Search/1.0"
    }
  });

  if (!remoteResponse.ok) {
    throw new Error(`${errorLabel} returned ${remoteResponse.status}.`);
  }

  return remoteResponse.json();
}

async function loadLocalBibleStore() {
  if (!localBibleStorePromise) {
    localBibleStorePromise = readFile(localBiblePath, "utf8")
      .then((raw) => JSON.parse(raw))
      .then((records) => {
        const verses = [];
        const byBook = new Map();
        const byRef = new Map();

        for (const entry of records) {
          const book = BOOK_BY_FULL.get(entry.book_en);
          if (!book) {
            continue;
          }

          const verse = {
            engs: book.engs,
            bookFull: book.full,
            chineses: book.zhShort,
            chapter: Number(entry.chapter),
            sec: Number(entry.verse),
            texts: {
              asv: String(entry.ASV || "").trim(),
              kjv: String(entry.KJV || "").trim(),
              unv: String(entry.CUV || "").trim(),
              esv: String(entry.ESV || "").trim(),
              lcc: String(entry.LCC || "").trim(),
              ncv: String(entry.NCV || "").trim()
            }
          };

          verse.search = {
            asv: normalizeSearchText(verse.texts.asv),
            kjv: normalizeSearchText(verse.texts.kjv),
            unv: normalizeSearchText(verse.texts.unv),
            esv: normalizeSearchText(verse.texts.esv),
            lcc: normalizeSearchText(verse.texts.lcc),
            ncv: normalizeSearchText(verse.texts.ncv)
          };

          verses.push(verse);

          if (!byBook.has(book.full)) {
            byBook.set(book.full, []);
          }

          byBook.get(book.full).push(verse);
          byRef.set(makeRefKey(book.engs, verse.chapter, verse.sec), verse);
        }

        return { verses, byBook, byRef };
      });
  }

  return localBibleStorePromise;
}

function parseReferenceRange(referencePart) {
  if (/^\d+$/.test(referencePart)) {
    const chapter = Number(referencePart);
    return {
      startChapter: chapter,
      endChapter: chapter,
      startVerse: null,
      endVerse: null
    };
  }

  let match = referencePart.match(/^(\d+)-(\d+)$/);
  if (match) {
    return {
      startChapter: Number(match[1]),
      endChapter: Number(match[2]),
      startVerse: null,
      endVerse: null
    };
  }

  match = referencePart.match(/^(\d+):(\d+)$/);
  if (match) {
    return {
      startChapter: Number(match[1]),
      endChapter: Number(match[1]),
      startVerse: Number(match[2]),
      endVerse: Number(match[2])
    };
  }

  match = referencePart.match(/^(\d+):(\d+)-(\d+)$/);
  if (match) {
    return {
      startChapter: Number(match[1]),
      endChapter: Number(match[1]),
      startVerse: Number(match[2]),
      endVerse: Number(match[3])
    };
  }

  match = referencePart.match(/^(\d+):(\d+)-(\d+):(\d+)$/);
  if (match) {
    return {
      startChapter: Number(match[1]),
      endChapter: Number(match[3]),
      startVerse: Number(match[2]),
      endVerse: Number(match[4])
    };
  }

  return null;
}

function parseLocalReference(qstr) {
  const normalizedQuery = String(qstr || "")
    .replace(/\u3000/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const match = normalizedQuery.match(/^(.*?\D)\s*(\d+(?::\d+(?:-\d+(?::\d+)?)?)?|\d+-\d+)$/u);
  if (!match) {
    return null;
  }

  const bookToken = normalizeAlias(match[1]);
  const referencePart = match[2];
  const book = BOOK_BY_ALIAS.get(bookToken);
  const range = parseReferenceRange(referencePart);

  if (!book || !range) {
    return null;
  }

  return { book, range };
}

function selectLocalVerses(bookVerses, range) {
  return bookVerses.filter((verse) => {
    if (verse.chapter < range.startChapter || verse.chapter > range.endChapter) {
      return false;
    }

    if (range.startVerse === null || range.endVerse === null) {
      return true;
    }

    if (range.startChapter === range.endChapter) {
      return verse.chapter === range.startChapter &&
        verse.sec >= range.startVerse &&
        verse.sec <= range.endVerse;
    }

    if (verse.chapter === range.startChapter) {
      return verse.sec >= range.startVerse;
    }

    if (verse.chapter === range.endChapter) {
      return verse.sec <= range.endVerse;
    }

    return verse.chapter > range.startChapter && verse.chapter < range.endChapter;
  });
}

async function buildLocalPassagePayload(version, qstr) {
  const parsed = parseLocalReference(qstr);
  if (!parsed) {
    return {
      status: "success",
      record_count: 0,
      v_name: VERSION_NAMES[version],
      version,
      proc: 0,
      record: []
    };
  }

  const store = await loadLocalBibleStore();
  const bookVerses = store.byBook.get(parsed.book.full) || [];
  const selectedVerses = selectLocalVerses(bookVerses, parsed.range);

  return {
    status: "success",
    record_count: selectedVerses.length,
    v_name: VERSION_NAMES[version],
    version,
    proc: 0,
    record: selectedVerses.map((verse) => ({
      chineses: verse.chineses,
      engs: verse.engs,
      chap: verse.chapter,
      sec: verse.sec,
      bible_text: verse.texts[version] || ""
    }))
  };
}

async function buildLocalKeywordPayload(version, query, limitParam, offset) {
  const store = await loadLocalBibleStore();
  const terms = extractSearchTerms(query);

  if (!terms.length) {
    return {
      status: "success",
      orig: "0",
      key: query,
      record_count: 0,
      record: []
    };
  }

  const matches = store.verses.filter((verse) =>
    terms.every((term) => verse.search[version].includes(term))
  );

  const sliced =
    limitParam === "all"
      ? matches.slice(offset)
      : matches.slice(offset, offset + Math.max(1, Math.trunc(Number(limitParam))));

  return {
    status: "success",
    orig: "0",
    key: query,
    record_count: sliced.length,
    record: sliced.map((verse, index) => ({
      id: offset + index + 1,
      chineses: verse.chineses,
      engs: verse.engs,
      chap: verse.chapter,
      sec: verse.sec,
      bible_text: verse.texts[version] || ""
    }))
  };
}

async function fetchEsvPassagePayload(qstr) {
  const upstream = new URL(`${FHL_BASE}/qsb.php`);
  upstream.searchParams.set("version", "esv");
  upstream.searchParams.set("qstr", qstr);
  upstream.searchParams.set("strong", "0");
  upstream.searchParams.set("gb", "0");

  return fetchFhlJson(upstream, "FHL passage API");
}

async function fetchEsvKeywordPage(query, pageLimit, pageOffset) {
  const upstream = new URL(`${FHL_BASE}/se.php`);
  upstream.searchParams.set("VERSION", "esv");
  upstream.searchParams.set("orig", "0");
  upstream.searchParams.set("q", query);
  upstream.searchParams.set("RANGE", "0");
  upstream.searchParams.set("limit", String(pageLimit));
  upstream.searchParams.set("offset", String(pageOffset));
  upstream.searchParams.set("gb", "0");

  return fetchFhlJson(upstream, "FHL keyword API");
}

async function buildEsvKeywordPayload(query, limitParam, offset) {
  if (limitParam === "all") {
    const pageSize = 500;
    const records = [];
    let pageOffset = offset;
    let seedPayload = null;

    while (true) {
      const json = await fetchEsvKeywordPage(query, pageSize, pageOffset);
      const batch = Array.isArray(json.record) ? json.record : [];

      if (!seedPayload) {
        seedPayload = json;
      }

      records.push(...batch);

      if (batch.length < pageSize) {
        return {
          ...seedPayload,
          record_count: records.length,
          record: records
        };
      }

      pageOffset += batch.length;
    }
  }

  const numericLimit = Number(limitParam);
  if (!Number.isFinite(numericLimit) || numericLimit <= 0) {
    throw new Error("Invalid keyword limit.");
  }

  return fetchEsvKeywordPage(query, Math.min(Math.trunc(numericLimit), 500), offset);
}

export async function resolvePassagePayload(version, qstr) {
  if (!VERSION_WHITELIST.has(version)) {
    return {
      statusCode: 400,
      payload: { status: "error", message: "Unsupported version." }
    };
  }

  if (!qstr) {
    return {
      statusCode: 400,
      payload: { status: "error", message: "Missing reference query." }
    };
  }

  try {
    const payload = LOCAL_VERSION_IDS.has(version)
      ? await buildLocalPassagePayload(version, qstr)
      : await fetchEsvPassagePayload(qstr);

    return { statusCode: 200, payload };
  } catch (error) {
    return {
      statusCode: 502,
      payload: {
        status: "error",
        message: "Unable to resolve passage data.",
        details: error instanceof Error ? error.message : String(error)
      }
    };
  }
}

export async function resolveKeywordPayload(version, query, limitParam, offset) {
  if (!VERSION_WHITELIST.has(version)) {
    return {
      statusCode: 400,
      payload: { status: "error", message: "Unsupported version." }
    };
  }

  if (!query) {
    return {
      statusCode: 400,
      payload: { status: "error", message: "Missing keyword query." }
    };
  }

  try {
    const payload = LOCAL_VERSION_IDS.has(version)
      ? await buildLocalKeywordPayload(version, query, limitParam, offset)
      : await buildEsvKeywordPayload(query, limitParam, offset);

    return { statusCode: 200, payload };
  } catch (error) {
    return {
      statusCode: 502,
      payload: {
        status: "error",
        message: "Unable to resolve keyword search data.",
        details: error instanceof Error ? error.message : String(error)
      }
    };
  }
}

async function proxyPassage(requestUrl, response) {
  const version = requestUrl.searchParams.get("version")?.toLowerCase() || "";
  const qstr = requestUrl.searchParams.get("qstr")?.trim() || "";
  const { statusCode, payload } = await resolvePassagePayload(version, qstr);
  sendJson(response, statusCode, payload);
}

async function proxyKeywordSearch(requestUrl, response) {
  const version = requestUrl.searchParams.get("version")?.toLowerCase() || "";
  const query = requestUrl.searchParams.get("q")?.trim() || "";
  const limitParam = requestUrl.searchParams.get("limit")?.trim().toLowerCase() || "all";
  const offset = Math.max(Number(requestUrl.searchParams.get("offset") || 0), 0);
  const { statusCode, payload } = await resolveKeywordPayload(version, query, limitParam, offset);
  sendJson(response, statusCode, payload);
}

async function serveStatic(requestUrl, response) {
  const pathname = requestUrl.pathname === "/" ? "/index.html" : requestUrl.pathname;
  const normalized = path.normalize(path.join(publicDir, pathname));
  const extension = path.extname(normalized);

  if (!normalized.startsWith(publicDir)) {
    sendJson(response, 403, { status: "error", message: "Forbidden path." });
    return;
  }

  try {
    const file = await readFile(normalized);
    const cacheControl =
      extension === ".html" || extension === ".js" || extension === ".css"
        ? "no-store"
        : "public, max-age=600";

    response.writeHead(200, {
      "Content-Type": MIME_TYPES[extension] || "application/octet-stream",
      "Cache-Control": cacheControl
    });
    response.end(file);
  } catch {
    if (extension) {
      sendJson(response, 404, { status: "error", message: "File not found." });
      return;
    }

    try {
      const fallback = await readFile(path.join(publicDir, "index.html"));
      response.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store"
      });
      response.end(fallback);
    } catch {
      sendJson(response, 404, { status: "error", message: "File not found." });
    }
  }
}

export function createAppServer() {
  return createServer(async (request, response) => {
    const host = request.headers.host || `localhost:${port}`;
    const requestUrl = new URL(request.url || "/", `http://${host}`);

    if (request.method !== "GET") {
      sendJson(response, 405, { status: "error", message: "Method not allowed." });
      return;
    }

    if (requestUrl.pathname === "/api/passage") {
      await proxyPassage(requestUrl, response);
      return;
    }

    if (requestUrl.pathname === "/api/search") {
      await proxyKeywordSearch(requestUrl, response);
      return;
    }

    await serveStatic(requestUrl, response);
  });
}

export function startServer(listenPort = port) {
  const server = createAppServer();
  server.listen(listenPort, () => {
    console.log(`Bible search app running at http://localhost:${listenPort}`);
  });
  return server;
}

const entryScript =
  typeof process !== "undefined" &&
  Array.isArray(process.argv) &&
  process.argv[1]
    ? process.argv[1]
    : null;

const isMainModule =
  entryScript !== null &&
  pathToFileURL(path.resolve(entryScript)).href === import.meta.url;

if (isMainModule) {
  startServer();
}
