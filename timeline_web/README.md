# Timeline Web (Single-Player First)

Browser rebuild of the Unity game Timeline using Vite + React + TypeScript.

## Run Locally

```bash
npm install
npm run dev
```

Open the local Vite URL shown in terminal.

## Test

```bash
npm run test
```

## Data Pipeline

Convert CSV data into the local JSON datasets used by the web app:

```bash
npm run data:csv-to-json -- --input /absolute/path/to/timeline_data.csv
```

Script location: `../timeline_data_generator/scripts/convertCsvToJson.mjs`

Default outputs:

- `src/data/cards.json`
- `src/data/cards.byYear.json`
- `src/data/cards.byCategory.json`

Generate a Wikipedia-enriched card dataset (summary/image/source backfill):

```bash
npm run data:wikipedia -- --input src/data/cards.json --output src/data/cards.wikipedia.json --limit 50
```

Script location: `../timeline_data_generator/scripts/generateWikipediaData.mjs`

Useful flags:

- `--overwrite-details`
- `--overwrite-image`
- `--overwrite-source`
- `--delay-ms 250`

If a card cannot be matched, failures are written to `*.failures.json` next to the output file.

## Architecture Overview

- `src/game/`: Pure game logic and types. No React imports.
- `src/hooks/useGame.ts`: Reducer-style command dispatcher that calls engine functions.
- `src/components/`: UI components only.
- `src/data/`: Local JSON dataset, async loader, and normalization.

Core pure APIs:

- `createGame(cards, options?)`
- `getCorrectInsertionIndex(timeline, card)`
- `resolveMove(state, chosenIndex)`
- `advanceAfterResolution(state)`
- `restartGame(cards, options?)`

## Where to Change Rules

Update defaults in [src/game/constants.ts](/Users/avi/Documents/game_dev/timeline/timeline_web/src/game/constants.ts):

- `initialTimelineSize`
- `maxMistakes`
- `deckSubsetSize`
- `insertOnIncorrect`
- `scoreRule`
- `randomSeed`

## Action Model (Multiplayer-Friendly)

User actions are command-shaped and can be reused for network transport later:

- `{ type: "START_GAME" }`
- `{ type: "PLACE_CARD", chosenIndex: number }`
- `{ type: "NEXT_ROUND" }`
- `{ type: "RESTART_GAME" }`

## Moving from Local JSON to Backend Later

- Keep `src/game/` unchanged.
- Replace `loadCards()` in [src/data/loadCards.ts](/Users/avi/Documents/game_dev/timeline/timeline_web/src/data/loadCards.ts) with API fetch logic returning `TimelineCard[]`.
- Continue normalizing API payloads through `normalizeCards()` so game logic receives clean, consistent data.
