import type { ReactNode } from "react";
import type { Book } from "../../types";

type BookCardProps = {
  book: Book;
  onToggleRead: () => void;
  onRemove: () => void;
};

/** Decorative line icon; the button's aria-label carries its accessible name. */
function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

const checkIcon = (
  <Icon>
    <circle cx="12" cy="12" r="9" />
    <path d="m8 12 3 3 5-6" />
  </Icon>
);

const undoIcon = (
  <Icon>
    <path d="M9 14 4 9l5-5" />
    <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
  </Icon>
);

const trashIcon = (
  <Icon>
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" />
  </Icon>
);

export default function BookCard({
  book,
  onToggleRead,
  onRemove,
}: BookCardProps) {
  return (
    <li className={book.isRead ? "book read" : "book"}>
      <div>
        <h3>{book.title}</h3>
        <p>
          {book.author} · {book.genre}
        </p>
        <p
          aria-label={
            book.rating > 0 ? `Rating: ${book.rating} of 5` : "Not rated"
          }
        >
          {book.rating > 0 ? "★".repeat(book.rating) : "not rated"}
        </p>
      </div>
      <div className="actions">
        <button
          type="button"
          onClick={onToggleRead}
          aria-label={
            book.isRead
              ? `Mark ${book.title} as unread`
              : `Mark ${book.title} as read`
          }
          title={book.isRead ? "Mark as unread" : "Mark as read"}
        >
          {book.isRead ? undoIcon : checkIcon}
        </button>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${book.title}`}
          title="Remove"
        >
          {trashIcon}
        </button>
      </div>
    </li>
  );
}
