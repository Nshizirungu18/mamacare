# MamaCare

SDG 3: Good Health and Well-being
Problem: Many expectant mothers lack access to consistent, personalized health guidance and community support.

MamaCare’s Solution:
Tracks pregnancy progress and wellness logs (hydration, mood, symptoms).
Offers personalized health tips and reminders.
Connects users to nearby clinics via maps.

Builds emotional support through community features.
MamaCare is a full-stack maternal wellness companion that combines a secure Express/MongoDB API with a modern React/Vite frontend. Expectant parents can register, track pregnancy progress, log wellness activities, manage reminders, and discover nearby clinics with interactive mapping.

---

## Repository Layout

```
mamacare/
├── backend/             # Express + MongoDB API (JWT auth, wellness/reminder CRUD, clinics)
└── mamacare-frontend/   # React 19 + Vite client (Zustand state, Tailwind UI, Leaflet maps)
```

Both packages are standalone Node projects. Run commands inside the respective folder.

### Backend Directory Structure

```
backend/
├── config/             # Database configuration (Mongo connection helper)
├── controllers/        # Route handlers (users, wellness, reminders, clinics)
├── data/               # Seed data (e.g., clinics)
├── middleware/         # Auth guard + global error handler
├── models/             # Mongoose schemas (User, WellnessLog, Reminder, Clinic)
├── routes/             # Express routers for each domain
├── utils/              # Shared helpers (pregnancy calculations, etc.)
├── server.js           # Express entrypoint
├── seeder.js           # Data seeding script
├── package.json        # Backend dependencies and scripts
└── README.md           # API-specific documentation
```

### Frontend Directory Structure

```
mamacare-frontend/
├── public/             # Static assets served directly (e.g., vite.svg)
├── src/
│   ├── api/            # Axios instance with auth interceptor
│   ├── assets/         # React-specific static files
│   ├── components/     # Shared UI components (Navbar, PrivateRoute, cards)
│   ├── pages/          # Routed views (Dashboard, Wellness, Reminders, etc.)
│   ├── store/          # Zustand auth store
│   ├── App.jsx         # Route configuration
│   └── main.jsx        # Vite entrypoint
├── index.html          # Vite HTML shell
├── package.json        # Frontend dependencies and scripts
├── vite.config.js      # Vite configuration
└── tailwind.config.js  # Tailwind scanning setup
```

---

## Tech Stack

- **API**: Node.js, Express 5, MongoDB/Mongoose, JWT, bcrypt, express-async-handler
- **Frontend**: React 19, Vite, React Router 7, Zustand, TailwindCSS, Axios, React-Leaflet/Leaflet
- **Tooling**: ESLint flat config, Vite build pipeline, Nodemon for API dev

---

## Key Features

- **Account & Pregnancy Profile**
  - Registration/login with JWT tokens, automatic due-date calculation from LMP
  - Profile editing, pregnancy progress metrics, role-based admin guard
- **Wellness Tracking**
  - Create, edit, and delete wellness logs (mood, symptoms, hydration, notes)
  - Dashboard visualizes pregnancy progress, baby size, weekly recommendations
- **Reminders & Notifications**
  - Manage medication/appointment/custom reminders with CRUD UI
- **Clinics Explorer**
  - Public clinics API plus rich frontend explorer with maps, filters, favorites, and fallbacks
- **Safety & UX Enhancements**
  - Protected routes via `PrivateRoute`, persisted auth using Zustand + localStorage
  - Centralized Axios instance with token interceptor and robust error surfaces

---

## Prerequisites

- Node.js **18+** (manage both workspaces)
- npm **10+**
- MongoDB instance (local or Atlas URI)
- Recommended: two terminals (backend + frontend) and a `.env` file for the API

---

## Backend Setup (`backend/`)

1. Install dependencies  
   ```bash
   cd backend
   npm install
   ```

2. Create `.env`  
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/mamacare
   JWT_SECRET=super_secure_jwt_secret
   NODE_ENV=development
   ```

3. (Optional) Seed clinics data  
   ```bash
   node seeder.js
   ```

4. Start the API  
   ```bash
   npm run dev   # with nodemon
   # or npm start
   ```

The API defaults to `http://localhost:5000`.

---

## Frontend Setup (`mamacare-frontend/`)

1. Install dependencies  
   ```bash
   cd mamacare-frontend
   npm install
   ```

2. Configure API base URL  
   - By default `src/api/api.js` targets `http://localhost:5000/api`.
   - For production, update the `baseURL` or introduce a Vite env variable (e.g. `VITE_API_URL`).

