# Home-Heist Agents

TypeScript harness for Gemini-powered agents that find and compare
mortgage rates from lenders that aren't easily discoverable
(credit unions, community banks, CDFIs, state housing programs).

## Architecture

```
borrower profile (zip, credit, income, price, down payment)
        │
        ▼
  zipToCounty()          ZIP -> county FIPS (zippopotam + Census geocoder)
  fetchHmdaFilers()      county -> real lenders (CFPB HMDA public API)
        │
        ▼
  Institution Agent      Gemini + Google Search + URL Context
        │                classifies HMDA filers -> `institution` table
        ▼
  Loan Agent             Gemini + Google Search + URL Context
        │                reads lenders' actual rate pages -> `loan_product`
        ▼
  Main Agent             queries Postgres via MCP (in-process server),
        │                logs the search, writes the recommendation
        ▼
   recommendation text
```

Falls back at every layer: if HMDA/Census are unreachable the
institution agent researches on its own; `db/seed.sql` keeps the demo
alive fully offline.

## Setup

```bash
docker compose -f ../docker-compose.yml up -d   # Postgres on :5433
npm install
cp .env.example .env                            # add GEMINI_API_KEY
```

## Run

```bash
npm run dev          # full pipeline on the demo profile in src/index.ts
npm run seed         # load fallback rows into the DB
npm run typecheck
```

## Pieces

- `src/hmda.ts` — ZIP -> county FIPS -> HMDA filers (deterministic public data)
- `src/collectors.ts` — institution + loan agents (grounded research -> structured extraction -> DB)
- `src/agent.ts` — `Agent` class: `ask()` (MCP tools via `mcpToTool`),
  `research()` (googleSearch + urlContext), `extractJson()`
- `src/db.ts` — Postgres access (`pg`)
- `src/dbMcp.ts` — DB exposed as in-process MCP server (search_loans,
  list_institutions, log_search)
- `src/orchestrator.ts` — `recommend(profile)`: the whole pipeline
- `src/mcp.ts` — generic MCP client connector (stdio/http; Linear demo via mcp-remote)
- `db/schema.sql` — Postgres DDL (auto-loaded by docker-compose)
- `db/seed.sql` — demo fallback rows

## Contracts

- **DB**: `DATABASE_URL` (port 5433 — 5432 was occupied); agents write
  `institution` + `loan_product`, log to `loan_search`
- **Front-end**: `recommend(profile)` -> `{institutionsFound, loansFound,
  recommendation}`
