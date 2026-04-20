import { Car, CarsDataset, BrandMeta, BrandGroup } from "@/types";
import carsJson from "../../public/data/cars.json";
import {
  getBrandGroupsFrom,
  getAllBrandNamesFrom,
  datasetFingerprint,
} from "./car-dataset-utils";

const dataset = carsJson as CarsDataset;

export { getBrandGroupsFrom, getAllBrandNamesFrom, datasetFingerprint };

export const STARTING_TRIM_LABEL = "Starting trim";

export const CARS: Car[] = dataset.cars;
export const BRANDS: BrandMeta[] = dataset.brands;

export const BRAND_LOGOS: Record<string, string> = {
  Tata: "/images/brands/Tata.jpeg",
  Hyundai: "/images/brands/hyundai.jpeg",
  Mahindra: "/images/brands/mahinda.jpeg",
  "Maruti Suzuki": "/images/brands/Maruti Suzuki.jpeg",
  Kia: "/images/brands/kia.jpeg",
  Toyota: "/images/brands/Toyota.jpeg",
  Honda: "/images/brands/Honda.jpeg",
  Skoda: "/images/brands/skoda.jpeg",
  Volkswagen: "/images/brands/valksvegon.jpeg",
  Renault: "/images/brands/renault.jpeg",
  "MG Motor":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Mg_logo.svg/250px-Mg_logo.svg.png",
  Citroen: "/images/brands/citroen.jpeg",
  Nissan: "/images/brands/nissan.jpeg",
};

export function getCarById(id: string): Car | undefined {
  return CARS.find((car) => car.id === id);
}

export function getBrandGroups(): BrandGroup[] {
  return getBrandGroupsFrom(CARS, BRANDS);
}

export function getAllBrandNames(): string[] {
  const base = getAllBrandNamesFrom(CARS, BRANDS);
  const fromLogos = Object.keys(BRAND_LOGOS);
  return [...new Set([...base, ...fromLogos])];
}

export function getBrandMeta(brandName: string): BrandMeta | undefined {
  return BRANDS.find((b) => b.name === brandName);
}

export function formatPrice(price: number): string {
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(2)} Cr`;
  }
  if (price >= 100000) {
    return `₹${(price / 100000).toFixed(2)} Lakh`;
  }
  return `₹${price.toLocaleString("en-IN")}`;
}
