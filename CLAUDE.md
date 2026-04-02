# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Vite)
npm run build     # Type-check then build for production (tsc -b && vite build)
npm run lint      # Run ESLint
npm run preview   # Preview production build locally
```

## Architecture

This is a Todo app built with React 19 + TypeScript + Vite. All state lives in `App.tsx` — there is no external state management.

**Data models** (`src/model/`):
- `Todo.ts` — `{ id: number, text: string, completed: boolean }`
- `Filter.ts` — const object enum: `'all' | 'active' | 'completed'`

**Component tree:**
```
App (owns all state + handlers)
└── Layout
    ├── Title
    ├── Controls  (add todo, change filter)
    └── TodoList  (renders filtered list)
        └── TodoItem (toggle, edit, delete per item)
```

`App.tsx` filters the todo list before passing it to `TodoList`, so child components only see the filtered subset.

**Build tooling:** Vite with `@vitejs/plugin-react` and `babel-plugin-react-compiler` (React Compiler enabled via Babel preset in `vite.config.ts`).
