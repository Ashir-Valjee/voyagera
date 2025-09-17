export function computeMinutesBetween(startIso, endIso) {
  const a = new Date(startIso);
  const b = new Date(endIso);
  if (isNaN(a) || isNaN(b)) return 0;
  return Math.max(0, Math.round((b - a) / 60000));
}

export function formatMinutes(mins) {
  if (!mins) return "";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h ? (m ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
}

export function stopLabel(n) {
  if (n === 0) return "non-stop";
  if (n == null) return null;
  return `${n} stop${n === 1 ? "" : "s"}`;
}

export function prettyWhen(s) {
  if (!s) return "";

  const d = new Date(s);
  if (!isNaN(d)) {
    return d.toLocaleString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  try {
    const [y, m, dd] = s.split("-");
    return new Date(Number(y), Number(m) - 1, Number(dd)).toLocaleDateString(
      undefined,
      { weekday: "short", year: "numeric", month: "short", day: "numeric" }
    );
  } catch {
    return s;
  }
}

export function toUtcIso(dateStr, endOfDay = false) {
  if (!dateStr) return null;
  return endOfDay ? `${dateStr}T23:59:59Z` : `${dateStr}T00:00:00Z`;
}

export function pad(n) {
  return String(n).padStart(2, "0");
}
export function ymdFromDate(d) {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(
    d.getUTCDate()
  )}`;
}
export function dayStartZ(ymd) {
  return `${ymd}T00:00:00Z`;
}
export function dayEndZ(ymd) {
  return `${ymd}T23:59:59Z`;
}
export function addDaysYMD(ymd, days) {
  const d = new Date(`${ymd}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return ymdFromDate(d);
}

export function isIataCode(s) {
  return /^[A-Za-z]{3}$/.test(s || "");
}

export function resolveCityName(destinationParam, cities) {
  if (!destinationParam) return null;
  const destRaw = destinationParam.trim();
  const destUpper = destRaw.toUpperCase();
  const destLower = destRaw.toLowerCase();

  if (isIataCode(destRaw)) {
    const byIata = cities.find(
      (c) => (c.iataCode || "").toUpperCase() === destUpper
    );
    if (byIata?.city) return byIata.city;
  }

  const byName = cities.find((c) => (c.city || "").toLowerCase() === destLower);
  if (byName?.city) return byName.city;

  return destRaw;
}

// local tiny helper: ensure a DateTime string for our mutation
export function ensureDateTimeZ(s) {
  if (!s) return null;
  if (!s.includes("T")) return `${s}T12:00:00Z`;
  return s.endsWith("Z") ? s : `${s}Z`;
}

/** Map Ticketmaster classification -> one of our 5 UI categories (default Family). */
export function normalizeCategory(tmName) {
  const t = String(tmName || "")
    .trim()
    .toLowerCase();
  if (t.startsWith("music")) return "Music";
  if (t.startsWith("sport")) return "Sports";
  if (t.startsWith("arts")) return "Arts"; // "Arts & Theatre"
  if (t.includes("theatre") || t.includes("theater")) return "Arts";
  if (t === "film" || t.startsWith("movie") || t.includes("cinema"))
    return "Film";
  if (t === "family") return "Family";
  // everything else buckets into Family
  return "Family";
}

/** Map our UI filter back to Ticketmaster segment for the query. */
export function toTicketmasterFilter(uiCategory) {
  switch (uiCategory) {
    case "Arts":
      return "Arts & Theatre";
    case "Music":
    case "Sports":
    case "Film":
    case "Family":
      return uiCategory;
    default:
      return undefined; // All
  }
}

function seededUnit(str) {
  let h = 2166136261; // FNV-1a
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000; // 0..0.9999
}

function guessCurrencyByCountryCode(cc) {
  if (!cc) return "GBP";
  switch (cc.toUpperCase()) {
    case "GB":
      return "GBP";
    case "US":
      return "USD";
    case "CA":
      return "CAD";
    case "AU":
      return "AUD";
    case "NZ":
      return "NZD";
    case "JP":
      return "JPY";
    case "KR":
      return "KRW";
    case "SG":
      return "SGD";
    case "CH":
      return "CHF";
    case "SE":
      return "SEK";
    case "NO":
      return "NOK";
    case "DK":
      return "DKK";
    case "CZ":
      return "CZK";
    case "PL":
      return "PLN";
    case "HU":
      return "HUF";
    case "IL":
      return "ILS";
    case "IN":
      return "INR";
    case "TH":
      return "THB";
    case "VN":
      return "VND";
    case "MY":
      return "MYR";
    case "ID":
      return "IDR";
    case "PH":
      return "PHP";
    case "BR":
      return "BRL";
    case "MX":
      return "MXN";
    case "ZA":
      return "ZAR";
    default:
      return "EUR";
  }
}

const ESTIMATE_RANGES = {
  Music: [30, 120],
  Sports: [25, 140],
  Arts: [15, 80],
  Film: [10, 25],
  Family: [10, 60],
};

export function estimatePriceForEvent(uiCategory, countryCode, seedKey) {
  const [lo, hi] = ESTIMATE_RANGES[uiCategory] || ESTIMATE_RANGES.Family;
  const t = seededUnit(seedKey || "seed");
  const amt = Math.round((lo + t * (hi - lo)) * 100) / 100; // 2dp
  return { amount: amt, currency: guessCurrencyByCountryCode(countryCode) };
}

export function toEpochMillis(s) {
  if (!s) return Number.POSITIVE_INFINITY;
  if (s.includes("T")) {
    const d = new Date(s);
    return isNaN(d) ? Number.POSITIVE_INFINITY : d.getTime();
  }
  // handle YYYY-MM-DD (treat as start of day UTC)
  try {
    const [y, m, d] = s.split("-").map(Number);
    return Date.UTC(y, (m || 1) - 1, d || 1, 0, 0, 0, 0);
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}