3. Run the client  
   ```bash
   npm run dev
   ```

The Vite dev server prints its port (default `http://localhost:5173`). The frontend expects the backend to be running for authenticated routes.

---

## Environment Variables

| Scope    | Variable     | Description                                  |
|----------|--------------|----------------------------------------------|
| Backend  | `PORT`       | Express port (default `5000`)                |
| Backend  | `MONGO_URI`  | MongoDB connection string                    |
| Backend  | `JWT_SECRET` | Secret used to sign auth tokens              |
| Backend  | `NODE_ENV`   | `development` or `production`                |
| Frontend | `VITE_*`     | (Optional) expose custom env vars via Vite   |

> Keep `.env` files out of version control. The frontend currently reads the backend URL directly from `src/api/api.js`.

---

## Available Scripts

### Backend

| Command        | Purpose                               |
|----------------|---------------------------------------|
| `npm run dev`  | Start Express via nodemon             |
| `npm start`    | Start Express once (production mode)  |
| `npm test`     | Placeholder (prints helper message)   |

### Frontend

| Command         | Purpose                              |
|-----------------|--------------------------------------|
| `npm run dev`   | Start Vite dev server with HMR       |
| `npm run build` | Production build to `dist/`          |
| `npm run lint`  | ESLint (flat config) across the app  |
| `npm run preview` | Preview built assets               |

---

## API Overview

| Area       | Method & Path               | Description                      | Auth |
|------------|----------------------------|----------------------------------|------|
| Users      | `POST /api/users/register` | Create account, auto due-date    | No   |
|            | `POST /api/users/login`    | Login & receive JWT              | No   |
|            | `GET /api/users/profile`   | Fetch current user profile       | Yes  |
|            | `PUT /api/users/profile`   | Update profile & pregnancy data  | Yes  |
| Wellness   | `GET /api/wellness`        | List wellness logs               | Yes  |
|            | `POST /api/wellness`       | Create a log                     | Yes  |
|            | `PUT /api/wellness/:id`    | Update a log                     | Yes  |
|            | `DELETE /api/wellness/:id` | Delete a log                     | Yes  |
| Reminders  | `GET /api/reminders`       | List reminders                   | Yes  |
|            | `POST /api/reminders`      | Create reminder                  | Yes  |
|            | `PUT /api/reminders/:id`   | Update reminder                  | Yes  |
|            | `DELETE /api/reminders/:id`| Delete reminder                  | Yes  |
| Clinics    | `GET /api/clinics`         | Public clinics list              | No   |
|            | `POST /api/clinics`        | Add clinic (protect + admin)     | Yes  |

The backend `README.md` dives deeper into usage, architecture, and troubleshooting tips.

---

## Frontend Routes & UX

- `/` – Marketing splash with CTA (state-aware: shows Dashboard link when authenticated)
- `/login`, `/register` – Auth flows wired to the API
- `/dashboard` – Pregnancy overview, week slider, clinics snapshot (protected)
- `/wellness` – CRUD interface for wellness logs (protected)
- `/reminders` – Reminder management, inline editing (protected)
- `/profile` – Account settings, due-date updates, logout (protected)
- `/clinics` – Public map explorer with filters, favorites, booking helpers

All protected pages rely on `PrivateRoute`, which checks the persisted JWT token stored via Zustand.

---

## Sample Data & Seeding

- `backend/data/clinics.js` contains starter clinics used by `seeder.js`.
- Run `node seeder.js` after configuring MongoDB to bulk insert clinics.
- The frontend clinics explorer also ships with rich fallback data for Kigali so the UI works even before the database is seeded.

---

## Quality & Testing

Recent verification steps:

1. `npm run lint` (frontend) – passes
2. `npm run build` (frontend) – passes
3. `npm run test` (backend) – placeholder output

Before committing new changes, re-run the above and consider adding automated API tests.

---

## Troubleshooting

- **Mongo connection errors**: confirm `MONGO_URI`, network access, and that MongoDB is running.
- **401 responses**: ensure the frontend has the latest JWT in localStorage; the Axios interceptor reads the `token` key.
- **Leaflet map icons missing**: internet access is required for the CDN icon URLs specified in `Clinics.jsx`.
- **CORS issues**: tighten or customize the `cors()` configuration in `backend/server.js`.

---

## Further Reading

- Detailed API notes: `backend/README.md`
- Vite + React docs: https://vitejs.dev/guide/
- React Leaflet docs: https://react-leaflet.js.org/

Happy hacking!

#   m a m a c a r e  
 