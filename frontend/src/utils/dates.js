export function toYMD(input) {
  if (!input) return null;

  if (typeof input === "string") {
    const m = input.match(/^(\d{4}-\d{2}-\d{2})/);
    return m ? m[1] : null;
  }

  if (input instanceof Date && !isNaN(input)) {
    const y = input.getFullYear();
    const m = String(input.getMonth() + 1).padStart(2, "0");
    const d = String(input.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  return null;
}

const pad = (n) => String(n).padStart(2, "0");
const hasTZ = (s) => /[zZ]|[+-]\d{2}:\d{2}$/.test(s);

/**
 * Format an ISO-ish datetime into "YYYY-MM-DD HH:mm".
 * - If the string has a timezone (Z or ±hh:mm), we parse with Date and format in local time by default.
 * - If it has no timezone, we avoid Date parsing quirks and just slice the string.
 *
 * @param {string|Date} input
 * @param {{ tz?: "local"|"utc" }} opts
 */
export function formatIsoToYMDHM(input, { tz = "local" } = {}) {
  if (!input) return null;

  if (input instanceof Date && !isNaN(input)) {
    const y = tz === "utc" ? input.getUTCFullYear() : input.getFullYear();
    const m = tz === "utc" ? input.getUTCMonth() + 1 : input.getMonth() + 1;
    const d = tz === "utc" ? input.getUTCDate() : input.getDate();
    const hh = tz === "utc" ? input.getUTCHours() : input.getHours();
    const mm = tz === "utc" ? input.getUTCMinutes() : input.getMinutes();
    return `${y}-${pad(m)}-${pad(d)} ${pad(hh)}:${pad(mm)}`;
  }

  if (typeof input !== "string") return null;

  if (hasTZ(input)) {
    const dt = new Date(input);
    if (isNaN(dt)) return null;
    return formatIsoToYMDHM(dt, { tz });
  }

  const [datePart, timePart = ""] = input.split("T");
  if (!datePart) return null;
  const hm = timePart.slice(0, 5);
  return hm ? `${datePart} ${hm}` : `${datePart} 00:00`;
}

export function formatIsoRangeToYMDHM(rangeOrStart, end, opts) {
  let startStr, endStr;
  if (typeof rangeOrStart === "string" && rangeOrStart.includes("→")) {
    const [a, b] = rangeOrStart.split("→").map((s) => s.trim());
    startStr = a;
    endStr = b;
  } else {
    startStr = rangeOrStart;
    endStr = end;
  }
  const a = formatIsoToYMDHM(startStr, opts);
  const b = formatIsoToYMDHM(endStr, opts);
  return a && b ? `${a} → ${b}` : a || b || null;
}
