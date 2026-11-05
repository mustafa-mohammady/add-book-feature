import { initialBooks } from "./data";
import type { Book, Genre, GenreFilter } from "./types";

export const STORAGE_KEY = "bookshelf:books";

const GENRES: readonly Genre[] = ["fantasy", "sci-fi", "mystery", "non-fiction"];

/** What the reader enters in the "Add a book" form. */
export type BookDraft = {
  title: string;
  author: string;
  genre: Genre;
  rating: number;
};

type Filter = {
  genre: GenreFilter;
  query: string;
};

export function filterBooks(books: Book[], { genre, query }: Filter): Book[] {
  const normalizedQuery = query.trim().toLowerCase();
  return books.filter(
    (book) =>
      (genre === "all" || book.genre === genre) &&
      book.title.toLowerCase().includes(normalizedQuery)
  );
}

export function toggleRead(books: Book[], id: string): Book[] {
  return books.map((book) =>
    book.id === id ? { ...book, isRead: !book.isRead } : book
  );
}

export function removeBook(books: Book[], id: string): Book[] {
  return books.filter((book) => book.id !== id);
}

export function countRead(books: Book[]): number {
  return books.filter((book) => book.isRead).length;
}

/** Average of all rated books, rounded to one decimal. `null` if no book is rated. */
export function averageRating(books: Book[]): number | null {
  const rated = books.filter((book) => book.rating > 0);
  if (rated.length === 0) {
    return null;
  }
  const sum = rated.reduce((total, book) => total + book.rating, 0);
  return Math.round((sum / rated.length) * 10) / 10;
}

/**
 * Adds a new, unread book at the top of the list.
 * Returns an error message instead if the draft is invalid or already on the shelf.
 */
export function addBook(
  books: Book[],
  draft: BookDraft,
  id: string
): { books: Book[] } | { error: string } {
  const title = draft.title.trim();
  const author = draft.author.trim();
  if (title === "") {
    return { error: "Title is required." };
  }
  if (author === "") {
    return { error: "Author is required." };
  }
  const isDuplicate = books.some(
    (book) =>
      book.title.toLowerCase() === title.toLowerCase() &&
      book.author.toLowerCase() === author.toLowerCase()
  );
  if (isDuplicate) {
    return { error: "This book is already on your shelf." };
  }
  const book: Book = {
    id,
    title,
    author,
    genre: draft.genre,
    rating: draft.rating,
    isRead: false,
  };
  return { books: [book, ...books] };
}

function isBook(value: unknown): value is Book {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const book = value as Record<string, unknown>;
  return (
    typeof book.id === "string" &&
    typeof book.title === "string" &&
    typeof book.author === "string" &&
    GENRES.includes(book.genre as Genre) &&
    Number.isInteger(book.rating) &&
    (book.rating as number) >= 0 &&
    (book.rating as number) <= 5 &&
    typeof book.isRead === "boolean"
  );
}

/** Parses saved books. Returns `null` if nothing is saved or the data is not a valid list of books. */
export function parseStoredBooks(raw: string | null): Book[] | null {
  if (raw === null) {
    return null;
  }
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  return Array.isArray(data) && data.every(isBook) ? data : null;
}

/** Loads the saved books, or the sample books if nothing valid is saved. */
export function loadBooks(): Book[] {
  try {
    return parseStoredBooks(localStorage.getItem(STORAGE_KEY)) ?? initialBooks;
  } catch {
    // localStorage can be unavailable, e.g. when site data is blocked.
    return initialBooks;
  }
}

export function saveBooks(books: Book[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  } catch {
    // Saving is best effort; the app keeps working without it.
  }
}
