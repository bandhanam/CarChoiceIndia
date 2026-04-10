import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { CarsDataset } from "@/types";
import { isValidCarsDataset } from "@/lib/car-dataset-utils";

const LOCAL = join(process.cwd(), "public", "data", "cars.json");

export async function loadCarsDataset(): Promise<CarsDataset> {
  const remote = process.env.CAR_DATA_JSON_URL?.trim();
  if (remote) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 20_000);
      const res = await fetch(remote, {
        signal: ctrl.signal,
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      clearTimeout(t);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: unknown = await res.json();
      if (isValidCarsDataset(data)) return data;
    } catch {
      /* fall through to local */
    }
  }

  const raw = await readFile(LOCAL, "utf8");
  const data: unknown = JSON.parse(raw);
  if (!isValidCarsDataset(data)) {
    throw new Error("Invalid local cars.json");
  }
  return data;
}
