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
