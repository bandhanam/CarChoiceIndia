import { NextResponse } from "next/server";
import { loadCarsDataset } from "../load-dataset";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Tiny payload for idle-time freshness checks (~100 bytes).
 */
export async function GET() {
  try {
    const d = await loadCarsDataset();
    return NextResponse.json(
      {
        version: d.version,
        lastUpdated: d.lastUpdated,
        carCount: d.cars.length,
        brandCount: d.brands.length,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to load car dataset meta" },
      { status: 500 }
    );
  }
}
