import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const dataDir = path.join(rootDir, "data");
const mergedPath = path.join(dataDir, "bible_data.json");

const DOWNLOAD_TARGETS = [
  {
    code: "esv",
    field: "ESV",
    label: "ESV",
    outputPath: path.join(dataDir, "fhl_esv.json")
  },
  {
    code: "lcc",
    field: "LCC",
    label: "呂振中譯本",
    outputPath: path.join(dataDir, "fhl_lcc.json")
  }
];

const USER_AGENT = "Codex-FHL-Downloader/1.0";
const MAX_CONCURRENCY = 6;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url, attempt = 1) {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (attempt >= 3) {
      throw error;
    }

    await wait(300 * attempt);
    return fetchJson(url, attempt + 1);
  }
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

function parseBookList(csvText) {
  return String(csvText || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [bid, engs, full, zhShort, zhFull, engShort] = line.split(",");
      return {
        bid: Number(bid),
        engs: engs?.trim() || "",
        full: full?.trim() || "",
        zhShort: zhShort?.trim() || "",
        zhFull: zhFull?.trim() || "",
        engShort: engShort?.trim() || ""
      };
    });
}

function buildBaseBookList(records) {
  const chapterCounts = new Map();
  const order = [];

  for (const record of records) {
    const bookName = String(record.book_en || "");
    const chapter = Number(record.chapter || 0);

    if (!chapterCounts.has(bookName)) {
      order.push(bookName);
      chapterCounts.set(bookName, chapter);
      continue;
    }

    chapterCounts.set(bookName, Math.max(chapterCounts.get(bookName), chapter));
  }

  return order.map((bookName) => ({
    book_en: bookName,
    chapters: chapterCounts.get(bookName) || 0
  }));
}

function makeVerseKey(bookName, chapter, verse) {
  return `${bookName}|${chapter}|${verse}`;
}

async function fetchBookCatalog() {
  const response = await fetch("https://bible.fhl.net/json/listall.html", {
    headers: {
      "User-Agent": USER_AGENT
    }
  });

  if (!response.ok) {
    throw new Error(`Unable to fetch FHL book list (${response.status}).`);
  }

  return parseBookList(await response.text());
}

async function fetchChapter(target, book, chapter) {
  const url = new URL("https://bible.fhl.net/json/qb.php");
  url.searchParams.set("version", target.code);
  url.searchParams.set("chineses", book.zhShort);
  url.searchParams.set("chap", String(chapter));
  url.searchParams.set("gb", "0");

  const json = await fetchJson(url);

  if (json.status !== "success") {
    throw new Error(`${target.code} ${book.zhShort} ${chapter} returned ${json.status}.`);
  }

  const record = Array.isArray(json.record) ? json.record : [];
  if (!record.length) {
    throw new Error(`${target.code} ${book.zhShort} ${chapter} returned no verses.`);
  }

  return record.map((item) => ({
    book_en: book.book_en,
    book_zh_short: book.zhShort,
    engs: String(item.engs || book.engs || "").trim(),
    chapter: Number(item.chap),
    verse: Number(item.sec),
    text: String(item.bible_text || "").trim()
  }));
}

async function downloadVersion(target, books) {
  const jobs = books.flatMap((book) =>
    Array.from({ length: book.chapters }, (_, index) => ({
      book,
      chapter: index + 1
    }))
  );

  console.log(`Downloading ${target.label} (${jobs.length} chapters)...`);

  const chunks = await runWithConcurrency(jobs, MAX_CONCURRENCY, async (job, index) => {
    const verses = await fetchChapter(target, job.book, job.chapter);

    if ((index + 1) % 100 === 0 || index === jobs.length - 1) {
      console.log(`${target.code}: ${index + 1}/${jobs.length} chapters`);
    }

    return verses;
  });

  const verses = normalizeVerses(target, chunks.flat());
  await writeFile(target.outputPath, JSON.stringify(verses), "utf8");
  console.log(`Saved ${target.outputPath}`);

  return verses;
}

function normalizeVerses(target, verses) {
  if (target.code !== "lcc") {
    return verses;
  }

  return verses.map((verse) => {
    if (verse.book_en === "1 Chronicles" && verse.chapter === 21 && verse.verse === 31) {
      return {
        ...verse,
        chapter: 22,
        verse: 1
      };
    }

    if (verse.book_en === "1 Chronicles" && verse.chapter === 22 && verse.verse >= 1) {
      return {
        ...verse,
        verse: verse.verse + 1
      };
    }

    return verse;
  });
}

async function main() {
  await mkdir(dataDir, { recursive: true });

  const baseRecords = JSON.parse(await readFile(mergedPath, "utf8"));
  const baseBooks = buildBaseBookList(baseRecords);
  const fhlBooks = await fetchBookCatalog();

  if (baseBooks.length !== 66 || fhlBooks.length < 66) {
    throw new Error("Unexpected book catalog size.");
  }

  const books = baseBooks.map((book, index) => ({
    ...book,
    ...fhlBooks[index]
  }));

  const downloadedByField = new Map();

  for (const target of DOWNLOAD_TARGETS) {
    const verses = await downloadVersion(target, books);
    downloadedByField.set(
      target.field,
      new Map(verses.map((verse) => [makeVerseKey(verse.book_en, verse.chapter, verse.verse), verse.text]))
    );
  }

  const merged = baseRecords.map((record) => {
    const key = makeVerseKey(record.book_en, Number(record.chapter), Number(record.verse));
    const nextRecord = { ...record };

    for (const target of DOWNLOAD_TARGETS) {
      nextRecord[target.field] = downloadedByField.get(target.field)?.get(key) || "";
    }

    return nextRecord;
  });

  await writeFile(mergedPath, JSON.stringify(merged), "utf8");
  console.log(`Updated ${mergedPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
