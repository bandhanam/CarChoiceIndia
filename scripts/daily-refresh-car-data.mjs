/**
 * Daily data refresh (run in CI or locally).
 * 1) Optionally downloads cars.json from CAR_DATA_JSON_URL into public/data/cars.json
 * 2) Rebuilds indian-cars-catalog.json and indian-nested-auto-catalog-2026.json
 *
 * Env:
 *   CAR_DATA_JSON_URL — HTTPS URL returning full CarsDataset JSON (optional)
 */
import { writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const carsPath = join(root, "public", "data", "cars.json");

const remote = process.env.CAR_DATA_JSON_URL?.trim();
if (remote) {
  console.log("Fetching cars dataset from CAR_DATA_JSON_URL…");
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 60_000);
  const res = await fetch(remote, {
    signal: ctrl.signal,
    headers: { Accept: "application/json" },
  });
  clearTimeout(t);
  if (!res.ok) {
    console.error("Fetch failed:", res.status);
    process.exit(1);
  }
  const data = await res.json();
  if (!data?.cars?.length || !data?.brands?.length) {
    console.error("Invalid dataset: need cars[] and brands[]");
    process.exit(1);
  }
  writeFileSync(carsPath, JSON.stringify(data, null, 2), "utf8");
  console.log("Wrote public/data/cars.json from remote.");
} else {
  console.log("CAR_DATA_JSON_URL not set — keeping existing public/data/cars.json");
}

function runNode(scriptFile) {
  const r = spawnSync(process.execPath, [scriptFile], {
    cwd: root,
    stdio: "inherit",
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

runNode(join(root, "scripts", "build-indian-catalog.mjs"));
runNode(join(root, "scripts", "build-nested-india-catalog-2026.mjs"));
console.log("Catalog rebuild complete.");
