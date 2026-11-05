---
name: new-component
description: Create a new React component that follows the project conventions (own folder, default export, local props type, test next to it). Use when the user asks for a new component, e.g. "/new-component EmptyShelf shows a message when no book matches".
argument-hint: <ComponentName> <purpose>
---

Create a new component from these arguments: **$ARGUMENTS**

## 1. Read the arguments

- The **first word** of the arguments is the component name. The **rest** is its purpose.
  Example: `EmptyShelf shows a message when no book matches` gives the name `EmptyShelf` and the purpose "shows a message when no book matches".
- The name must be PascalCase (`EmptyShelf`, not `emptyShelf` or `empty-shelf`). If it isn't, or there is no purpose, stop and ask the user.
- If `src/components/<Name>/` already exists, stop and tell the user. Never overwrite an existing component.

## 2. Look at the existing code first

Read `src/types.ts` and one or two components in `src/components/` (e.g. `BookList`, `Stats`) so the new component matches their style. Reuse the types (`Book`, `Genre`, …) and the functions in `src/books.ts` instead of writing new ones.

## 3. Write the test first

Create `src/components/<Name>/<Name>.test.tsx`:

- Import `describe`, `test`, `expect` (and `vi` if needed) from `"vitest"` explicitly. Globals are off.
- Import the component with `import <Name> from ".";`.
- Query by accessible role and label (`getByRole`, `getByLabelText`, `getByText` for plain text). Do not use test ids or CSS classes.
- Test the behaviour described by the purpose: what is rendered for the given props, and which `on…` callback is called on user events (`userEvent.setup()`).

Run `npx vitest run src/components/<Name>` and confirm the test **fails because the component is missing**.

## 4. Write the component

Create `src/components/<Name>/index.tsx`:

```tsx
type <Name>Props = {
  // data the component needs, and on… callbacks for events
};

export default function <Name>({ /* props */ }: <Name>Props) {
  return (/* JSX */);
}
```

Rules:
- A local `type <Name>Props` for the props (leave it out only if the component takes no props) and a **default export**.
- **Presentational:** the component gets its data through props and reports events through `on…` callbacks. Shared state stays in `src/App.tsx`.
- Logic that is not UI goes in `src/books.ts` as a pure function and is tested in `src/books.test.ts`.
- Never change state in place: use `map`, `filter` and spread, never `push`, `splice` or mutation.
- Buttons and inputs need accessible names (e.g. `Remove ${book.title}`, a `<label>` around every input).
- Do not add `h3` headings unless they are book titles, because the App tests count `h3` headings as books.
- No new dependencies. Do not touch `src/data.ts`.

Run the test again until it passes.

## 5. Don't wire it into the app unless asked

Do not change `App.tsx` or other components unless the user asked for it. Instead, say where the component would fit (e.g. "BookList could render `<EmptyShelf />` instead of its 'No books found.' text") and offer to wire it in.

## 6. Verify

Run `npm run check` and `npm run test:run`. Both must pass before you report back. Then list the created files and give the test results.
