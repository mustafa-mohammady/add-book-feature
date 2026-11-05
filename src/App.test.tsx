import { describe, expect, test } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

describe("App", () => {
  test("renders all books", () => {
    render(<App />);
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(5);
  });

  test("shows only the books of the selected genre", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText("Genre"), "sci-fi");
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(2);
  });

  test("marks a book as read", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(
      screen.getByRole("button", { name: "Mark Gone Girl as read" })
    );
    expect(
      screen.getByRole("button", { name: "Mark Gone Girl as unread" })
    ).toBeInTheDocument();
    expect(screen.getByText(/3 of 5 read/)).toBeInTheDocument();
  });

  test("removes the right book while a genre filter is active", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText("Genre"), "sci-fi");
    await user.click(
      screen.getByRole("button", { name: "Remove Neuromancer" })
    );
    await user.selectOptions(screen.getByLabelText("Genre"), "all");
    const titles = screen
      .getAllByRole("heading", { level: 3 })
      .map((h) => h.textContent);
    expect(titles).toEqual(["Dune", "The Hobbit", "Gone Girl", "Sapiens"]);
  });

  test("shows 'Average rating: 4' for the sample books", () => {
    render(<App />);
    const stats = screen.getByText(/Average rating/);
    expect(within(stats).queryByText("NaN")).toBeNull();
    expect(stats).toHaveTextContent("Average rating: 4");
  });
});

describe("App: adding books", () => {
  async function addBook(title: string, author: string) {
    const user = userEvent.setup();
    if (title) await user.type(screen.getByLabelText("Title"), title);
    if (author) await user.type(screen.getByLabelText("Author"), author);
    await user.click(screen.getByRole("button", { name: "Add book" }));
  }

  function titles() {
    return screen
      .getAllByRole("heading", { level: 3 })
      .map((heading) => heading.textContent);
  }

  test("adds a new unread book at the top and counts it", async () => {
    render(<App />);
    await addBook("  Emma ", " Jane Austen ");
    expect(titles()).toEqual([
      "Emma",
      "Dune",
      "The Hobbit",
      "Gone Girl",
      "Neuromancer",
      "Sapiens",
    ]);
    expect(
      screen.getByRole("button", { name: "Mark Emma as read" })
    ).toBeInTheDocument();
    expect(screen.getByText(/2 of 6 read/)).toBeInTheDocument();
    expect(screen.getByLabelText("Title")).toHaveValue("");
  });

  test("shows an alert and adds nothing when the title is missing", async () => {
    render(<App />);
    await addBook("", "Jane Austen");
    expect(screen.getByRole("alert")).toHaveTextContent("Title is required.");
    expect(titles()).toHaveLength(5);
  });

  test("shows an alert and adds nothing when the author is missing", async () => {
    render(<App />);
    await addBook("Emma", "   ");
    expect(screen.getByRole("alert")).toHaveTextContent("Author is required.");
    expect(titles()).toHaveLength(5);
  });

  test("rejects a book that is already on the shelf", async () => {
    render(<App />);
    await addBook("dune", "frank herbert");
    expect(screen.getByRole("alert")).toHaveTextContent(
      "This book is already on your shelf."
    );
    expect(titles()).toHaveLength(5);
  });
});

describe("App: saving books", () => {
  test("keeps an added book after a reload", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);
    await user.type(screen.getByLabelText("Title"), "Emma");
    await user.type(screen.getByLabelText("Author"), "Jane Austen");
    await user.click(screen.getByRole("button", { name: "Add book" }));
    unmount();

    render(<App />);
    expect(screen.getByRole("heading", { name: "Emma" })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(6);
  });

  test("saves the books under the key bookshelf:books", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Remove Dune" }));
    const saved = JSON.parse(localStorage.getItem("bookshelf:books") ?? "null");
    expect(saved).toHaveLength(4);
  });

  test("shows the sample books when the saved data is not valid", () => {
    localStorage.setItem("bookshelf:books", "{not json");
    render(<App />);
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(5);
  });

  test("shows an empty shelf when an empty list was saved", () => {
    localStorage.setItem("bookshelf:books", "[]");
    render(<App />);
    expect(screen.getByText("No books found.")).toBeInTheDocument();
  });
});
