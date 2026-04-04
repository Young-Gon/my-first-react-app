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

The API base URL is configured in `src/api/index.ts` (axios instance pointing to `http://localhost:3000`).

### Running a single test file

```bash
npx vitest run src/path/to/file.test.ts
```

## Architecture

This is a Todo app built with React 19 + TypeScript + Vite, following an **MVI (Model–View–Intent)** pattern backed by Redux Toolkit.

### MVI layers

- **Model** — Redux store (`src/store/store.ts`) + `AppState` in `src/model/appSlice.ts`
- **View** — React components (`src/components/`, `src/App.tsx`) that read from the store via `useSelector`
- **Intent** — `useIntent()` hook in `src/model/appSlice.ts` that maps user events to `dispatch()` calls

### State

All state lives in a single Redux slice (`src/model/appSlice.ts`):

```ts
interface AppState {
    todos: Todo[];
    filter: Filter;   // 'all' | 'active' | 'completed'
    loading: boolean;
    error: string | null;
}
```

The only synchronous action is `changeFilter`. All CRUD operations are async thunks defined in `src/api/fetchTodos.ts`, which call the json-server REST API via axios.

### Data flow

```
User event → useIntent() → dispatch(asyncThunk) → API call → extraReducers update state → components re-render
```

### Component tree

```
App (fetches todos on mount via useIntent)
└── Layout
    ├── Title
    ├── Controls  (add todo, change filter)
    └── TodoList  (renders filtered list, toggle all, delete completed)
        └── TodoItem (toggle, edit, delete per item)
```

Filtering is done in the selector inside `TodoList`/`Controls` (not pre-filtered in `App`).

### Data models (`src/model/`)

- `Todo.ts` — `{ id: number, text: string, completed: boolean }`
- `Filter.ts` — `Filter.ALL | Filter.ACTIVE | Filter.COMPLETED`

### Build tooling

Vite with `@vitejs/plugin-react` and `babel-plugin-react-compiler` (React Compiler enabled via `@rolldown/plugin-babel` in `vite.config.ts`). Tests run with Vitest + jsdom.
