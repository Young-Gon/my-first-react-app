# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Vite, port 5173)
npm run build     # Type-check then build for production (tsc -b && vite build)
npm run lint      # Run ESLint
npm run preview   # Preview production build locally
npm run test      # Run tests with Vitest
npm run test:ui   # Run tests with Vitest UI
```

### Running the JSON Server (required for the app to work)

The app fetches todos from a local REST API backed by `server/db.json`:

```bash
npx json-server server/db.json   # Starts on http://localhost:3000
```

The API base URL is hardcoded in `src/api/todosApi.ts` (`fetchBaseQuery({ baseUrl: 'http://localhost:3000' })`).

### Running a single test file

```bash
npx vitest run src/path/to/file.test.ts
```

## Architecture

This is a Todo app built with React 19 + TypeScript + Vite, following an **MVI (Model–View–Intent)** pattern backed by Redux Toolkit + RTK Query.

### MVI layers

- **Model** — Redux store (`src/store/store.ts`) + `AppState` in `src/model/appSlice.ts`
- **View** — React components (`src/components/`, `src/App.tsx`) that read from the store via `useSelector` or RTK Query hooks
- **Intent** — `useIntent()` hook in `src/model/appSlice.ts` that maps user events to dispatch calls or RTK Query mutation triggers

### State

The Redux slice (`src/model/appSlice.ts`) holds only UI-local state:

```ts
interface AppState {
    filter: Filter;   // 'all' | 'active' | 'completed'
}
```

`todos`, `loading`, and `error` are **not** in the Redux slice — they live in the RTK Query cache (`todosApi` reducer at key `todosApi`).

### API layer (`src/api/todosApi.ts`)

RTK Query `createApi` definition. All CRUD endpoints are declared here:
- `getTodos` query — provides `['Todo']` tag; auto-fetched on mount
- `addTodo`, `deleteTodo`, `editTodo`, `toggleTodo`, `toggleTodoAll`, `deleteCompletedTodos` mutations — all invalidate `['Todo']` tag to trigger refetch

Batch mutations (`toggleTodoAll`, `deleteCompletedTodos`) use `queryFn` to issue parallel `PATCH`/`DELETE` requests. `toggleTodo` also uses `queryFn` to read the current `completed` value from the RTK Query cache before flipping it.

### Suspense integration (`src/api/useSuspenseTodosQuery.ts`)

RTK Query 2.x has no built-in Suspense support. This adapter wraps `useGetTodosQuery`:
- `isLoading` (no cache) → `use(loadingPromise)` to trigger `<Suspense>`
- `isError` (no cache) → `throw new Error(...)` to trigger `<ErrorBoundary>`
- Cache present → returns `{ todos, isFetching, isError, error }` for inline status display

### Data flow

```
User event → useIntent() → dispatch(changeFilter) | mutation trigger
                                                          ↓
                                                   RTK Query invalidates ['Todo']
                                                          ↓
                                                   getTodos refetches → cache updates → components re-render
```

### Component tree

```
App  (calls useGetTodosQuery() outside Suspense boundary to kick off API fetch)
└── ErrorBoundary → FullScreenError (on initial load error)
    └── Suspense   → FullScreenLoading (on initial load)
        └── Layout
            ├── Title
            ├── Controls  (add todo, change filter)
            └── TodoList  (uses useSuspenseTodosQuery; toggle all, delete completed)
                └── TodoItem (toggle, edit, delete per item)
```

`App` calls `useGetTodosQuery()` outside the `<Suspense>` boundary intentionally — if the first call were inside, `suspend` would prevent the `useEffect` from committing, causing an infinite loading loop.

### Data models (`src/model/`)

- `Todo.ts` — `{ id: number, text: string, completed: boolean }`
- `Filter.ts` — `Filter.ALL | Filter.ACTIVE | Filter.COMPLETED`

### Build tooling

Vite with `@vitejs/plugin-react` and `babel-plugin-react-compiler` (React Compiler enabled via `@rolldown/plugin-babel`). Tests run with Vitest + jsdom.
