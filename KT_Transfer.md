# 🧠 FinCalCo: Technical Knowledge Transfer (KT)

**Date:** March 20, 2026
**Architecture Style:** Monolith Repository with Decoupled Logic
**Deployment Target:** Node.js (Phusion Passenger) on MilesWeb/cPanel

---

## 🏗️ 1. System Architecture
FinCalCo is built as a **Single-Process Monolith**. 
- **Frontend:** A React/Vite application that compiles into static assets in `dist/`.
- **Backend:** An Express/Node.js server that serves the frontend's `dist/` folder and provides a RESTful API.
- **The Bridge:** Since cPanel/MilesWeb uses Phusion Passenger, a root-level `app.js` acts as the entry point, importing the compiled `dist/backend/server.js`.

### Logic Flow
1. **User Interaction:** React Frontend → `axios` call.
2. **API Layer:** Express Routes → Controllers.
3. **Logic Layer:** Controllers → Registry-based Calculation Modules.
4. **Data Layer:** Mongoose (MongoDB Atlas).
5. **Analytics:** Every calculation and adblock event is logged to MongoDB for business intelligence.

---

## 🛠️ 2. Tech Stack Detail

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | React 18, TypeScript | UI Library & Type Safety |
| **Build Tool** | Vite 5 | Fast HMR and Optimized Production Bundling |
| **Styling** | Tailwind CSS 3 | Utility-first responsive design |
| **Backend** | Node.js, Express | Server Framework |
| **Database** | MongoDB + Mongoose | Data Persistence (Blogs, Logs, Users) |
| **Validation** | Zod | Runtime Schema Validation for API inputs |
| **Auth** | JWT + BcryptJS | Secure Admin Access |
| **Blog Editor** | Tiptap | Headless Rich Text Editor for blogging |
| **Uploads** | Multer + Cloudinary | Image hosting for blog posts |
| **i18n** | `i18n` node package | Multi-language support infrastructure |

---

## 📡 3. API Directory

### 🔐 Authentication (`/api/auth`)
- `POST /signup`: Create new admin (guarded in production).
- `POST /login`: Generate JWT token.
- `GET /me`: Verify token and return current admin details.

### ✍️ Content Management (`/api/blogs`)
- `GET /`: List all published blogs.
- `GET /:slug`: Fetch blog by URL slug.
- `POST /`: Create blog (Requires **Admin**).
- `PUT /:id`: Update blog (Requires **Admin**).
- `DELETE /:id`: Remove blog (Requires **Admin**).

### 🧮 Calculator Engine (`/api/calculators`)
- `POST /:calculatorId`: **The Core Endpoint**. 
  - Validates input using a Zod schema specific to the `calculatorId`.
  - Executes calculation logic from `backend/calculations/`.
  - Logs the event to `CalculatorLog` model.

### 🖼️ Miscellaneous
- `POST /api/upload/image`: Uploads to Cloudinary; returns URL.
- `POST /api/adblock/log`: Logs adblock detection events (used for analytics).
- `GET /api/health`: Health check (DB connection status + Service status).
- `GET /sitemap.xml`: **Dynamic Sitemap**. Iterates through 40+ calculator slugs and all blog posts in MongoDB.

---

## 🧮 4. Calculation Logic (The "Brain")
All financial logic is decoupled into `backend/calculations/`. 
- **Registry:** `backend/calculations/index.ts` maps slugs (e.g., `mortgage`) to logic modules.
- **Sample Modules:** `amortization.ts`, `aprLogic.ts`, `compoundInterest.ts`, `investment.ts`, etc.
- **Workflow:**
  1. Frontend sends raw inputs (e.g., `interestRate: 5`).
  2. Backend looks up the module in `calculatorRegistry`.
  3. Module runs the math and returns a JSON object.
  4. Result is returned to the client and logged for analytics.

---

## 🛡️ 5. Key Workflows & "Minute Details"

### 🗺️ Dynamic Sitemap Generation
The sitemap is **not a static file**. It is generated on-the-fly via `backend/routes/sitemap.routes.ts`.
- It combines:
  - Static pages (Home, Tools, Blogs).
  - Hardcoded slugs for the 40+ calculators.
  - Dynamic slugs for every published blog in the DB.
- **Importance:** Essential for SEO as it ensures search engines find new blogs instantly.

### 🛡️ AdBlock Detection (Bait Heuristics)
- **Frontend:** Attempts to load a script called `/ads-bait-*.js`.
- **Mechanism:** AdBlockers prevent this specific script from loading.
- **Action:** If blocked, the frontend reports this via `/api/adblock/log` so the business can track the percentage of users using adblockers.

### 📅 The Phusion Passenger Startup
In production (MilesWeb), the app starts via `app.js` at the root:
```javascript
// app.js (Snippet)
require('./dist/backend/server.js');
```
This is because MilesWeb requires a single file entry point in the root directory.

---

## 🧪 6. Testing Framework
- **Tools:** Jest + Supertest (API Testing) + `mongodb-memory-server` (Mock DB).
- **Locations:** `frontend/src/tests/`.
- **Current Coverage:** Focuses on AdBlock detection and basic API health.
- **Future Need:** Expand tests for the `backend/calculations/` directory to ensure math parity during updates.

---

## 🚢 7. Deployment Lifecycle (Local → Prod)

1.  **Build Phase:**
    - `npm run build`: Compiles React to `dist/`.
    - `npm run backend:build`: Compiles TS to JS in `dist/backend/`.
2.  **Upload Phase:**
    - Zip `dist/`, `backend/public/`, `app.js`, `package.json`, and `.env`.
    - Upload to MilesWeb via File Manager.
3.  **Activation Phase:**
    - In cPanel Node.js Selector, set **Application Mode** to `Production`.
    - Click **"Run NPM Install"**.
    - **CRITICAL:** Click **"RESTART"** after any file change to flush the Passenger cache.

---

## 📋 8. Environment Variables (`.env`)
| Key | Purpose |
| :--- | :--- |
| `MONGODB_URI` | Access to Atlas (Must whitelist `0.0.0.0/0` for MilesWeb compatibility). |
| `SITE_URL` | Used for absolute URLs in the dynamic Sitemap. |
| `CLOUDINARY_*` | API keys for image hosting. |
| `JWT_SECRET` | Secret key for signing admin session tokens. |

---

## 📁 9. Key Directory Map
- `/backend/calculations/`: Core math logic (TS files).
- `/backend/models/`: Mongoose schemas.
- `/backend/routes/`: API endpoint definitions.
- `/src/pages/calculators/`: Frontend UI for each calculator.
- `/src/config/calculatorConfig.ts`: Master list of calculator titles, categories, and IDs.
- `/dist/`: Compiled production output.
