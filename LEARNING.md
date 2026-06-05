# Learning guide — where each concept lives

This project is intentionally organised so you can open one file and learn one
idea. Below is a map from **concept → file(s)** with a one-line summary. Read
them in this order.

## 1. MySQL + Prisma (the database layer)

| Concept | File | What to look at |
| --- | --- | --- |
| Defining tables & relations | [prisma/schema.prisma](prisma/schema.prisma) | `model User/Post/Comment/Category`, the `@relation` links, enums |
| One shared DB connection | [src/lib/prisma.js](src/lib/prisma.js) | why we cache the PrismaClient in dev |
| Seeding sample data | [prisma/seed.js](prisma/seed.js) | `upsert`, hashing passwords, creating relations |
| Filtering / sorting / paginating in SQL | [src/pages/api/posts/index.js](src/pages/api/posts/index.js) | the heavily-commented `listPosts` — `where`, `orderBy`, `take`, `skip`, `count` |

**Mental model:** Prisma turns JavaScript objects into SQL. `where` = SQL
`WHERE`, `take`/`skip` = `LIMIT`/`OFFSET`, `include` = `JOIN`.

## 2. Next.js (the framework — frontend + backend in one)

| Concept | File | What to look at |
| --- | --- | --- |
| API routes (the backend) | [src/pages/api/](src/pages/api/) | every file here is a server endpoint; the function name `handler` runs on the server only |
| Dynamic routes | [src/pages/posts/[slug].js](src/pages/posts/[slug].js), [src/pages/api/posts/[id].js](src/pages/api/posts/[id].js) | `[slug]` / `[id]` become `req.query.slug` etc. |
| App wrapper & global providers | [src/pages/_app.js](src/pages/_app.js) | Redux `<Provider>`, Toaster, loading the font |
| Per-page layouts | [src/components/admin/AdminLayout.js](src/components/admin/AdminLayout.js) | the `Page.getLayout = ...` pattern |
| Linking & navigation | [src/components/Navbar.js](src/components/Navbar.js) | `next/link`, `useRouter` |

**Mental model:** anything under `pages/api` is your server (Node + database).
Everything else is your React frontend. They live in the same project.

## 3. React (the UI)

| Concept | File | What to look at |
| --- | --- | --- |
| Component state | [src/pages/admin/posts/index.js](src/pages/admin/posts/index.js) | `useState` for search, status, pagination |
| Side effects + cleanup | same file | the `useEffect` that debounces the search box |
| Memoising values | same file | `useMemo` for the table columns |
| Conditional rendering | [src/pages/posts/[slug].js](src/pages/posts/[slug].js) | loading / error / empty states |
| Reusable components | [src/components/](src/components/) | `PostCard`, `ConfirmDialog`, `Avatar`, `DataTable` |

## 4. Redux Toolkit + RTK Query (state management)

| Concept | File | What to look at |
| --- | --- | --- |
| The store | [src/store/store.js](src/store/store.js) | combining slices + RTK Query |
| A normal slice | [src/store/slices/authSlice.js](src/store/slices/authSlice.js) | `createSlice`, reducers, selectors, `extraReducers` |
| UI slice | [src/store/slices/uiSlice.js](src/store/slices/uiSlice.js) | the smallest possible slice |
| Server data with RTK Query | [src/store/services/api.js](src/store/services/api.js) | `createApi`, `query` vs `mutation`, `providesTags`/`invalidatesTags` (auto cache refresh) |
| Reading state in components | [src/components/Navbar.js](src/components/Navbar.js) | `useSelector(selectUser)` |
| Calling the API from a component | [src/pages/login.js](src/pages/login.js) | `useLoginMutation()` + `.unwrap()` |

**Mental model:** `useState` = state for ONE component. Redux = state MANY
components share (the logged-in user). RTK Query = a smart cache for data that
lives on the server (posts, users) so you never write `fetch` + loading flags
by hand.

## 5. Authentication & authorization

| Concept | File | What to look at |
| --- | --- | --- |
| Hashing passwords | [src/lib/auth.js](src/lib/auth.js) | `bcrypt` hash/verify |
| Signing a JWT into a cookie | [src/lib/auth.js](src/lib/auth.js) | `signToken`, `authCookie` (httpOnly) |
| Protecting an API route | [src/pages/api/users/index.js](src/pages/api/users/index.js) | `requireAuth(handler, ['ADMIN'])` |
| Protecting a page in the browser | [src/components/useRequireAuth.js](src/components/useRequireAuth.js) | redirect if not an admin |

**Why two checks?** The browser guard is for UX (don't flash the admin page).
The server guard in `requireAuth` is the REAL security — it runs on the server
and can't be bypassed by editing client code.

## 6. The server-side table (your latest request)

This is the best example of all the layers working together:

1. **UI state** lives in [src/pages/admin/posts/index.js](src/pages/admin/posts/index.js) (`pagination`, `sorting`, search).
2. Those become **query params** sent by **RTK Query** in [src/store/services/api.js](src/store/services/api.js).
3. The **API route** [src/pages/api/posts/index.js](src/pages/api/posts/index.js) turns them into a **Prisma/MySQL** query (only one page of rows comes back).
4. **TanStack Table** in [src/components/admin/DataTable.js](src/components/admin/DataTable.js) renders that page in "manual" (server-side) mode.

Read those four files top-to-bottom and you'll see a request flow all the way
from a click in the browser to a SQL query and back.
