import fs from 'node:fs/promises';
import path from 'node:path';

const DEFAULT_CARDS_OUT = 'src/data/cards.json';
const DEFAULT_BY_YEAR_OUT = 'src/data/cards.byYear.json';
const DEFAULT_BY_CATEGORY_OUT = 'src/data/cards.byCategory.json';

const parseArgs = (argv) => {
  const args = {
    input: '',
    cardsOut: DEFAULT_CARDS_OUT,
    byYearOut: DEFAULT_BY_YEAR_OUT,
    byCategoryOut: DEFAULT_BY_CATEGORY_OUT,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];

    if (value === '--input') {
      args.input = argv[index + 1] ?? '';
      index += 1;
      continue;
    }

    if (value === '--cards-out') {
      args.cardsOut = argv[index + 1] ?? DEFAULT_CARDS_OUT;
      index += 1;
      continue;
    }

    if (value === '--by-year-out') {
      args.byYearOut = argv[index + 1] ?? DEFAULT_BY_YEAR_OUT;
      index += 1;
      continue;
    }

    if (value === '--by-category-out') {
      args.byCategoryOut = argv[index + 1] ?? DEFAULT_BY_CATEGORY_OUT;
      index += 1;
      continue;
    }

    if (value === '--help' || value === '-h') {
      return { ...args, help: true };
    }
  }

  return args;
};

const toAbsolute = (targetPath) => path.resolve(process.cwd(), targetPath);

const normalizeHeader = (header) => header.trim().toLowerCase().replace(/[\s_-]+/g, '');

const parseCsv = (text) => {
  const rows = [];
  let row = [];
  let value = '';
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (inQuotes) {
      if (char === '"' && text[index + 1] === '"') {
        value += '"';
        index += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        value += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }

    if (char === ',') {
      row.push(value);
      value = '';
      continue;
    }

    if (char === '\n') {
      row.push(value);
      rows.push(row);
      row = [];
      value = '';
      continue;
    }

    if (char === '\r') {
      continue;
    }

    value += char;
  }

  if (value.length > 0 || row.length > 0) {
    row.push(value);
    rows.push(row);
  }

  return rows;
};

const parseYear = (rawYear) => {
  if (!rawYear) {
    return null;
  }

  const match = String(rawYear).match(/-?\d{1,6}/);
  if (!match) {
    return null;
  }

  const year = Number.parseInt(match[0], 10);
  if (!Number.isInteger(year)) {
    return null;
  }

  return year;
};

const toSlug = (text) => text
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9\s-]/g, '')
  .replace(/\s+/g, '-')
  .replace(/-+/g, '-');

const getRowValue = (row, indexes) => {
  for (const index of indexes) {
    if (index >= 0 && index < row.length) {
      const value = row[index]?.trim();
      if (value) {
        return value;
      }
    }
  }
  return '';
};

const unique = (values) => [...new Set(values)];

const convertRows = (rows) => {
  if (rows.length === 0) {
    return [];
  }

  const headerIndexes = new Map(rows[0].map((header, index) => [normalizeHeader(header), index]));

  const indexes = {
    id: [headerIndexes.get('id') ?? -1],
    title: unique([
      headerIndexes.get('title') ?? -1,
      headerIndexes.get('event') ?? -1,
      headerIndexes.get('name') ?? -1,
    ]),
    year: unique([
      headerIndexes.get('year') ?? -1,
      headerIndexes.get('date') ?? -1,
      headerIndexes.get('eventyear') ?? -1,
    ]),
    details: unique([
      headerIndexes.get('details') ?? -1,
      headerIndexes.get('description') ?? -1,
      headerIndexes.get('summary') ?? -1,
    ]),
    image: unique([
      headerIndexes.get('image') ?? -1,
      headerIndexes.get('imageurl') ?? -1,
      headerIndexes.get('thumbnail') ?? -1,
    ]),
    source: unique([
      headerIndexes.get('source') ?? -1,
      headerIndexes.get('url') ?? -1,
      headerIndexes.get('link') ?? -1,
    ]),
    category: unique([
      headerIndexes.get('category') ?? -1,
      headerIndexes.get('tag') ?? -1,
      headerIndexes.get('type') ?? -1,
    ]),
  };

  const seenIds = new Set();
  const cards = [];

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex];
    if (!row || row.every((cell) => !cell || cell.trim().length === 0)) {
      continue;
    }

    const title = getRowValue(row, indexes.title);
    const year = parseYear(getRowValue(row, indexes.year));

    if (!title || year === null) {
      continue;
    }

    const rawId = getRowValue(row, indexes.id);
    const baseId = rawId || `${toSlug(title)}-${year}`;

    let id = baseId;
    let suffix = 2;
    while (seenIds.has(id)) {
      id = `${baseId}-${suffix}`;
      suffix += 1;
    }
    seenIds.add(id);

    const details = getRowValue(row, indexes.details);
    const image = getRowValue(row, indexes.image);
    const source = getRowValue(row, indexes.source);
    const category = getRowValue(row, indexes.category);

    cards.push({
      id,
      title,
      year,
      ...(details ? { details } : {}),
      ...(image ? { image } : {}),
      ...(source ? { source } : {}),
      ...(category ? { category } : {}),
    });
  }

  cards.sort((left, right) => (left.year - right.year) || left.title.localeCompare(right.title));

  return cards;
};

const buildByYear = (cards) => {
  const byYear = {};

  for (const card of cards) {
    const key = String(card.year);
    byYear[key] = byYear[key] ?? [];
    byYear[key].push(card.id);
  }

  return byYear;
};

const buildByCategory = (cards) => {
  const byCategory = {};

  for (const card of cards) {
    const key = card.category ?? 'uncategorized';
    byCategory[key] = byCategory[key] ?? [];
    byCategory[key].push(card.id);
  }

  return byCategory;
};

const writeJson = async (targetPath, value) => {
  const absolutePath = toAbsolute(targetPath);
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
};

const printHelp = () => {
  console.log(`CSV -> JSON converter\n\nUsage:\n  node scripts/convertCsvToJson.mjs --input <path-to-csv> [options]\n\nOptions:\n  --cards-out <path>        Default: ${DEFAULT_CARDS_OUT}\n  --by-year-out <path>      Default: ${DEFAULT_BY_YEAR_OUT}\n  --by-category-out <path>  Default: ${DEFAULT_BY_CATEGORY_OUT}`);
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));

  if (args.help || !args.input) {
    printHelp();
    process.exit(args.help ? 0 : 1);
  }

  const csvPath = toAbsolute(args.input);
  const csvText = await fs.readFile(csvPath, 'utf8');
  const rows = parseCsv(csvText);
  const cards = convertRows(rows);

  const byYear = buildByYear(cards);
  const byCategory = buildByCategory(cards);

  await writeJson(args.cardsOut, cards);
  await writeJson(args.byYearOut, byYear);
  await writeJson(args.byCategoryOut, byCategory);

  console.log(`Converted ${cards.length} cards from ${csvPath}`);
  console.log(`Wrote ${toAbsolute(args.cardsOut)}`);
  console.log(`Wrote ${toAbsolute(args.byYearOut)}`);
  console.log(`Wrote ${toAbsolute(args.byCategoryOut)}`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
