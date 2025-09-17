import { useEffect, useMemo, useRef, useState } from "react";

export default function CityAutocomplete({
  id,
  label,
  placeholder = "Type city or IATA (e.g. London or LON)",
  value,
  onChange,
  cities = [],
  onResolved,
  error = "",
  required = false,
}) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  function norm(s) {
    return (s || "").trim().toLowerCase();
  }
  function looksLikeIata(s) {
    return /^[A-Za-z]{3}$/.test((s || "").trim());
  }

  const resolvedIata = useMemo(() => {
    const raw = (value || "").trim();
    if (!raw) return null;

    if (looksLikeIata(raw)) {
      const code = raw.toUpperCase();
      const exists = cities.some(
        (c) => (c.iataCode || "").toUpperCase() === code
      );
      return exists ? code : null;
    }

    const m = raw.match(/^([^,()]+?)(?:\s*,\s*([^()]+))?$/);
    const cityPart = norm(m?.[1] || raw);
    const countryPart = norm(m?.[2] || "");

    let matches = cities.filter((c) => norm(c.city) === cityPart);
    if (countryPart) {
      matches = matches.filter((c) => norm(c.country) === countryPart);
    }
    const withCode = matches.find((c) => !!c.iataCode);
    return withCode ? withCode.iataCode.toUpperCase() : null;
  }, [value, cities]);

  useEffect(() => {
    if (!onResolved) return;
    if (!value) {
      onResolved(null, null);
      return;
    }
    const code = resolvedIata;
    if (code) {
      const match =
        cities.find(
          (c) => (c.iataCode || "").toUpperCase() === code.toUpperCase()
        ) || null;
      onResolved(code, match);
    } else {
      onResolved(null, null);
    }
  }, [value, resolvedIata, cities, onResolved]);

  const suggestions = useMemo(() => {
    const q = norm(value);
    if (!q) return [];
    const out = cities
      .filter((c) => {
        const city = norm(c.city);
        const country = norm(c.country);
        const code = (c.iataCode || "").toLowerCase();
        return (
          city.includes(q) ||
          country.includes(q) ||
          (!!code && code.includes(q))
        );
      })
      .sort((a, b) => a.city.localeCompare(b.city))
      .slice(0, 12);
    return out;
  }, [value, cities]);

  useEffect(() => {
    function handleDocClick(e) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) {
        setOpen(false);
        setHighlight(-1);
      }
    }
    document.addEventListener("mousedown", handleDocClick);
    return () => document.removeEventListener("mousedown", handleDocClick);
  }, []);

  function chooseSuggestion(item) {
    const label = `${item.city}, ${item.country}`;
    onChange(label);

    if (onResolved) onResolved(item.iataCode || null, item);
    setOpen(false);
    setHighlight(-1);

    inputRef.current?.focus();
  }

  function onKeyDown(e) {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) =>
        Math.min(suggestions.length - 1, (h < 0 ? -1 : h) + 1)
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(-1, h - 1));
    } else if (e.key === "Enter") {
      if (highlight >= 0 && suggestions[highlight]) {
        e.preventDefault();
        chooseSuggestion(suggestions[highlight]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setHighlight(-1);
    }
  }

  const hasError = !!error;
  const showBadge = !!resolvedIata;

  return (
    <div className="w-full" ref={wrapRef}>
      <label className="label mb-1 text-sm font-medium text-gray-700" htmlFor={id}>
        <span className="label-text">{label}</span>
        {value ? (
          showBadge ? (
            <span className="badge badge-success badge-sm">OK</span>
          ) : (
            <span className="badge badge-ghost badge-sm">Pick from list</span>
          )
        ) : null}
      </label>

      <div className="relative">
        <input
          id={id}
          ref={inputRef}
          className={`input w-full text-gray-900 ${hasError ? "input-error" : ""}`}
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          autoComplete="off"
          required={required}
        />

        {open && suggestions.length > 0 && (
          <ul
            className="menu absolute left-0 right-0 mt-2 p-2 shadow bg-base-100 rounded-box z-50
                      max-h-64 overflow-y-auto border border-base-200"
            role="listbox"
            aria-labelledby={id}
          >
            {suggestions.map((s, i) => {
              const active = i === highlight;
              return (
                <li key={`${s.country}-${s.city}-${i}`}>
                  <button
                    type="button"
                    className={`w-full justify-start ${active ? "active" : ""}`}
                    role="option"
                    aria-selected={active ? "true" : "false"}
                    onMouseEnter={() => setHighlight(i)}
                    onMouseDown={(e) => e.preventDefault()} // prevent blur before click
                    onClick={() => chooseSuggestion(s)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>
                        {s.city}, {s.country}
                      </span>
                      <span className="opacity-60">
                        {s.iataCode ? `(${s.iataCode})` : ""}
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {hasError && <p className="text-error text-xs mt-1">{error}</p>}
    </div>
  );
}
