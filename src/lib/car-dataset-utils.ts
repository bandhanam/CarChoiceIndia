import type { Car, BrandMeta, BrandGroup, CarsDataset } from "@/types";

export function isValidCarsDataset(data: unknown): data is CarsDataset {
  if (data === null || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  if (!Array.isArray(d.cars) || !Array.isArray(d.brands)) return false;
  if (d.cars.length === 0) return false;
  const c0 = d.cars[0] as Record<string, unknown>;
  return typeof c0?.id === "string" && typeof c0?.brand === "string";
}

export function getBrandGroupsFrom(
  cars: Car[],
  brands: BrandMeta[]
): BrandGroup[] {
  return brands
    .map((brand) => ({
      brand,
      cars: cars.filter((c) => c.brand === brand.name),
    }))
    .filter((g) => g.cars.length > 0);
}

export function getAllBrandNamesFrom(
  cars: Car[],
  brands: BrandMeta[]
): string[] {
  const fromData = brands.map((b) => b.name);
  const fromCars = cars.map((c) => c.brand);
  return [...new Set([...fromData, ...fromCars])];
}

export function datasetFingerprint(d: CarsDataset): string {
  return `${d.version ?? ""}|${d.lastUpdated ?? ""}`;
}
