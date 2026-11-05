import { describe, expect, test, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddBookForm from ".";

async function fillAndSubmit() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Title"), "Emma");
  await user.type(screen.getByLabelText("Author"), "Jane Austen");
  await user.selectOptions(screen.getByLabelText("Book genre"), "mystery");
  await user.selectOptions(screen.getByLabelText("Rating"), "3");
  await user.click(screen.getByRole("button", { name: "Add book" }));
}

describe("AddBookForm", () => {
  test("has the fields Title, Author, Book genre and Rating", () => {
    render(<AddBookForm onAdd={() => null} />);
    expect(screen.getByRole("form", { name: "Add a book" })).toBeInTheDocument();
    expect(screen.getByLabelText("Title")).toHaveValue("");
    expect(screen.getByLabelText("Author")).toHaveValue("");
    expect(
      within(screen.getByLabelText("Book genre"))
        .getAllByRole("option")
        .map((option) => option.textContent)
    ).toEqual(["Fantasy", "Sci-Fi", "Mystery", "Non-fiction"]);
    expect(screen.getByLabelText("Rating")).toHaveDisplayValue("Not rated");
  });

  test("reports the entered book to onAdd", async () => {
    const onAdd = vi.fn(() => null);
    render(<AddBookForm onAdd={onAdd} />);
    await fillAndSubmit();
    expect(onAdd).toHaveBeenCalledWith({
      title: "Emma",
      author: "Jane Austen",
      genre: "mystery",
      rating: 3,
    });
  });

  test("clears the form after the book was added", async () => {
    render(<AddBookForm onAdd={() => null} />);
    await fillAndSubmit();
    expect(screen.getByLabelText("Title")).toHaveValue("");
    expect(screen.getByLabelText("Author")).toHaveValue("");
    expect(screen.getByLabelText("Book genre")).toHaveValue("fantasy");
    expect(screen.getByLabelText("Rating")).toHaveValue("0");
    expect(screen.queryByRole("alert")).toBeNull();
  });

  test("shows the error in an alert and keeps the input", async () => {
    render(
      <AddBookForm onAdd={() => "This book is already on your shelf."} />
    );
    await fillAndSubmit();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "This book is already on your shelf."
    );
    expect(screen.getByLabelText("Title")).toHaveValue("Emma");
  });
});
