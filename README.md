<div align="center">

# Company Coding Interview Intelligence Dashboard

**A fully static, data-driven analytics platform for exploring company-wise coding interview questions.**

![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-build-646CFF?logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![Backend](https://img.shields.io/badge/backend-none-success)
![License](https://img.shields.io/badge/license-MIT-blue)

</div>

![Dashboard](docs/dashboard.png)

---

## Table of contents

1. [Overview](#overview)
2. [Key features](#key-features)
3. [Pages](#pages)
4. [Tech stack](#tech-stack)
5. [Architecture](#architecture)
6. [Dataset](#dataset)
7. [Quick start](#quick-start)
8. [Regenerating the dataset](#regenerating-the-dataset)
9. [Deployment](#deployment)
10. [Methodology](#methodology)
11. [Performance](#performance)
12. [Accessibility](#accessibility)
13. [Project structure](#project-structure)
14. [Limitations](#limitations)
15. [Data attribution & disclaimer](#data-attribution--disclaimer)
16. [Contributing](#contributing)
17. [License](#license)

---

## Overview

This project turns a ZIP of per-company coding interview CSVs into an interactive analytics product. It answers questions such as:

- Which questions are asked across the most companies?
- What does a specific company's question set look like (difficulty, topics, recency)?
- Which questions are shared between companies, and which are company-specific?
- Which DSA areas (Bit Manipulation, Linked Lists, Strings, Arrays, Hashing, Trees, Graphs, DP…) dominate?
- How do two or three companies compare?
- What should I prioritise if I am preparing for one company?

Everything shown is **computed from the supplied dataset at runtime**. There are no hardcoded statistics, no mock data, and no invented metrics. Where something cannot be computed, the UI says *"Not available from supplied dataset."*

> **No backend.** The deployed app is 100% static. Node.js is used **only as a build tool** (`scripts/build-dataset.js`) to normalise the raw CSVs into one file. There is no Express server, API, database or authentication.

## Key features

| Area | What you get |
| --- | --- |
| **Executive dashboard** | 8 KPI cards, 8 interactive charts, most-repeated-questions table |
| **Company explorer** | Search + filters (min questions, difficulty, recency, topic), company cards |
| **Company profile** | Difficulty / recency / topic charts, acceptance & frequency stats, top questions, sharing tiers (2, 3, 5, 10, 25, 50, 100+ companies), company-specific questions, filterable question bank |
| **Question explorer** | Search by title, problem ID, company or topic; difficulty, topic, company, recency, company-count, acceptance and frequency filters; sortable columns; detail drawer |
| **Most repeated / Common** | Ranked by company coverage, tier buttons (5+/10+/25+/50+/100+), Top 10/25/50/100 coverage insight |
| **Topics / DSA** | Per-topic analytics with spotlight buttons for Bit Manipulation, Linked List, Strings, Arrays, Hashing, Trees, Graphs, Dynamic Programming |
| **Matrices** | Company × Topic heatmap; paginated Company × Question grid |
| **Comparison & overlap** | Compare up to 3 companies (shared / unique questions, topic differences); overlap network for one company |
| **Difficulty & acceptance** | Donut, stacked charts, company × difficulty heatmap, acceptance vs difficulty and vs coverage |
| **Recency** | Per-bucket counts, difficulty and topic by bucket, clear limitations |
| **Preparation planner** | Pick a company, tune weights with sliders, get a *Dataset-Based Preparation Priority* |
| **Data quality** | Build-time validation report + runtime cross-checks |
| **Methodology** | Transparent explanation of every computed value |
| **UX** | Dark/light theme (persisted), responsive sidebar → mobile menu, global debounced search, loading / empty / error states, hash routing |

## Pages

| Route | Page |
| --- | --- |
| `/` | Dashboard |
| `/companies`, `/companies/:name` | Company explorer, company profile |
| `/questions` | Question explorer |
| `/repeated` | Most repeated questions |
| `/common` | Common questions across companies |
| `/topics` | Topic analytics (`?topic=Bit Manipulation`) |
| `/compare` | Company comparison + overlap network |
| `/matrices` | Company × Topic and Company × Question |
| `/difficulty` | Difficulty and acceptance analytics |
| `/recency` | Recency analytics |
| `/preparation` | Preparation planner |
| `/data-quality` | Data quality |
| `/methodology` | Methodology |

Charts deep-link into filtered views, e.g. `/#/questions?difficulty=Hard` or `/#/questions?company=google&topic=Graphs`.

## Tech stack

- **React** + **Vite** (JavaScript, ES modules)
- **Tailwind CSS v3** with a class-based dark mode
- **Papa Parse** for CSV parsing (build script and browser)
- **Web Worker** for parsing and aggregation off the main thread
- **Recharts** for charts, **Lucide React** for icons
- **React Router** (hash routing, so no server rewrite rules are needed)

## Architecture

```text
data/raw/<company>/*.csv          raw provenance, never modified
        │
        ▼   npm run build:data   (Node script, build-time only)
public/dataset/records.csv        normalised company–question records
public/dataset/quality.json       validation report
        │
        ▼   browser
Web Worker (Papa Parse → topic inference → question & company aggregates)
        │
        ▼
React context (memoised derived data) → pages, charts, tables
```

Design choices:

- **One normalised file** is loaded instead of 1,648 raw CSVs.
- **Aggregation runs in a Web Worker**, so the UI stays responsive during load.
- **Derived data is memoised** (`useMemo`) and computed once; filters and sorting operate on in-memory arrays.
- **Pages are lazy-loaded**, and the charting library is split into its own chunk.
- **Small shared components** (`DataTable`, `QuestionTable`, `FilterBar`, `Heatmap`, charts) keep pages short and consistent.

## Dataset

Raw layout:

```text
data/raw/
  <company>/
    all.csv
    thirty-days.csv
    three-months.csv
    six-months.csv
    more-than-six-months.csv
```

Columns: `ID, URL, Title, Difficulty, Acceptance %, Frequency %`.

Snapshot produced by the build (all computed, see the Data Quality page):

- 656 companies · 1,648 source files
- 3,358 unique problems
- 17,666 company–question records (17,641 in `all.csv` plus `ola` and `ust`, which only have recency files)

Normalised schema (`public/dataset/records.csv`):

| Column | Meaning |
| --- | --- |
| `company` | Folder name |
| `problemId` | Problem ID from the source |
| `title`, `url`, `difficulty` | Problem metadata |
| `acceptance` | Acceptance % (number) |
| `frequency` | Frequency % **from `all.csv` only** (empty if the pair is absent from `all.csv`) |
| `sourceFile` | Source files containing the pair, joined with `\|` |
| `bucket` | `30d`, `3m`, `6m`, `older` or `unspecified` |

## Quick start

Requirements: **Node.js 18+** and npm.

```bash
npm install
npm run dev        # builds the dataset, then starts the Vite dev server
```

| Script | Purpose |
| --- | --- |
| `npm run build:data` | Regenerate `public/dataset/*` from `data/raw` and print a validation summary |
| `npm run dev` | Build data, then start the dev server |
| `npm run build` | Build data, then create the production bundle in `dist/` |
| `npm run preview` | Serve the production bundle locally |

## Regenerating the dataset

1. Add or replace company folders under `data/raw/`.
2. Run `npm run build:data`.
3. Read the printed summary. The script validates required columns, missing values, invalid difficulty / acceptance / frequency / URL / ID, duplicate rows within a file, and conflicting titles or URLs per problem ID. It exits with an error if required columns are missing.
4. Commit the regenerated `public/dataset/` files or let your CI run the build.

## Deployment

The output in `dist/` is plain static files (`base: './'`, hash routing).

- **Vercel / Netlify:** build command `npm run build`, output directory `dist`.
- **GitHub Pages:** run `npm run build`, then publish `dist/` (for example with a Pages workflow or the `gh-pages` branch). No rewrite rules are required.

## Methodology

- **Recency.** `thirty-days` → `30d`, `three-months` → `3m`, `six-months` → `6m`, `more-than-six-months` → `older`. A company–question pair takes the **most recent** bucket it appears in (`30d > 3m > 6m > older`). A pair found only in `all.csv` is `unspecified`. Recency is never guessed. "Recent" in the UI means `30d`, `3m` or `6m`.
- **Frequency.** Frequency is **relative to each source file** and must not be compared across files. The app uses the `all.csv` value only. A question-level frequency is the mean of its per-company `all.csv` values.
- **Inferred Topic.** The dataset has no tag column, so topics are inferred from **problem titles** using ordered keyword rules (`src/utils/topics.js`). A question can match several topics; the first match is its *primary* topic. These are **not official tags**, and some labels will be wrong.
- **Dataset-Based Priority (0–100).** A transparent weighted score of:
  - *frequency*: `all.csv` frequency / 100
  - *coverage*: log-scaled company count relative to the most widely shared question
  - *recency*: `30d = 1`, `3m = 0.75`, `6m = 0.5`, `older = 0.25`, `unspecified = 0`
  - *difficulty preference*: 1 if the question matches the preferred difficulty (or "Any"), else 0

  Default weights are 40 / 30 / 20 / 10 and are adjustable in the Preparation planner; they are re-normalised to sum to 100%. **This score summarises patterns in the supplied dataset. It does not predict future interviews.**
- **Acceptance** is the dataset's reported metric. It is not a measure of interview importance.

## Performance

- Single normalised CSV (about 2.7 MB) parsed in a Web Worker
- Memoised derived data and selectors
- Paginated tables; the question matrix renders a window of rows and companies at a time
- Route-level code splitting with lazy loading

## Accessibility

Semantic HTML and labelled controls, keyboard-operable tables, menus and drawers (Escape closes the drawer), visible focus rings, `aria-sort` on sortable headers, and badges that combine a text label with a colour marker so meaning never depends on colour alone.

## Project structure

```text
.
├── data/raw/                 original company CSVs (provenance)
├── docs/                     screenshots
├── public/dataset/           generated records.csv + quality.json
├── scripts/build-dataset.js  build-time normalisation and validation
└── src/
    ├── components/
    │   ├── charts/           Charts (bar, columns, donut), Heatmap
    │   ├── common/           Cards, Badges, Controls, Modal/Drawer, States, QuestionTable, QuestionDrawer
    │   ├── filters/          FilterBar
    │   ├── layout/           Layout, GlobalSearch
    │   └── tables/           DataTable
    ├── constants/            difficulty, bucket and note constants
    ├── hooks/                useDataset, useQuestionFilters, useTheme, useDebounce
    ├── pages/                one file per page
    ├── utils/                topics, priority, analytics, stats
    └── workers/dataWorker.js CSV parsing and aggregation
```

## Limitations

- Topic inference is title-based and approximate; a meaningful share of titles ends up under **Other**.
- Recency depends on which files contain a pair. `unspecified` does not mean "old".
- Frequency values cannot be compared across source files.
- The 25 `ola` / `ust` records have no `all.csv` row, so they have no dataset frequency.
- The numbers describe the supplied snapshot only; they are not a forecast and not a ranking of companies.

## Data attribution & disclaimer

The raw CSVs are a third-party dataset of company-wise interview questions. Check the license and terms of the original source before redistributing the data. Problem titles and links refer to problems on LeetCode, which remain the property of their respective owners. This project is independent and is not affiliated with or endorsed by LeetCode or any company listed. Nothing here guarantees that a question will or will not appear in an interview.

## Contributing

Issues and pull requests are welcome.

1. Fork the repo and create a feature branch.
2. Run `npm run build:data && npm run build` and make sure both succeed.
3. Keep analytics **derived from the dataset**: no hardcoded counts or fake data.
4. Open a pull request describing the change.

Good first contributions: improving topic rules in `src/utils/topics.js`, adding an export-to-CSV action, or adding automated tests for `priority.js` and `analytics.js`.

## License

Released under the [MIT License](LICENSE). This license covers the source code of this application. The raw dataset and the problem content are subject to their own terms (see [Data attribution & disclaimer](#data-attribution--disclaimer)).