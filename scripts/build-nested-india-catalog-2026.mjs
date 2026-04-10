/**
 * Builds nested Manufacturer → Car (model) → Variant JSON for India, 2026 snapshot.
 * Reads public/data/cars.json + scripts/nested-catalog-facelift-overrides.json
 *
 * Run: node scripts/build-nested-india-catalog-2026.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const carsPath = join(root, "public", "data", "cars.json");
const overridesPath = join(__dirname, "nested-catalog-facelift-overrides.json");
const outPath = join(root, "public", "data", "indian-nested-auto-catalog-2026.json");

/** @type {Record<string, { companyLegalName: string; countryOfOrigin: string }>} */
const MANUFACTURER_META = {
  Tata: {
    companyLegalName: "Tata Motors Passenger Vehicles Limited",
    countryOfOrigin: "India",
  },
  Hyundai: {
    companyLegalName: "Hyundai Motor India Limited",
    countryOfOrigin: "South Korea",
  },
  Mahindra: {
    companyLegalName: "Mahindra & Mahindra Limited",
    countryOfOrigin: "India",
  },
  "Maruti Suzuki": {
    companyLegalName: "Maruti Suzuki India Limited",
    countryOfOrigin: "Japan",
  },
  "MG Motor": {
    companyLegalName: "MG Motor India Private Limited",
    countryOfOrigin: "China",
  },
  Kia: {
    companyLegalName: "Kia India Private Limited",
    countryOfOrigin: "South Korea",
  },
  Toyota: {
    companyLegalName: "Toyota Kirloskar Motor Private Limited",
    countryOfOrigin: "Japan",
  },
  Honda: {
    companyLegalName: "Honda Cars India Limited",
    countryOfOrigin: "Japan",
  },
  Skoda: {
    companyLegalName: "Škoda Auto Volkswagen India Private Limited",
    countryOfOrigin: "Czech Republic",
  },
  Volkswagen: {
    companyLegalName: "Škoda Auto Volkswagen India Private Limited",
    countryOfOrigin: "Germany",
  },
  Renault: {
    companyLegalName: "Renault India Private Limited",
    countryOfOrigin: "France",
  },
};

function slug(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function manufacturerId(brandName) {
  return slug(brandName);
}

const dataset = JSON.parse(readFileSync(carsPath, "utf8"));
const cars = dataset.cars || [];
const overrides = JSON.parse(readFileSync(overridesPath, "utf8"));

/** @type {Map<string, object[]>} */
const byBrand = new Map();
for (const car of cars) {
  const b = car.brand;
  if (!byBrand.has(b)) byBrand.set(b, []);
  byBrand.get(b).push(car);
}

const manufacturers = [...byBrand.entries()]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([brandName, brandCars]) => {
    const meta = MANUFACTURER_META[brandName] || {
      companyLegalName: `${brandName} (India)`,
      countryOfOrigin: "—",
    };
    return {
      id: manufacturerId(brandName),
      companyLegalName: meta.companyLegalName,
      brandDisplayName: brandName,
      countryOfOrigin: meta.countryOfOrigin,
      cars: brandCars
        .sort((x, y) => x.model.localeCompare(y.model))
        .map((car) => {
          const o = overrides[car.id] || {};
          const isFacelift = Boolean(o.isFacelift);
          const isNewGeneration = o.isNewGeneration === true;
          const modelYear =
            typeof o.modelYear === "number" ? o.modelYear : car.year;
          const variants = (car.variants || []).map((v) => ({
            id: `${car.id}__${slug(v.name)}`,
            trimName: v.name,
            exShowroomPriceInr: v.price,
            currency: car.currency || "INR",
            features: {
              inheritsFromModel: true,
              trimSpecific: {
                safety: [],
                comfort: [],
                technology: [],
                exterior: [],
              },
            },
          }));

          return {
            id: car.id,
            modelName: car.model,
            marketingName: car.name,
            category: car.category,
            bodyType: car.bodyType || car.category,
            modelYear,
            isFacelift,
            faceliftYear: o.faceliftYear ?? null,
            faceliftNotes: o.notes ?? null,
            isNewGeneration,
            description: car.description,
            seatingCapacity: car.seatingCapacity,
            colorsAvailable: car.colors || [],
            imageUrl: car.imageUrl,
            specifications: {
              engineOrMotor: car.specs.engine,
              horsepower: car.specs.horsepower,
              torque: car.specs.torque,
              transmission: car.specs.transmission,
              drivetrain: car.specs.drivetrain,
              fuelType: car.specs.fuelType,
              mileageKmplOrRangeKm:
                car.specs.fuelType === "Electric"
                  ? { unit: "km_range_ARAI", value: car.specs.mileage }
                  : { unit: "kmpl", value: car.specs.mileage },
              acceleration0to100Sec: car.specs.acceleration,
              topSpeedKmph: car.specs.topSpeed,
            },
            features: {
              safety: car.features.safety,
              comfort: car.features.comfort,
              technology: car.features.technology,
              exterior: car.features.exterior,
            },
            variants,
            ratingsEditorial: car.ratings,
          };
        }),
    };
  });

const output = {
  meta: {
    schemaVersion: "2.0",
    market: "India",
    currency: "INR",
    lastUpdated: new Date().toISOString(),
    dataModelYearLabel: "2026",
    totalManufacturers: manufacturers.length,
    totalCarLines: cars.length,
    totalVariants: manufacturers.reduce(
      (acc, m) =>
        acc +
        m.cars.reduce((a, c) => a + (c.variants?.length || 0), 0),
      0
    ),
    sourcesNote:
      "Facelift flags for select models cross-checked with Indian automotive media (e.g. HT Auto, Autocar India, IndiaCarNews) for early-2026 launches. All other isFacelift values default to false unless listed in nested-catalog-facelift-overrides.json — extend that file and re-run this script.",
    disclaimer:
      "Indicative specifications and ex-showroom prices for comparison and app use only. Always confirm variant, price, and equipment with the manufacturer or authorised dealer before purchase.",
  },
  manufacturers,
};

writeFileSync(outPath, JSON.stringify(output, null, 2), "utf8");
console.log(
  `Wrote ${manufacturers.length} manufacturers, ${cars.length} car lines → ${outPath}`
);
