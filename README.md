# JuJu — Full-Stack Blog with Admin Panel

A complete blogging platform with a public site and an admin dashboard, built with **Next.js (JavaScript)**, **Prisma + MySQL**, **Redux Toolkit (RTK Query)** and **Tailwind CSS**. The UI/UX is inspired by the JavaScript Mastery *Patient Management System* (dark theme, green accent, split-screen auth).

## Tech stack

| Concern              | Choice                                   |
| -------------------- | ---------------------------------------- |
| Framework            | Next.js 14 (Pages Router), plain JS      |
| Database             | MySQL (via Prisma ORM)                    |
| State management     | Redux Toolkit + RTK Query                |
| Styling              | Tailwind CSS                             |
| Auth                 | JWT in an httpOnly cookie + bcrypt        |
| Authorization        | Role-based (`USER`, `ADMIN`)             |
| Notifications        | react-hot-toast                          |
| Icons                | lucide-react                             |

## Features

**Public site**
- Hero + searchable, paginated article feed with category filters
- Single article page with reading time, view counter, and comments
- Register / login (split-screen auth UI)
- Logged-in users can comment and delete their own comments

**Admin panel** (`/admin`, ADMIN role only)
- Dashboard with live stats (posts, views, users, comments)
- Full post CRUD with draft/publish, cover image, category, and a live preview
- Category management
- User management — promote/demote roles, delete users

## Getting started

### 1. Prerequisites
- Node.js 18+
- A running MySQL server (e.g. via MySQL Workbench)

### 2. Configure the database
Edit `.env` and set `DATABASE_URL`. The password is URL-encoded (`@` → `%40`):

```
DATABASE_URL="mysql://root:96Kartik96%40@localhost:3306/blog_app"
JWT_SECRET="change-me-in-production"
```

### 3. Install, create tables, seed

```bash
npm install
npm run prisma:generate   # generate the Prisma client
npm run prisma:push       # create the `blog_app` database + tables
npm run seed              # seed admin, sample posts, categories
```

### 4. Run

```bash
npm run dev
```

Open http://localhost:3000

## Seed accounts

| Role  | Email                | Password    |
| ----- | -------------------- | ----------- |
| Admin | admin@juju.com    | `Admin@123` |
| User  | reader@juju.com   | `User@123`  |

Sign in as the admin to reach the **Admin Panel** (avatar menu → Admin Panel, or `/admin`).

## Project structure

```
prisma/
  schema.prisma        # User, Post, Comment, Category models
  seed.js              # demo data
src/
  lib/                 # prisma client, auth helpers (JWT/bcrypt/guards), formatters
  pages/
    api/               # REST API routes (auth, posts, comments, categories, users, stats)
    admin/             # admin panel pages
    index.js           # blog home
    posts/[slug].js    # single article
    login.js / register.js
  components/           # UI: Navbar, PostCard, AuthShell, admin layout/sidebar, etc.
  store/
    store.js           # Redux store
    services/api.js     # RTK Query API service (all endpoints)
    slices/            # authSlice, uiSlice
  styles/globals.css   # Tailwind + theme tokens
```

## How auth works
- On login/register the server signs a JWT and sets it as an **httpOnly** cookie (`blog_token`), so the token is never exposed to client JavaScript.
- Every API request from RTK Query sends cookies (`credentials: 'include'`).
- `requireAuth(handler, roles)` in `src/lib/auth.js` gates protected routes; admin routes pass `['ADMIN']`.
- The client hydrates `state.auth.user` once via `/api/auth/me`; the admin layout redirects non-admins.
