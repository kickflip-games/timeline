# Timeline Data Generator

This tool generates/updates the "timeline_data.csv"
This file looks like:

| Year | Description            | Image | Source| 
|------|------------------------| ----- | ------|
| 2015 | Discovery of first GW  | Image | |
| 1517 | Mona Lisa is completed | Image | |


The data for this has been scraped from Wikipedia.

## Usage

Install the package with
```
pip install -e .
``` 

Then, run the script with
```
timeline_data_generator <csv_file>
```

## Web Data Scripts

The web app data pipeline scripts live in this folder under `scripts/`:

- `scripts/convertCsvToJson.mjs` converts timeline CSV data into web JSON files.
- `scripts/generateWikipediaData.mjs` enriches card records with Wikipedia summaries/images/sources.

They are usually invoked from `timeline_web` via npm scripts:

```bash
cd ../timeline_web
npm run data:csv-to-json -- --input ../timeline_data_generator/timeline_data.csv
npm run data:wikipedia -- --input src/data/cards.json --output src/data/cards.wikipedia.json --limit 50
```


