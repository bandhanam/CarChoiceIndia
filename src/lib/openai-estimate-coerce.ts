import type { CarMarketEstimate } from "@/types/openai-car-estimate";

function isRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

export function coerceCarMarketEstimate(
  data: unknown
): CarMarketEstimate | null {
  if (!isRecord(data)) return null;
  const min = Number(data.estimatedExShowroomMinInr);
  const max = Number(data.estimatedExShowroomMaxInr);
  if (!Number.isFinite(min) || !Number.isFinite(max) || min <= 0 || max < min)
    return null;
  const highlights = Array.isArray(data.highlights)
    ? data.highlights.filter((x) => typeof x === "string").slice(0, 8)
    : [];
  const featureNotes = Array.isArray(data.featureNotes)
    ? data.featureNotes.filter((x) => typeof x === "string").slice(0, 8)
    : [];
  const disclaimer =
    typeof data.disclaimer === "string"
      ? data.disclaimer
      : "AI-generated estimate only; confirm with an authorised dealer.";
  return {
    disclaimer,
    currency: "INR",
    estimatedExShowroomMinInr: Math.round(min),
    estimatedExShowroomMaxInr: Math.round(max),
    highlights,
    featureNotes,
    confidenceNote:
      typeof data.confidenceNote === "string"
        ? data.confidenceNote
        : "Model knowledge may be incomplete or outdated.",
    asOfHint:
      typeof data.asOfHint === "string"
        ? data.asOfHint
        : "Approximate for India ex-showroom discussion.",
  };
}
