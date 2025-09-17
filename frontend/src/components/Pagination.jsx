export default function Pagination({
  page,
  pageCount,
  total,
  pageSize,
  onChange,
  className = "",
}) {
  if (!total || total <= pageSize) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);
  const canPrev = page > 1;
  const canNext = page < pageCount;

  return (
    <div
      className={`flex items-center justify-between flex-wrap gap-3 ${className}`}
    >
      <div className="text-sm opacity-70">
        Showing <strong>{start}</strong>–<strong>{end}</strong> of{" "}
        <strong>{total}</strong>
      </div>

      <div className="join">
        <button
          className="btn btn-sm join-item"
          onClick={() => onChange(1)}
          disabled={!canPrev}
          aria-label="First page"
        >
          «
        </button>
        <button
          className="btn btn-sm join-item"
          onClick={() => onChange(page - 1)}
          disabled={!canPrev}
          aria-label="Previous page"
        >
          Prev
        </button>
        <span className="join-item px-3 text-sm">
          Page {page} / {pageCount}
        </span>
        <button
          className="btn btn-sm join-item"
          onClick={() => onChange(page + 1)}
          disabled={!canNext}
          aria-label="Next page"
        >
          Next
        </button>
        <button
          className="btn btn-sm join-item"
          onClick={() => onChange(pageCount)}
          disabled={!canNext}
          aria-label="Last page"
        >
          »
        </button>
      </div>
    </div>
  );
}
