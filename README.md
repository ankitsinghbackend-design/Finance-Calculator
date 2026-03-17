# Finance Calculator (Prototype)

This repository contains a Vite + React + TypeScript project scaffolded to match a Figma landing page design. Tailwind CSS is configured and design tokens (colors, fonts, spacing) were extracted from the Figma file.

Quick start

```bash
# install
npm install

# dev
npm run dev

# build
npm run build
```

Files of interest
- `src/components/Header.tsx` — Header component
- `src/components/Footer.tsx` — Footer component
- `src/components/CalculatorCard.tsx` — Reusable calculator card
- `src/components/CategorySection.tsx` — Groups calculators
- `src/config/calculatorConfig.ts` — Dynamic config to render cards
- `src/pages/Home.tsx` — Landing page
- `src/pages/Finance.tsx` — Calculators listing

Next steps
- Run `npm install` then `npm run dev` to preview.
- I can add full individual calculator pages and interactive forms next — tell me which calculators to prioritize.
# Finance-Calculator
A calculator to help you take your finance decisions smartly.

## AdBlock detection configuration (snippet)

Set these variables in your runtime env:

- `AD_BAIT_PATH=/ads-bait-a9f3d1.js`
- `ADBLOCK_LOG_ENDPOINT=/api/log/adblock`
- `VITE_AD_BAIT_PATH=/ads-bait-a9f3d1.js`
- `VITE_ADBLOCK_LOG_ENDPOINT=/api/log/adblock`

Backend docs: `backend/README_ADBLOCK.md`
Frontend docs: `frontend/README_ADBLOCK_FRONTEND.md`

## Backend deployment on Linux / MilesWeb

Do not upload or reuse `node_modules` from macOS on the server. This project uses `tsx` for local development, and its `esbuild` dependency is platform-specific.

Recommended server steps from the repository root:

```bash
rm -rf node_modules backend/node_modules dist
npm ci
npm run backend:build
npm --prefix backend start
```

Notes:
- Use `npm --prefix backend dev` only for local development.
- On the server, use `start` after `backend:build`; it runs `node dist/backend/server.js` and avoids `tsx`/`esbuild` at runtime.
- If you previously uploaded `node_modules`, delete it first before reinstalling on MilesWeb.

### Tests

```bash
npm test
```

Includes:
- jsdom unit tests for multi-heuristic adblock detection
- supertest integration test for `POST /api/log/adblock`
