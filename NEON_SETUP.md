# 🚀 Neon PostgreSQL Backend Setup for Trimora

This project is now configured with an **Express.js** backend powered by **Neon Serverless PostgreSQL** (`@neondatabase/serverless`).

---

## ⚡ Quick Start in 3 Steps

### Step 1: Get your Neon Connection String
1. Go to [Neon Console](https://console.neon.tech/) and sign in or create a free project.
2. In your Neon Project Dashboard, click **Connection Details**.
3. Select **Pooled connection** (recommended) or **Direct connection**.
4. Copy your connection string. It will look like:
   ```text
   postgresql://username:password@ep-cool-cloud-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

---

### Step 2: Configure your `.env` File
Open the [.env](file:///c:/Users/muham/Documents/chargeMOD/trimora/.env) file in the project root and replace `DATABASE_URL` with your connection string:

```env
DATABASE_URL=postgresql://your_user:your_password@ep-your-project.region.aws.neon.tech/neondb?sslmode=require
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

---

### Step 3: Initialize Database Schema & Seed Data
Run the all-in-one setup command:

```bash
npm run db:setup
```

This will:
- Connect to your Neon database over SSL.
- Create all PostgreSQL tables and indexes ([`server/db/schema.sql`](file:///c:/Users/muham/Documents/chargeMOD/trimora/server/db/schema.sql)).
- Seed the Trimora salon, default accounts, services, stylists, and sample bookings ([`server/db/seed.ts`](file:///c:/Users/muham/Documents/chargeMOD/trimora/server/db/seed.ts)).

---

## 💻 Running the Application

### Option A: Run Both Frontend & Backend Concurrently
```bash
npm run dev:all
```

### Option B: Run in Separate Terminals
- **Backend API Server**:
  ```bash
  npm run server
  ```
- **Vite Frontend**:
  ```bash
  npm run dev
  ```

---

## 📊 Database Schema Overview

The database schema is defined in [`server/db/schema.sql`](file:///c:/Users/muham/Documents/chargeMOD/trimora/server/db/schema.sql) and includes:

| Table | Description |
|---|---|
| `users` | Admin, Owner, Stylist, and Customer accounts with roles |
| `salons` | Multi-tenant salon profiles with hours and contact info |
| `salon_memberships` | Role bindings between users and salons |
| `services` | Haircuts, styling, coloring with pricing, durations, and add-ons |
| `stylists` | Staff profiles, specialties, ratings, and schedules |
| `customers` | Client directory, visit counts, spend, and notes |
| `appointments` | Bookings with participant timings, statuses, and pricing |
| `reviews` | Customer ratings, reviews, and replies |

---

## 🛡️ Built-in Resilience & Fallback

- **Zero-Downtime Fallback**: If the Neon database is not configured or offline, the frontend gracefully falls back to local data. The app will never crash.
- **In-App Health Inspector**: Visit **Settings** in the business dashboard to test your Neon database connection in real time.
- **Vite Proxy**: All frontend requests to `/api/*` are automatically forwarded to `http://localhost:5000`.
