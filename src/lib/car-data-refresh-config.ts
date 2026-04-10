/**
 * Client-side config for dynamic car data (set at build time via NEXT_PUBLIC_*).
 */
function readPollMs(): number {
  if (typeof process === "undefined" || !process.env.NEXT_PUBLIC_CAR_DATA_POLL_MS) {
    return 0;
  }
  const n = Number.parseInt(process.env.NEXT_PUBLIC_CAR_DATA_POLL_MS, 10);
  return Number.isFinite(n) && n >= 60_000 ? n : 0;
}

/** Poll interval in ms (min 60s). 0 = no polling. */
export const CAR_DATA_POLL_MS = readPollMs();

/** Shown unless explicitly disabled with NEXT_PUBLIC_SHOW_CAR_DATA_REFRESH_BUTTON=false */
export const CAR_DATA_SHOW_REFRESH_BUTTON =
  process.env.NEXT_PUBLIC_SHOW_CAR_DATA_REFRESH_BUTTON !== "false";
