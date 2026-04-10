import { NextResponse } from "next/server";
import { loadCarsDataset } from "./load-dataset";

export const runtime = "nodejs";

/**
 * Full dataset. CDN-friendly cache when deployed; remote URL uses env CAR_DATA_JSON_URL.
 */
export async function GET() {
  try {
    const d = await loadCarsDataset();
    return NextResponse.json(d, {
      headers: {
        "Cache-Control":
          "public, s-maxage=1800, stale-while-revalidate=86400",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load car dataset" },
      { status: 500 }
    );
  }
}
