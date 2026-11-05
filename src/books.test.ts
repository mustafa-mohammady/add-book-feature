import { describe, expect, test } from "vitest";
import {
  addBook,
  averageRating,
  countRead,
  filterBooks,
  parseStoredBooks,
  removeBook,
  toggleRead,
  type BookDraft,
} from "./books";
import { initialBooks } from "./data";

const draft: BookDraft = {
  title: "The Name of the Wind",
  author: "Patrick Rothfuss",
  genre: "fantasy",
  rating: 4,
};

describe("filterBooks", () => {
  test("filters by genre", () => {
    const result = filterBooks(initialBooks, { genre: "sci-fi", query: "" });
    expect(result.map((book) => book.title)).toEqual(["Dune", "Neuromancer"]);
  });

  test("returns all books for the genre 'all'", () => {
    expect(filterBooks(initialBooks, { genre: "all", query: "" })).toHaveLength(
      5
    );
  });

  test("finds a title regardless of upper and lower case", () => {
    const result = filterBooks(initialBooks, { genre: "all", query: "dune" });
    expect(result.map((book) => book.title)).toEqual(["Dune"]);
  });

  test("ignores spaces around the search text", () => {
    const result = filterBooks(initialBooks, { genre: "all", query: " Dune " });
    expect(result).toHaveLength(1);
  });
});

describe("toggleRead", () => {
  test("toggles the read status of one book", () => {
    const result = toggleRead(structuredClone(initialBooks), "b3");
    expect(result.find((book) => book.id === "b3")?.isRead).toBe(true);
    expect(result.find((book) => book.id === "b1")?.isRead).toBe(true);
  });

  test("does not change the original list", () => {
    const books = structuredClone(initialBooks);
    const result = toggleRead(books, "b3");
    expect(books.find((book) => book.id === "b3")?.isRead).toBe(false);
    expect(result).not.toBe(books);
  });
});

describe("removeBook", () => {
  test("removes the book with the given id", () => {
    const result = removeBook(initialBooks, "b2");
    expect(result.map((book) => book.id)).toEqual(["b1", "b3", "b4", "b5"]);
  });
});

describe("countRead", () => {
  test("counts the read books", () => {
    expect(countRead(initialBooks)).toBe(2);
  });
});

describe("averageRating", () => {
  test("averages only the rated books", () => {
    expect(averageRating(initialBooks)).toBe(4);
  });

  test("returns null when no book is rated", () => {
    expect(averageRating([initialBooks[2], initialBooks[4]])).toBeNull();
  });

  test("returns null for an empty list", () => {
    expect(averageRating([])).toBeNull();
  });
});

describe("addBook", () => {
  test("adds an unread book at the top of the list", () => {
    const result = addBook(initialBooks, draft, "new-1");
    if (!("books" in result)) throw new Error(result.error);
    expect(result.books).toHaveLength(6);
    expect(result.books[0]).toEqual({ id: "new-1", ...draft, isRead: false });
    expect(result.books.slice(1)).toEqual(initialBooks);
  });

  test("removes spaces at the start and end of title and author", () => {
    const result = addBook(
      initialBooks,
      { ...draft, title: "  Emma  ", author: " Jane Austen " },
      "new-1"
    );
    if (!("books" in result)) throw new Error(result.error);
    expect(result.books[0].title).toBe("Emma");
    expect(result.books[0].author).toBe("Jane Austen");
  });

  test("does not change the original list", () => {
    const books = structuredClone(initialBooks);
    addBook(books, draft, "new-1");
    expect(books).toEqual(initialBooks);
  });

  test("requires a title", () => {
    expect(addBook(initialBooks, { ...draft, title: "   " }, "new-1")).toEqual({
      error: "Title is required.",
    });
  });

  test("requires an author", () => {
    expect(addBook(initialBooks, { ...draft, author: "" }, "new-1")).toEqual({
      error: "Author is required.",
    });
  });

  test("rejects a book with the same title and author, ignoring case and spaces", () => {
    const result = addBook(
      initialBooks,
      { ...draft, title: " dune ", author: "FRANK HERBERT" },
      "new-1"
    );
    expect(result).toEqual({ error: "This book is already on your shelf." });
  });

  test("accepts the same title by another author", () => {
    const result = addBook(
      initialBooks,
      { ...draft, title: "Dune", author: "Someone Else" },
      "new-1"
    );
    expect("books" in result && result.books).toHaveLength(6);
  });
});

describe("parseStoredBooks", () => {
  test("returns null when nothing is saved", () => {
    expect(parseStoredBooks(null)).toBeNull();
  });

  test("returns null for invalid JSON", () => {
    expect(parseStoredBooks("{not json")).toBeNull();
  });

  test("returns null when the data is not a list", () => {
    expect(parseStoredBooks(JSON.stringify({ books: initialBooks }))).toBeNull();
  });

  test.each([
    ["an unknown genre", { genre: "romance" }],
    ["a rating above 5", { rating: 6 }],
    ["a rating that is not a whole number", { rating: 2.5 }],
    ["a non-boolean isRead", { isRead: "yes" }],
    ["a missing title", { title: undefined }],
  ])("returns null for a book with %s", (_name, change) => {
    const books = [{ ...initialBooks[0], ...change }];
    expect(parseStoredBooks(JSON.stringify(books))).toBeNull();
  });

  test("returns the saved books when they are valid", () => {
    expect(parseStoredBooks(JSON.stringify(initialBooks))).toEqual(initialBooks);
  });

  test("accepts an empty list", () => {
    expect(parseStoredBooks("[]")).toEqual([]);
  });
});
