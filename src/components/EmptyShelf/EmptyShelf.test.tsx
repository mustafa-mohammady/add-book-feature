import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import EmptyShelf from ".";

describe("EmptyShelf", () => {
  test("shows 'No books found.' when there is no search query", () => {
    render(<EmptyShelf />);
    expect(screen.getByRole("status")).toHaveTextContent("No books found.");
  });

  test("treats a blank query like no query", () => {
    render(<EmptyShelf query="   " />);
    expect(screen.getByRole("status")).toHaveTextContent("No books found.");
  });

  test("names the search query that matched no book", () => {
    render(<EmptyShelf query="  dune " />);
    expect(screen.getByRole("status")).toHaveTextContent(
      'No books match "dune".'
    );
  });

  test("does not render a heading", () => {
    render(<EmptyShelf query="dune" />);
    expect(screen.queryByRole("heading")).toBeNull();
  });
});
