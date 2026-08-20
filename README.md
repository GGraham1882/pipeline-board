# Pipeline

A lightweight sales deal tracker that runs entirely in the browser. Drag deals
through a five-stage funnel — Prospect, Contacted, Meeting, Proposal, Closed —
and everything persists in localStorage. No accounts, no server, no setup.

Built by [Graham Connell](https://grahamconnell.net) with Claude Code, as part
of learning to ship real software with AI tools.

## Features

- Drag-and-drop deals between pipeline stages
- Add, edit, and delete deals (company, contact, value, notes)
- Per-stage deal counts and dollar totals, plus a whole-pipeline total
- Ships with fictional demo data so the board is alive on first visit;
  one-click reset back to the demo set
- Plain HTML, CSS, and JavaScript — no frameworks, no build step

## Running it

Open `index.html` in a browser, or serve the folder with any static file
server:

```
python -m http.server
```

## Notes

All demo companies and contacts are fictional. Your own deals never leave your
browser — the app has no backend and makes no network requests.
