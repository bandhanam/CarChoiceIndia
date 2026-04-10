/**
 * Builds public/data/indian-cars-catalog.json from:
 * - scripts/indian-catalog-source.json (extra India-market models)
 * - public/data/cars.json (detailed profiles — merged in so one catalog is complete)
 *
 * Run: node scripts/build-indian-catalog.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const sourcePath = join(__dirname, "indian-catalog-source.json");
const carsPath = join(root, "public", "data", "cars.json");
const outPath = join(root, "public", "data", "indian-cars-catalog.json");

function norm(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

function catalogKey(brand, model) {
  return `${norm(brand)}|${norm(model)}`;
}

/** @param {object} car */
function variantsFromCar(car) {
  const list = car.variants;
  if (!Array.isArray(list) || list.length === 0) return [];
  return list.map((v) => ({
    name: String(v.name || "").trim(),
    price: Number(v.price) || 0,
  })).filter((v) => v.name && v.price > 0);
}

const sourceEntries = JSON.parse(readFileSync(sourcePath, "utf8"));
const carsDataset = JSON.parse(readFileSync(carsPath, "utf8"));
const cars = carsDataset.cars || [];

if (!Array.isArray(sourceEntries) || sourceEntries.length === 0) {
  console.error("indian-catalog-source.json must be a non-empty array");
  process.exit(1);
}

const keysFromSource = new Set(
  sourceEntries.map((e) => catalogKey(e.brand, e.model))
);

/** @type {Map<string, object>} */
const byId = new Map();

for (const e of sourceEntries) {
  const base = { ...e, hasDetailedProfile: false };
  if (!Array.isArray(base.variants)) delete base.variants;
  byId.set(e.id, base);
}

for (const car of cars) {
  const key = catalogKey(car.brand, car.model);
  const variantPrices = (car.variants || []).map((v) => v.price).filter(Boolean);
  const minP =
    variantPrices.length > 0 ? Math.min(...variantPrices, car.price) : car.price;
  const maxP =
    variantPrices.length > 0 ? Math.max(...variantPrices, car.price) : car.price;

  const variants = variantsFromCar(car);

  const fromCar = {
    id: car.id,
    brand: car.brand,
    model: car.model,
    modelYear: car.year,
    segment: car.category || "Car",
    fuelTypes: [car.specs?.fuelType || "Petrol"].filter(Boolean),
    priceMinInr: minP,
    priceMaxInr: maxP,
    status: "on_sale",
    hasDetailedProfile: true,
    ...(variants.length > 0 ? { variants } : {}),
  };

  if (keysFromSource.has(key)) {
    const existing = sourceEntries.find(
      (e) => catalogKey(e.brand, e.model) === key
    );
    if (existing) {
      const cur = byId.get(existing.id);
      if (cur) {
        const next = {
          ...cur,
          hasDetailedProfile: true,
          priceMinInr: Math.min(cur.priceMinInr || minP, minP),
          priceMaxInr: Math.max(cur.priceMaxInr || maxP, maxP),
          modelYear: Math.max(cur.modelYear || 0, car.year),
        };
        if (variants.length > 0) next.variants = variants;
        byId.set(existing.id, next);
      }
    }
    continue;
  }

  if (!byId.has(car.id)) {
    byId.set(car.id, fromCar);
  }
}

const merged = [...byId.values()].sort((a, b) => {
  const ba = a.brand.localeCompare(b.brand);
  if (ba !== 0) return ba;
  return a.model.localeCompare(b.model);
});

const ids = merged.map((e) => e.id);
const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
if (dup.length) {
  console.error("Duplicate catalog ids:", [...new Set(dup)].join(", "));
  process.exit(1);
}

const catalog = {
  version: "1.0.0",
  lastUpdated: new Date().toISOString(),
  currency: "INR",
  disclaimer:
    "Indicative ex-showroom India price ranges (min–max across variants where applicable). The variants array lists trim names and prices when sourced from cars.json; other catalog rows may omit variants until you add them in indian-catalog-source.json. Verify before purchase.",
  entryCount: merged.length,
  detailedProfileCount: merged.filter((e) => e.hasDetailedProfile).length,
  entries: merged,
};

writeFileSync(outPath, JSON.stringify(catalog, null, 2), "utf8");
console.log(
  `Wrote ${merged.length} catalog entries (${catalog.detailedProfileCount} with full profiles in app) → ${outPath}`
);
