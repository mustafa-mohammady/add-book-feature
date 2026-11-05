type EmptyShelfProps = {
  /** The current search text; when set, the message names it. */
  query?: string;
};

export default function EmptyShelf({ query = "" }: EmptyShelfProps) {
  const trimmed = query.trim();
  return (
    <p role="status" className="empty-shelf">
      {trimmed === "" ? "No books found." : `No books match "${trimmed}".`}
    </p>
  );
}
