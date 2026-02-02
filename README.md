# Madrasa Admin UI (Mocked Frontend)

یہ ایک React (Vite) based Admin Panel skeleton ہے — Firebase کے بغیر۔ backend کے بجائے ایک mock service (localStorage) استعمال کیا گیا ہے تاکہ آپ جلدی frontend چلا کر UI کا flow دیکھ سکیں۔

Quick Start:
1. Node.js اور npm انسٹال کریں
2. فولڈر میں:
   - `npm install`
   - `npm run dev`
3. براؤزر میں کھول��ں: `http://localhost:5173`

Project structure (اہم):
- src/
  - main.jsx
  - App.jsx
  - services/mockService.js   (mock backend)
  - components/Sidebar.jsx
  - components/Topbar.jsx
  - pages/... (Dashboard, Students, Teachers, Attendance, ...)

Notes:
- تمام لیبلز اردو میں ہیں (جہاں مناسب)
- mockService کے methods future میں Firebase service کے ساتھ آسانی سے replace کیے جا سکتے ہیں
- مزید صفحات یا fields شامل کرنے کے لیے pages فولڈر میں نئے components بنائیں

Implemented features (as of Feb 3, 2026):
- Dashboard: Metric cards, recent students list, quick actions
- Students: List with search, filters, server-side pagination, CSV export, edit & delete
- Add/Edit Student: Reusable `StudentForm` with validation hints
- Attendance: Daily marking, bulk present/absent, toast confirmation, **Monthly Reports** with CSV export and printable PDF view
- Toast system for user feedback
- Authentication (Login / Register) with mock users — Admin role enabled
- Password hashing (SHA-256 via Web Crypto), password reset (mock tokens)
- Admin Users & Roles management page
- Google Sign-In (client-side) — configure Client ID in Settings to enable
- Low-fi and Hi-fi wireframes in `assets/wireframes/`

Next steps: wireframes refinement, Students list advanced filters (server-side), Attendance reports charts and PDF generator (optional jsPDF)

Server integration (Express) — quick guide:
- A small Express auth server has been scaffolded in `server/` with endpoints:
  - `POST /api/auth/register`  {email,password,name}
  - `POST /api/auth/login`     {email,password}
  - `POST /api/auth/google`    {idToken}
  - `POST /api/auth/request-password-reset` {email} -> returns `{ ok: true, preview }` where `preview` is an Ethereal message URL in dev
  - `POST /api/auth/reset-password` {token,password}
- Run it:
  - cd server
  - npm install
  - copy `.env.example` to `.env` and set `JWT_SECRET` and optionally `GOOGLE_CLIENT_ID` and SMTP settings
  - npm run dev
- To make the frontend use the server: create a `.env` in project root with `VITE_API_URL=http://localhost:4000` (Vite uses `VITE_` prefix)

Notes:
- Disk-space warning occurred during install (ENOSPC) so the server uses a lightweight JSON file store (`server/data.json`) instead of SQLite for now (no added native deps required).
- The server will send password reset messages via Ethereal by default and return a `preview` link in the API response.


اللہ آپ کے کام میں برکت دے 🤲