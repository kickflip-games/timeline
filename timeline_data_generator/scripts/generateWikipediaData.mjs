import fs from 'node:fs/promises';
import path from 'node:path';

const DEFAULT_INPUT = 'src/data/cards.json';
const DEFAULT_OUTPUT = 'src/data/cards.wikipedia.json';

const parseArgs = (argv) => {
  const args = {
    input: DEFAULT_INPUT,
    output: DEFAULT_OUTPUT,
    limit: null,
    overwriteDetails: false,
    overwriteImage: false,
    overwriteSource: false,
    delayMs: 150,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];

    if (value === '--input') {
      args.input = argv[index + 1] ?? DEFAULT_INPUT;
      index += 1;
      continue;
    }

    if (value === '--output') {
      args.output = argv[index + 1] ?? DEFAULT_OUTPUT;
      index += 1;
      continue;
    }

    if (value === '--limit') {
      const raw = argv[index + 1] ?? '';
      const parsed = Number.parseInt(raw, 10);
      if (Number.isInteger(parsed) && parsed > 0) {
        args.limit = parsed;
      }
      index += 1;
      continue;
    }

    if (value === '--overwrite-details') {
      args.overwriteDetails = true;
      continue;
    }

    if (value === '--overwrite-image') {
      args.overwriteImage = true;
      continue;
    }

    if (value === '--overwrite-source') {
      args.overwriteSource = true;
      continue;
    }

    if (value === '--delay-ms') {
      const raw = argv[index + 1] ?? '';
      const parsed = Number.parseInt(raw, 10);
      if (Number.isInteger(parsed) && parsed >= 0) {
        args.delayMs = parsed;
      }
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

const sleep = async (delayMs) => new Promise((resolve) => {
  setTimeout(resolve, delayMs);
});

const parseWikiPageTitleFromSource = (source) => {
  if (typeof source !== 'string' || source.length === 0 || !source.includes('wikipedia.org/wiki/')) {
    return '';
  }

  const wikiPart = source.split('/wiki/')[1] ?? '';
  if (!wikiPart) {
    return '';
  }

  try {
    return decodeURIComponent(wikiPart.split('#')[0]);
  } catch {
    return wikiPart.split('#')[0];
  }
};

const searchWikiPageTitle = async (query) => {
  const url = new URL('https://en.wikipedia.org/w/api.php');
  url.searchParams.set('action', 'query');
  url.searchParams.set('list', 'search');
  url.searchParams.set('srsearch', query);
  url.searchParams.set('utf8', '1');
  url.searchParams.set('format', 'json');
  url.searchParams.set('srlimit', '1');

  const response = await fetch(url);
  if (!response.ok) {
    return '';
  }

  const payload = await response.json();
  const first = payload?.query?.search?.[0];
  if (!first || typeof first.title !== 'string') {
    return '';
  }

  return first.title;
};

const fetchWikiSummary = async (pageTitle) => {
  const endpoint = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`;
  const response = await fetch(endpoint);
  if (!response.ok) {
    return null;
  }

  const payload = await response.json();
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  return {
    extract: typeof payload.extract === 'string' ? payload.extract : '',
    url: payload?.content_urls?.desktop?.page,
    image: payload?.thumbnail?.source ?? payload?.originalimage?.source,
    title: typeof payload.title === 'string' ? payload.title : pageTitle,
  };
};

const buildQuery = (card) => {
  const category = typeof card.category === 'string' && card.category.trim().length > 0
    ? card.category.trim()
    : '';

  if (category) {
    return `${card.title} ${card.year} ${category}`;
  }

  return `${card.title} ${card.year}`;
};

const shouldEnrich = (card, args) => {
  const needsDetails = args.overwriteDetails || !card.details;
  const needsImage = args.overwriteImage || !card.image;
  const needsSource = args.overwriteSource || !card.source;

  return needsDetails || needsImage || needsSource;
};

const printHelp = () => {
  console.log(`Wikipedia data generator\n\nUsage:\n  node scripts/generateWikipediaData.mjs [options]\n\nOptions:\n  --input <path>             Default: ${DEFAULT_INPUT}\n  --output <path>            Default: ${DEFAULT_OUTPUT}\n  --limit <n>                Only enrich first n eligible cards\n  --overwrite-details        Replace existing details\n  --overwrite-image          Replace existing image\n  --overwrite-source         Replace existing source\n  --delay-ms <n>             Delay between requests (default 150)`);
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    return;
  }

  const inputPath = toAbsolute(args.input);
  const outputPath = toAbsolute(args.output);

  const rawInput = await fs.readFile(inputPath, 'utf8');
  const cards = JSON.parse(rawInput);

  if (!Array.isArray(cards)) {
    throw new Error(`Expected array input in ${inputPath}`);
  }

  const enriched = [];
  let processed = 0;
  let success = 0;
  const failures = [];

  for (const card of cards) {
    const nextCard = { ...card };

    if (!shouldEnrich(nextCard, args)) {
      enriched.push(nextCard);
      continue;
    }

    if (args.limit !== null && processed >= args.limit) {
      enriched.push(nextCard);
      continue;
    }

    const titleFromSource = parseWikiPageTitleFromSource(nextCard.source);
    const searchQuery = buildQuery(nextCard);

    let pageTitle = titleFromSource;
    if (!pageTitle) {
      pageTitle = await searchWikiPageTitle(searchQuery);
      await sleep(args.delayMs);
    }

    if (!pageTitle) {
      failures.push({ id: nextCard.id, reason: 'No Wikipedia page match', query: searchQuery });
      enriched.push(nextCard);
      processed += 1;
      continue;
    }

    const summary = await fetchWikiSummary(pageTitle);
    await sleep(args.delayMs);

    if (!summary) {
      failures.push({ id: nextCard.id, reason: 'Summary fetch failed', pageTitle });
      enriched.push(nextCard);
      processed += 1;
      continue;
    }

    if (args.overwriteDetails || !nextCard.details) {
      nextCard.details = summary.extract || nextCard.details;
    }

    if (args.overwriteImage || !nextCard.image) {
      if (typeof summary.image === 'string' && summary.image.length > 0) {
        nextCard.image = summary.image;
      }
    }

    if (args.overwriteSource || !nextCard.source) {
      if (typeof summary.url === 'string' && summary.url.length > 0) {
        nextCard.source = summary.url;
      }
    }

    nextCard.wikipediaTitle = summary.title;

    success += 1;
    processed += 1;
    enriched.push(nextCard);
  }

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(enriched, null, 2)}\n`, 'utf8');

  console.log(`Input cards: ${cards.length}`);
  console.log(`Enrichment attempts: ${processed}`);
  console.log(`Successfully enriched: ${success}`);
  console.log(`Failed enrichments: ${failures.length}`);
  console.log(`Wrote ${outputPath}`);

  if (failures.length > 0) {
    const failurePath = outputPath.replace(/\.json$/i, '.failures.json');
    await fs.writeFile(failurePath, `${JSON.stringify(failures, null, 2)}\n`, 'utf8');
    console.log(`Wrote ${failurePath}`);
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
