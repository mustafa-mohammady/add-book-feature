# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

Bookshelf: a small React 19 + TypeScript (strict) app built with Vite 5. Tests use Vitest 2 (jsdom) with React Testing Library, `user-event` and `jest-dom` matchers. Node.js 22.22 or newer is required. There is no backend, router, state library or linter.

## Commands

- `npm run test:run`: run all tests once. **Never use `npm test` / `npm run test`**: it starts watch mode and never finishes.
- `npx vitest run src/books.test.ts`: run a single test file (add `-t "<test name>"` to run a single test).
- `npm run check`: type check (`tsc --noEmit`).
- `npm run dev`: dev server on port 3000 (opens the browser).
- `npm run build`: production build.

Before reporting work as done, run `npm run check` and `npm run test:run`.

## Architecture

- `src/App.tsx` owns all state (`books`, `genre`, `query`) in `useState` and passes data and callbacks down. Components are presentational: they get data via props and report events through `on…` callbacks (e.g. `BookList` turns `onRemove(id)` into a no-argument `onRemove` for each `BookCard`).
- `src/books.ts` holds all non-UI logic as pure functions (`filterBooks`, `toggleRead`, `removeBook`, `countRead`, `averageRating`). `App` calls them and passes the result to `setBooks`.
- `src/types.ts` defines `Book`, `Genre` (`"fantasy" | "sci-fi" | "mystery" | "non-fiction"`) and `GenreFilter`. `rating` is 0 for "not rated", otherwise 1 to 5.
- `src/data.ts` exports `initialBooks`, the five sample books. Existing tests assert on exact titles, ids and counts from it.

## Conventions

- **Components** live in `src/components/<Name>/index.tsx` with a default export, a local `type <Name>Props` for the props, and the test in `src/components/<Name>/<Name>.test.tsx` next to it.
- **Logic that is not UI** goes in `src/books.ts` and is tested in `src/books.test.ts`.
- **State is never changed in place.** Functions return new arrays/objects (`map`, `filter`, spread), never `push`, `splice` or mutation of a book.
- Vitest globals are off: import `describe`, `test`, `expect` from `"vitest"` explicitly. `src/setupTests.ts` registers `jest-dom` and runs `cleanup()` after each test.
- Tests query by accessible role and label (`getByRole`, `getByLabelText`), so buttons and inputs need accessible names (e.g. `Remove ${book.title}`).

## Off limits

- Do not add dependencies without asking first.
- Do not edit or delete `src/data.ts`.
- Never change a test to make it pass, unless the requirement changed.
